// antes el mapper calculaba todo inline pero ahora solo hace dos cosas: contar likes/comentarios, 
// y delegar cada calculo complejo a su funcion en feed.helpers.ts

// el mapper queda enfocado exclusivamente en transformar, no en calcular.
import { PostEntity } from "@/posts/entities/post.entity"
import {
    calcIsFeatured,
    calcPostMetadata,
    calcRelevanceScore,
    calcTags,
} from "@/posts/helpers/feed.helpers"

export class PostMapper {
    // transforma un post crudo de prisma (con sus relaciones includes) a PostEntity enriquecida para el feed.
    // los calculos derivados (relevancia, tags, metadata) se delegan
    // a feed.helpers.ts para mantener este mapper enfocado en transformacion.
    static toEntity(
        post: {
            id: number
            title: string
            description: string
            imageUrl: string
            createdAt: Date
            updatedAt: Date
            likes?: { weight: number }[]
            comments?: { content: string }[]
        },
        mode: string,
    ): PostEntity {
        const likesArr = post.likes ?? [];
        const commentsArr = post.comments ?? [];
        const likesCount = likesArr.reduce(
            (sum, like) => sum + like.weight,
            0,
        );
        const commentsCount = commentsArr.length;
        const relevanceScore = calcRelevanceScore(
            likesCount,
            commentsCount,
            post.createdAt,
        );

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
            calcIsFeatured(relevanceScore),
            "feed-controller",
            calcTags(post.title),
            calcPostMetadata(likesArr, commentsArr, post.createdAt),
            mode,
        );
    }
}