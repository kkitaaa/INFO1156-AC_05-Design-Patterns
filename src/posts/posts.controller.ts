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

import { FeedStrategyFactory } from "./feed-strategies/feed-strategies.factory"
import { LengthValidator } from "./validators/lenght.validator"
import { ModerationValidator } from "./validators/moderation.validator"
import { SpamValidator } from "./validators/spam.validator"
import { ProfanityValidator } from "./validators/profanity.validator"
import { eventManager } from "@/common/events/event-manager"

@Controller("api/posts")
export class PostsController {
    constructor(
        private readonly postsService: PostsService,
        private readonly prisma: PrismaService,
        private readonly feedStrategyFactory: FeedStrategyFactory,
    ) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        const lengthValidator = new LengthValidator()
        const moderationValidator = new ModerationValidator()
        const spamValidator = new SpamValidator()
        const profanityValidator = new ProfanityValidator()

        lengthValidator
            .setNext(moderationValidator)
            .setNext(spamValidator)
            .setNext(profanityValidator)

        await lengthValidator.handle(body)

        const command = new CreatePostCommand(this.prisma, body)
        const created = await command.execute()

        eventManager.notify("post.created", {
            postId: created.id,
            title: created.title,
        })

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

        const posts = await this.postsService.getFeed(mode)

        const strategy = this.feedStrategyFactory.getStrategy(mode)
        const sorted = strategy.sort(posts)

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

        const comments = await this.postsService.getComments(id)

        return {
            total_comments: comments.length,
            comments,
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

        const moderationAdapter = new LegacyModerationAdapter()
        const result = moderationAdapter.review(body.content)

        if (result.blocked) {
            throw new BadRequestException("Comment blocked by moderation")
        }

        const command = new CreateCommentCommand(this.prisma, id, body)
        const created = await command.execute()

        eventManager.notify("comment.created", {
            postId: id,
            commentId: created.id,
        })

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

        const reactionType = body.reactionType || "like"
        const weight = body.weight || 1

        if (weight < 1) {
            throw new BadRequestException("Weight must be at least 1")
        }

        const command = new LikePostCommand(this.prisma, id, body)
        const like = await command.execute()

        eventManager.notify("like.created", {
            postId: id,
            likeId: like.id,
            reactionType: body.reactionType || "like",
        })

        const entity = LikeMapper.toEntity(like)

        return {
            success: true,
            like: entity,
        }
    }
}