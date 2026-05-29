import {
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from "@nestjs/common"

import { CommentMapper } from "@/posts/mappers/comment.mapper"
import { LikeMapper } from "@/posts/mappers/like.mapper"
import { PostMapper } from "@/posts/mappers/post.mapper"

import { PrismaService } from "@/prisma/prisma.service"
import { PostsService } from "@/posts/posts.service"

import {
    AddLikeDto,
    CreateCommentDto,
    CreatePostDto,
    FeedQueryDto,
} from "@/posts/posts.dtos"

import { CreateCommentCommand } from "@/posts/commands/create-comment.command"
import { LikePostCommand } from "@/posts/commands/like-post.command"
import { CreatePostCommand } from "@/posts/commands/create-post.command"

@Controller("api/posts")
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly prisma: PrismaService,
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        const command = new CreatePostCommand(
            this.prisma,
            body,
        )

        const created = await command.execute()

        return {
            ok: true,
            payload: created,
        }
    }

    @Get()
    async findAll() {
        const posts = await this.postsService.findAll()

        return {
            total: posts.length,
            items: posts,
        }
    }

    @Get("feed")
    async getFeed(@Query() query: FeedQueryDto) {
        const mode = query.mode || "latest"

        const posts = await this.prisma.post.findMany({
            include: {
                comments: true,
                likes: true,
            },
        })

        // PostMapper transforma cada post crudo a PostEntity enriquecida
        const mappedPosts = posts.map((post) =>
            PostMapper.toEntity(post, mode),
        )

        let sorted = [...mappedPosts]

        switch (mode) {
            case "latest":
                sorted = sorted.sort(
                    (a, b) =>
                        b.createdAt.getTime() - a.createdAt.getTime(),
                )
                break

            case "mostLiked":
                sorted = sorted.sort(
                    (a, b) => b.likesCount - a.likesCount,
                )
                break

            case "mostCommented":
                sorted = sorted.sort(
                    (a, b) => b.commentsCount - a.commentsCount,
                )
                break

            case "relevance":
                sorted = sorted.sort(
                    (a, b) => b.relevanceScore - a.relevanceScore,
                )
                break

            default:
                sorted = sorted.sort(
                    (a, b) =>
                        b.createdAt.getTime() - a.createdAt.getTime(),
                )
                break
        }

        return {
            mode,
            count: sorted.length,
            rows: sorted,
        }
    }

    @Get(":id/comments")
    async getComments(
        @Param("id", ParseIntPipe) id: number,
    ) {
        const post = await this.postsService.findById(id)

        if (!post) {
            throw new NotFoundException("Post not found")
        }

        const comments = await this.prisma.comment.findMany({
            where: { postId: id },
            orderBy: { createdAt: "desc" },
        })

        const entities = comments.map((comment) =>
            CommentMapper.toEntity(comment),
        )

        return {
            total_comments: entities.length,
            comments: entities,
        }
    }

    @Post(":id/comments")
    async createComment(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: CreateCommentDto,
    ) {
        const post = await this.postsService.findById(id)

        if (!post) {
            throw new NotFoundException("Post not found")
        }

        const command = new CreateCommentCommand(
            this.prisma,
            id,
            body,
        )

        const created = await command.execute()

        const entity = CommentMapper.toEntity(created)

        return {
            message: "comment_created",
            entity,
        }
    }

    @Post(":id/likes")
    async addLike(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: AddLikeDto,
    ) {
        const post = await this.postsService.findById(id)

        if (!post) {
            throw new NotFoundException("Post not found")
        }

        const command = new LikePostCommand(
            this.prisma,
            id,
            body,
        )

        const like = await command.execute()

        const entity = LikeMapper.toEntity(like)

        return {
            success: true,
            like: entity,
        }
    }
}