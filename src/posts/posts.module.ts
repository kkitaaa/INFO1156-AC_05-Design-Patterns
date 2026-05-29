import { Module } from "@nestjs/common"
import { PostsController } from "@/posts/posts.controller"
import { PostsService } from "@/posts/posts.service"
import { PostFactory } from "@/posts/factories/post.factory"
import { CommentFactory } from "@/posts/factories/comment.factory"
import { LikeFactory } from "@/posts/factories/like.factory"
import { PostRepository } from "@/posts/repositories/post.repository"
import { CommentRepository } from "@/posts/repositories/comment.repository"
import { LikeRepository } from "@/posts/repositories/like.repository"
import { FeedStrategyFactory } from "@/posts/feed-strategies/feed-strategies.factory"

@Module({
    controllers: [PostsController],
    providers: [
        // Servicios
        PostsService,

        // Factories - Encapsulamos la lógica de creación de entidades
        PostFactory,
        CommentFactory,
        LikeFactory,
        
        // Nueva Factory para el patrón Strategy
        FeedStrategyFactory,

        // Repositories - Encapsulamos acceso a datos
        PostRepository,
        CommentRepository,
        LikeRepository,
    ],
})
export class PostsModule {}