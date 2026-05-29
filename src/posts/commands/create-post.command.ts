import { BadRequestException } from "@nestjs/common"

import { PrismaService } from "@/prisma/prisma.service"
import { CreatePostDto } from "@/posts/posts.dtos"

import { Command } from "./command.interface"

export class CreatePostCommand implements Command {
    constructor(
        private readonly prisma: PrismaService,
        private readonly dto: CreatePostDto,
    ) {}

    async execute() {
        // validaciones
        if (
            this.dto.title.length < 3 ||
            this.dto.title.length > 120
        ) {
            throw new BadRequestException(
                "Title length must be between 3 and 120",
            )
        }

        if (
            this.dto.imageUrl &&
            !this.dto.imageUrl.startsWith("http")
        ) {
            throw new BadRequestException(
                "Image URL must start with http",
            )
        }

        // persistencia
        const created = await this.prisma.post.create({
            data: {
                title: this.dto.title,
                description: this.dto.description,
                imageUrl: this.dto.imageUrl,
            },
        })

        return created
    }
}