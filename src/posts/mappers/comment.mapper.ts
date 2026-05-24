import { CommentEntity } from "@/posts/entities/comment.entity"
import { calcSentimentScore } from "@/posts/helpers/feed.helpers"

export class CommentMapper {
    // transforma un comentario crudo de prisma a CommentEntity

    // el calculo de sentimentScore se delega a feed.helpers.ts
    // esto para mantener este mapper enfocado en transformacion
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
            // delega el calculo de sentimiento al helper
            calcSentimentScore(comment.content.length),
            comment.content.length % 2 === 0,
            "es",
            { chars: comment.content.length, source: comment.source },
        )
    }
}