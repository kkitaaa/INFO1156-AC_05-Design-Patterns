import { Injectable } from "@nestjs/common"
import { LikeEntity } from "@/posts/entities/like.entity"
import { AddLikeDto } from "@/posts/posts.dtos"

/**
 * LikeFactory - Fábrica para crear instancias de LikeEntity
 *
 * Encapsula la lógica de creación de reacciones (likes, fires, claps)
 */
@Injectable()
export class LikeFactory {
    /**
     * Crea un LikeEntity desde un AddLikeDto
     *
     * @param postId - ID del post que recibe la reacción
     * @param dto - Datos de la reacción (tipo y peso)
     * @param id - ID de la reacción (asignado por la BD)
     * @param now - Timestamp actual
     * @returns LikeEntity
     */
    createFromDto(
        postId: number,
        dto: AddLikeDto,
        id: number,
        now: Date,
    ): LikeEntity {
        const reactionType = dto.reactionType ?? "like"
        const weight = dto.weight ?? 1

        return new LikeEntity(
            id,
            postId,
            reactionType,
            this.validateAndNormalizeWeight(weight, reactionType),
            "api", // source
            now, // createdAt
            this.getStrengthLabel(reactionType, weight), // etiqueta de fortaleza
            this.shouldAffectRelevance(reactionType), // ¿afecta el ranking?
            {}, // metadata vacío
        )
    }

    /**
     * Crea un LikeEntity desde datos de la base de datos
     */
    createFromDatabase(data: {
        id: number
        postId: number
        reactionType: string
        weight?: number
        createdAt: Date
        source?: string
        strengthLabel?: string
        shouldAffectRelevanceScore?: boolean
        metadata?: Record<string, unknown>
    }): LikeEntity {
        const weight = data.weight ?? 1

        return new LikeEntity(
            data.id,
            data.postId,
            data.reactionType,
            weight,
            data.source ?? "unknown",
            data.createdAt,
            data.strengthLabel ??
                this.getStrengthLabel(data.reactionType, weight),
            data.shouldAffectRelevanceScore ??
                this.shouldAffectRelevance(data.reactionType),
            data.metadata ?? {},
        )
    }

    /**
     * MÉTODO PRIVADO - Valida y normaliza el peso de la reacción
     *
     * Diferencia de pesos según el tipo de reacción:
     * - "like": peso máximo 1
     * - "fire": peso máximo 3 (más expresivo)
     * - "clap": peso máximo 10 (applauso múltiple)
     */
    private validateAndNormalizeWeight(
        weight: number,
        reactionType: string,
    ): number {
        const maxWeights: Record<string, number> = {
            like: 1,
            fire: 3,
            clap: 10,
        }

        const maxWeight = maxWeights[reactionType] ?? 1
        const normalized = Math.min(
            Math.max(weight, 1),
            maxWeight,
        )

        return normalized
    }

    /**
     * MÉTODO PRIVADO - Obtiene la etiqueta de fortaleza de la reacción
     */
    private getStrengthLabel(
        reactionType: string,
        weight: number,
    ): string {
        if (reactionType === "clap") {
            if (weight >= 5) return "standing-ovation"
            if (weight >= 3) return "strong-clap"
            return "single-clap"
        }

        if (reactionType === "fire") {
            if (weight === 3) return "blazing"
            return "hot"
        }

        return "like"
    }

    /**
     * MÉTODO PRIVADO - Determina si la reacción afecta el score de relevancia
     * No todos los likes afectan el ranking:
     */
    private shouldAffectRelevance(
        reactionType: string,
    ): boolean {
        return (
            reactionType === "fire" ||
            reactionType === "clap"
        )
    }
}