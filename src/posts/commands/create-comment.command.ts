import { PrismaService } from "@/prisma/prisma.service"
import { CreateCommentDto } from "@/posts/posts.dtos"
import { Command } from "./command.interface"

export class CreateCommentCommand implements Command {
    constructor(
        private readonly prisma: PrismaService,
        private readonly postId: number,
        private readonly dto: CreateCommentDto,
    ) {}

    async execute() {
        return await this.prisma.comment.create({
            data: {
                postId: this.postId,
                content: this.dto.content,
                source: "command",
            },
        })
    }
}