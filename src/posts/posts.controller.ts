
import {
    BadRequestException,
    Body,
    Controller,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from "@nestjs/common"
import { CommentEntity } from "@/posts/entities/comment.entity"
import { LikeEntity } from "@/posts/entities/like.entity"
import { PostEntity } from "@/posts/entities/post.entity"
import { LegacyModerationAdapter } from "@/posts/moderation/legacy-moderation.adapter"
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

const logDomainEvent = (
    eventName: string,
    payload: Record<string, unknown>,
) => {
    console.log(`[event:${eventName}]`, payload)
}

const fakeSendNotification = (
    type: string,
    payload: Record<string, unknown>,
) => {
    console.log(`[notify:${type}]`, payload)
}

const fakeRecomputeSomething = (postId: number) => {
    console.log(`[recompute] postId=${postId}`)
}


@Controller("api/posts")
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly prisma: PrismaService,
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        if (body.title.length < 3 || body.title.length > 120) {
            throw new BadRequestException(
                "Title length must be between 3 and 120",
            )
        }

        if (!body.imageUrl.startsWith("http")) {
            throw new BadRequestException("Image URL must start with http")
        }

        const command = new CreatePostCommand(
            this.prisma,
            body,
        )

        const created = await command.execute()

        logDomainEvent("post.created", {
            postId: created.id,
            title: created.title,
        })
        fakeSendNotification("post", { postId: created.id })
        fakeRecomputeSomething(created.id)

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

        // PostMapper transforma cada post crudo a PostEntity enriquecida y 
        // toda la logica de calculo queda fuera del controller:
        const mappedPosts = posts.map((post) => PostMapper.toEntity(post, mode))
        let sorted = [...mappedPosts]

        // Ranking inline por modo
        // Esto define la forma de ordenar en base al filtro
        switch (mode) {
            case "latest":
                sorted = sorted.sort(
                    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
                )
                break
            case "mostLiked":
                sorted = sorted.sort((a, b) => b.likesCount - a.likesCount)
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
                    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
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
    async getComments(@Param("id", ParseIntPipe) id: number) {
        const post = await this.postsService.findById(id)
        if (!post) {
            throw new NotFoundException("Post not found")
        }

        const comments = await this.prisma.comment.findMany({
            where: { postId: id },
            orderBy: { createdAt: "desc" },
        })

        // CommentMapper transforma cada comentario crudo a CommentEntity:
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

        if (body.content.length < 2) {
            throw new BadRequestException("Comment too short")
        }

        // adapter: encapsula la logica de interpretacion de la api legacy
        const moderationAdapter = new LegacyModerationAdapter()
        const result = moderationAdapter.review(body.content)

        if (result.blocked) {
            throw new BadRequestException("Comment blocked by moderation")
        }

        const command = new CreateCommentCommand(this.prisma, id, body)
        const created = await command.execute()

        // CommentMapper transforma el comentario creado a CommentEntity
        const entity = CommentMapper.toEntity(created)

        logDomainEvent("comment.created", { postId: id, commentId: created.id })
        fakeSendNotification("comment", { postId: id })
        fakeRecomputeSomething(id)

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

        const reactionType = body.reactionType || "like"
        const weight = body.weight || 1

        if (weight < 1) {
            throw new BadRequestException("Weight must be at least 1")
        }

        const command = new LikePostCommand(this.prisma, id, body)
        const like = await command.execute()

        // LikeMapper transforma el like creado a LikeEntity:
        const entity = LikeMapper.toEntity(like)

        logDomainEvent("like.created", { postId: id, likeId: like.id })
        fakeSendNotification("like", { postId: id, reactionType })
        fakeRecomputeSomething(id)

        return {
            success: true,
            like: entity,
        }
    }
}