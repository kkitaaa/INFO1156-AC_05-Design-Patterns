import { CommentEntity } from "@/posts/entities/comment.entity"

export class CommentMapper {
    // transforma un comentario crudo de prisma a CommenEntity.
    // esto es util para mantener el controller limpio y desacoplado de la estructura de datos de prisma
    // centraliza toda la logica de construccion para no repetirla en el controller.
    static toEntity(comment: {
        id: number
        postId: number
        content: string
        createdAt: Date
        updatedAt: Date
        source: string
    }): CommentEntity {
        return new CommentEntity(
            comment.id,
            comment.postId,
            comment.content,
            comment.createdAt,
            comment.updatedAt,
            comment.source,
            "approved",
            // comentarios largos tienen mayor puntaje de sentimiento
            comment.content.length > 80 ? 70 : 45,
            comment.content.length % 2 === 0,
            "es",
            { chars: comment.content.length, source: comment.source },
        )
    }
}