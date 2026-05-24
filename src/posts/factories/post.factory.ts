import { Injectable } from "@nestjs/common"
import { PostEntity } from "@/posts/entities/post.entity"
import { CreatePostDto } from "@/posts/posts.dtos"

/**
 * PostFactory - Fábrica para crear instancias de PostEntity
 *
 * PROBLEMA QUE RESUELVE:
 * - Centraliza la lógica de creación de PostEntity
 * - Evita tener la lógica de inicialización esparcida en el servicio
 * - Permite cambiar cómo se crean posts sin afectar el resto del código
 *
 * RESPONSABILIDADES:
 * - Crear un PostEntity desde un DTO (datos de entrada)
 * - Crear un PostEntity desde datos de base de datos
 * - Inicializar valores por defecto
 * - Calcular campos derivados (como relevanceScore)
 */
@Injectable()
export class PostFactory {
    /**
     * Crea un PostEntity desde un CreatePostDto (cuando el usuario envía datos)
     *
     * @param dto - Datos validados del usuario
     * @param id - ID del post (asignado por la BD)
     * @param now - Timestamp actual
     * @returns PostEntity con valores iniciales
     */
    createFromDto(dto: CreatePostDto, id: number, now: Date): PostEntity {
        return new PostEntity(
            id,
            dto.title,
            dto.description,
            dto.imageUrl,
            now, // createdAt
            now, // updatedAt
            0, // likesCount inicial
            0, // commentsCount inicial
            this.calculateRelevanceScore(0, 0), // relevanceScore calculado
            false, // isFeatured - por defecto no destacado
            "api", // source - viene de la API
            this.extractTags(dto.title, dto.description), // tags extraídos automáticamente
            {}, // metadata vacío inicialmente
            "latest", // rankingMode por defecto
        )
    }

    /**
     * Crea un PostEntity desde datos de la base de datos
     * (cuando recuperas un post existente)
     *
     * @param data - Datos crudos de Prisma
     * @returns PostEntity enriquecida con lógica de negocio
     */
    createFromDatabase(data: {
        id: number
        title: string
        description: string
        imageUrl: string
        createdAt: Date
        updatedAt: Date
        likesCount?: number
        commentsCount?: number
        isFeatured?: boolean
        source?: string
        tags?: string[]
        metadata?: Record<string, unknown>
    }): PostEntity {
        const likesCount = data.likesCount ?? 0
        const commentsCount = data.commentsCount ?? 0

        return new PostEntity(
            data.id,
            data.title,
            data.description,
            data.imageUrl,
            data.createdAt,
            data.updatedAt,
            likesCount,
            commentsCount,
            this.calculateRelevanceScore(likesCount, commentsCount),
            data.isFeatured ?? false,
            data.source ?? "unknown",
            data.tags ?? [],
            data.metadata ?? {},
            "latest",
        )
    }

    /**
     * MÉTODO PRIVADO - Lógica de negocio: Calcula el score de relevancia
     *
     * Ejemplo de lógica que DEBE estar en la fábrica porque:
     * - Es lógica de creación del objeto
     * - Puede cambiar sin afectar al servicio
     *
     * Fórmula: likes + (comments × 2)
     * Los comentarios valen el doble porque requieren más engagement
     */
    private calculateRelevanceScore(likes: number, comments: number): number {
        return likes + comments * 2
    }

    /**
     * MÉTODO PRIVADO - Extrae tags automáticamente del título y descripción
     *
     * Ejemplo de lógica que pertenece a la fábrica:
     * - Es parte de cómo se CONSTRUYE el objeto
     * - No es responsabilidad del servicio
     */
    private extractTags(title: string, description: string): string[] {
        // Palabras clave frecuentes (en un caso real, buscarías en una BD)
        const keywords = [
            "javascript",
            "typescript",
            "angular",
            "react",
            "nestjs",
            "database",
            "patterns",
            "design",
            "tutorial",
            "tips",
        ]

        const text = `${title} ${description}`.toLowerCase()
        return keywords.filter((keyword) => text.includes(keyword))
    }
}
