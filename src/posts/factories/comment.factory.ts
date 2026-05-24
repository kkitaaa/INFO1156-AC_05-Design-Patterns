import { Injectable } from "@nestjs/common"
import { CommentEntity } from "@/posts/entities/comment.entity"
import { CreateCommentDto } from "@/posts/posts.dtos"

/**
 * CommentFactory - Fábrica para crear instancias de CommentEntity
 *
 * Similar a PostFactory, pero para comentarios
 * Encapsula la lógica de creación y enriquecimiento de comentarios
 */
@Injectable()
export class CommentFactory {
    /**
     * Crea un CommentEntity desde un CreateCommentDto
     *
     * @param postId - ID del post al que pertenece
     * @param dto - Datos validados del usuario
     * @param id - ID del comentario (asignado por la BD)
     * @param now - Timestamp actual
     * @returns CommentEntity con valores iniciales
     */
    createFromDto(
        postId: number,
        dto: CreateCommentDto,
        id: number,
        now: Date,
    ): CommentEntity {
        return new CommentEntity(
            id,
            postId,
            dto.content,
            now, // createdAt
            now, // updatedAt
            "api", // source
            "pending", // moderationState - requiere revisión
            this.calculateSentimentScore(dto.content), // sentimentScore calculado
            false, // isPinned - no destacado por defecto
            this.detectLanguage(dto.content), // detectar idioma automáticamente
            {}, // metadata vacío
        )
    }

    /**
     * Crea un CommentEntity desde datos de la base de datos
     */
    createFromDatabase(data: {
        id: number
        postId: number
        content: string
        createdAt: Date
        updatedAt: Date
        source?: string
        moderationState?: string
        sentimentScore?: number
        isPinned?: boolean
        language?: string
        metadata?: Record<string, unknown>
    }): CommentEntity {
        return new CommentEntity(
            data.id,
            data.postId,
            data.content,
            data.createdAt,
            data.updatedAt,
            data.source ?? "unknown",
            data.moderationState ?? "pending",
            data.sentimentScore ?? this.calculateSentimentScore(data.content),
            data.isPinned ?? false,
            data.language ?? "unknown",
            data.metadata ?? {},
        )
    }

    /**
     * MÉTODO PRIVADO - Calcula sentimiento del comentario (análisis simple)
     *
     * En producción, usarías una librería como "sentiment" o una API
     */
    private calculateSentimentScore(content: string): number {
        // Palabras positivas y negativas (simplificado)
        const positive = ["great", "excellent", "awesome", "good", "love", "brilliant"]
        const negative = ["bad", "terrible", "hate", "awful", "worst", "horrible"]

        const lowerContent = content.toLowerCase()

        const positiveCount = positive.filter((word) => lowerContent.includes(word)).length
        const negativeCount = negative.filter((word) => lowerContent.includes(word)).length

        // Score entre -1 (muy negativo) y 1 (muy positivo)
        return (positiveCount - negativeCount) / (positiveCount + negativeCount || 1)
    }

    /**
     * MÉTODO PRIVADO - Detecta el idioma del comentario (simplificado)
     */
    private detectLanguage(content: string): string {
        // Muy simplificado - en producción usarías una librería como "detect-language"
        const englishWords = content.split(" ").filter((word) => /^[a-z]+$/i.test(word))
        return englishWords.length > 0 ? "en" : "unknown"
    }
}
