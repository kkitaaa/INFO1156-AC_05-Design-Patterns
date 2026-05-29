import { PrismaService } from "@/prisma/prisma.service"
import { CreatePostDto } from "@/posts/posts.dtos"
import { Command } from "./command.interface"

export class CreatePostCommand implements Command {
    constructor(
        private readonly prisma: PrismaService,
        private readonly dto: CreatePostDto,
    ) {}

    async execute() {
        return await this.prisma.post.create({
            data: {
                title: this.dto.title,
                description: this.dto.description,
                imageUrl: this.dto.imageUrl,
            },
        })
    }
}