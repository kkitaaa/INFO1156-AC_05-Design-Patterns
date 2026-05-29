import {
    Body,
    Controller,
    Get,
    Param,
    ParseIntPipe,
    Post,
    Query,
} from "@nestjs/common"

import { PostsService } from "@/posts/services/posts.service"
import {
    AddLikeDto,
    CreateCommentDto,
    CreatePostDto,
    FeedQueryDto,
} from "@/posts/posts.dtos"

@Controller("api/posts")
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    async create(@Body() body: CreatePostDto) {
        return this.postsService.createPost(body)
    }

    @Get()
    async findAll() {
        return this.postsService.findAll()
    }

    @Get("feed")
    async getFeed(@Query() query: FeedQueryDto) {
        return this.postsService.getFeed(query.mode || "latest")
    }

    @Get(":id/comments")
    async getComments(@Param("id", ParseIntPipe) id: number) {
        return this.postsService.getComments(id)
    }

    @Post(":id/comments")
    async createComment(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: CreateCommentDto,
    ) {
        return this.postsService.createComment(id, body)
    }

    @Post(":id/likes")
    async addLike(
        @Param("id", ParseIntPipe) id: number,
        @Body() body: AddLikeDto,
    ) {
        return this.postsService.addLike(id, body)
    }
}