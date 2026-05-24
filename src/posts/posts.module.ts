import { Module } from "@nestjs/common"
import { PostsController } from "@/posts/posts.controller"
import { PostsService } from "@/posts/posts.service"
import { PostFactory } from "@/posts/factories/post.factory"
import { CommentFactory } from "@/posts/factories/comment.factory"
import { LikeFactory } from "@/posts/factories/like.factory"

@Module({
    controllers: [PostsController],
    providers: [
        // Servicios
        PostsService,

        // Factories - Encapsulamos la lógica de creación de entidades
        PostFactory,
        CommentFactory,
        LikeFactory,
    ],
})
export class PostsModule {}
