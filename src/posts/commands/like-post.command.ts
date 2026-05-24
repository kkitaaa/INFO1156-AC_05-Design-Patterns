import { PrismaService } from "@/prisma/prisma.service"
import { AddLikeDto } from "@/posts/posts.dtos"
import { Command } from "./command.interface"

export class LikePostCommand implements Command {
    constructor(
        private readonly prisma: PrismaService,
        private readonly postId: number,
        private readonly dto: AddLikeDto,
    ) {}

    async execute() {
        return await this.prisma.like.create({
            data: {
                postId: this.postId,
                reactionType: this.dto.reactionType || "like",
                weight: this.dto.weight || 1,
                source: "command",
            },
        })
    }
}