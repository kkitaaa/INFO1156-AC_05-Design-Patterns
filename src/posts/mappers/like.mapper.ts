import { LikeEntity } from "@/posts/entities/like.entity"

export class LikeMapper {
    // transforma un like crudo de prisma a LikeEntity
    // centralizamos la logica de etiquetado de fuerza y metadata para no repetirla en el controller.
    static toEntity(like: {
        id: number
        postId: number
        reactionType: string
        weight: number
        source: string
        createdAt: Date
    }): LikeEntity {
        return new LikeEntity(
            like.id,
            like.postId,
            like.reactionType,
            like.weight,
            like.source,
            like.createdAt,
            // likes con peso mayor a 2 se consideran reacciones fuertes
            like.weight > 2 ? "strong" : "normal",
            true,
            { from: "manual", r: like.reactionType },
        )
    }
}