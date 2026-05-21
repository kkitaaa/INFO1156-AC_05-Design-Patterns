import { PostEntity } from "@/posts/entities/post.entity"

export class PostMapper {
    // transforma un post crudo de prisma (con sus relaciones includes) a PostEntity enriquecida para el feed.
    // centraliza todos los cclculos derivados como relevancia, tags y metadata, para no repetirlos inline en el controller.
    static toEntity(
        post: {
            id: number
            title: string
            description: string
            imageUrl: string
            createdAt: Date
            updatedAt: Date
            likes: { weight: number }[]
            comments: { content: string }[]
        },
        mode: string,
    ): PostEntity {
        const likesCount = post.likes.reduce(
            (sum, like) => sum + like.weight,
            0,
        )
        const commentsCount = post.comments.length

        // 36_000_00 = 1 hora en milisegundos
        const hoursSinceCreated =
            (Date.now() - new Date(post.createdAt).getTime()) / 36_000_00

        const relevanceScore =
            likesCount * 2 +
            commentsCount * 3 -
            Math.floor(hoursSinceCreated)

        // tags derivados de palabras largas del titulo
        const tags = post.title
            .split(" ")
            .filter((word) => word.length > 4)

        const metadata = {
            likesWeights: post.likes.map((like) => like.weight),
            commentLengths: post.comments.map(
                (comment) => comment.content.length,
            ),
            hourOfCreate: new Date(post.createdAt).getHours(),
        }

        return new PostEntity(
            post.id,
            post.title,
            post.description,
            post.imageUrl,
            post.createdAt,
            post.updatedAt,
            likesCount,
            commentsCount,
            relevanceScore,
            // posts con alta relevancia se marcan como destacados
            relevanceScore > 20,
            "feed-controller",
            tags,
            metadata,
            mode,
        )
    }
}