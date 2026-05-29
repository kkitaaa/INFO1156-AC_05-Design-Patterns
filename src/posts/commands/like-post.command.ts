import {
    BadRequestException,
} from "@nestjs/common"

import { PrismaService } from "@/prisma/prisma.service"

import { AddLikeDto } from "@/posts/posts.dtos"

import { Command } from "./command.interface"

export class LikePostCommand
implements Command {
    constructor(
        private readonly prisma: PrismaService,
        private readonly postId: number,
        private readonly dto: AddLikeDto,
    ) {}

    async execute() {
        // defaults
        const reactionType =
            this.dto.reactionType || "like"

        const weight =
            this.dto.weight || 1

        // validaciones
        if (weight < 1) {
            throw new BadRequestException(
                "Weight must be at least 1",
            )
        }

        // persistencia
        const created =
            await this.prisma.like.create({
                data: {
                    postId: this.postId,
                    reactionType,
                    weight,
                    source: "command",
                },
            })

        return created
    }
}