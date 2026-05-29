import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from "@nestjs/common"

import { eventManager } from "@/common/events/event-manager"
import { CommentMapper } from "@/posts/mappers/comment.mapper"
import { LikeMapper } from "@/posts/mappers/like.mapper"
import { PostMapper } from "@/posts/mappers/post.mapper"
import { CommentFactory } from "@/posts/factories/comment.factory"
import { LikeFactory } from "@/posts/factories/like.factory"
import { PostFactory } from "@/posts/factories/post.factory"
import { AddLikeDto, CreateCommentDto, CreatePostDto } from "@/posts/posts.dtos"
import { CommentRepository } from "@/posts/repositories/comment.repository"
import { LikeRepository } from "@/posts/repositories/like.repository"
import { PostRepository } from "@/posts/repositories/post.repository"
import { FeedStrategyFactory } from "@/posts/feed-strategies/feed-strategies.factory"
import { LegacyModerationAdapter } from "@/posts/moderation/legacy-moderation.adapter"
import { LengthValidator } from "@/posts/validators/lenght.validator"
import { ModerationValidator } from "@/posts/validators/moderation.validator"
import { ProfanityValidator } from "@/posts/validators/profanity.validator"
import { SpamValidator } from "@/posts/validators/spam.validator"

@Injectable()
export class PostsService {
    constructor(
        private readonly postRepository: PostRepository,
        private readonly commentRepository: CommentRepository,
        private readonly likeRepository: LikeRepository,
        private readonly postFactory: PostFactory,
        private readonly commentFactory: CommentFactory,
        private readonly likeFactory: LikeFactory,
        private readonly feedStrategyFactory: FeedStrategyFactory,
    ) {}

    async createPost(dto: CreatePostDto) {
        const lengthValidator = new LengthValidator()
        const moderationValidator = new ModerationValidator()
        const spamValidator = new SpamValidator()
        const profanityValidator = new ProfanityValidator()

        lengthValidator
            .setNext(moderationValidator)
            .setNext(spamValidator)
            .setNext(profanityValidator)

        await lengthValidator.handle(dto)

        const created = await this.postRepository.create(dto)
        const payload = this.postFactory.createFromDatabase({
            id: created.id,
            title: created.title,
            description: created.description,
            imageUrl: created.imageUrl,
            createdAt: created.createdAt,
            updatedAt: created.updatedAt,
        })

        eventManager.notify("post.created", {
            postId: created.id,
            title: created.title,
        })

        return {
            ok: true,
            payload,
        }
    }

    async findAll() {
        const posts = await this.postRepository.findAll()

        return {
            total: posts.length,
            items: posts.map((post) => PostMapper.toEntity(post, "latest")),
        }
    }

    async getFeed(mode: string) {
        const posts = await this.postRepository.findFeed()
        const strategy = this.feedStrategyFactory.getStrategy(mode)
        const sorted = strategy.sort(posts.map((post) => PostMapper.toEntity(post, mode)))

        return {
            mode,
            count: sorted.length,
            rows: sorted,
        }
    }

    async getComments(postId: number) {
        const post = await this.postRepository.findById(postId)

        if (!post) {
            throw new NotFoundException("Post not found")
        }

        const comments = await this.commentRepository.findByPostId(postId)

        return {
            total_comments: comments.length,
            comments: comments.map((comment) =>
                this.commentFactory.createFromDatabase({
                    id: comment.id,
                    postId: comment.postId,
                    content: comment.content,
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    source: comment.source,
                }),
            ),
        }
    }

    async createComment(postId: number, dto: CreateCommentDto) {
        const post = await this.postRepository.findById(postId)

        if (!post) {
            throw new NotFoundException("Post not found")
        }

        if (dto.content.length < 2) {
            throw new BadRequestException("Comment too short")
        }

        const moderationAdapter = new LegacyModerationAdapter()
        const result = moderationAdapter.review(dto.content)

        if (result.blocked) {
            throw new BadRequestException("Comment blocked by moderation")
        }

        const created = await this.commentRepository.create(postId, dto)

        eventManager.notify("comment.created", {
            postId,
            commentId: created.id,
        })

        return {
            message: "comment_created",
            entity: CommentMapper.toEntity(created),
        }
    }

    async addLike(postId: number, dto: AddLikeDto) {
        const post = await this.postRepository.findById(postId)

        if (!post) {
            throw new NotFoundException("Post not found")
        }

        const reactionType = dto.reactionType || "like"
        const weight = dto.weight || 1

        if (weight < 1) {
            throw new BadRequestException("Weight must be at least 1")
        }

        const like = await this.likeRepository.create(postId, dto)

        eventManager.notify("like.created", {
            postId,
            likeId: like.id,
            reactionType,
        })

        return {
            success: true,
            like: LikeMapper.toEntity(like),
        }
    }
}
