import {
    BadRequestException,
} from "@nestjs/common"

import { PrismaService } from "@/prisma/prisma.service"

import { CreateCommentDto } from "@/posts/posts.dtos"

import { LegacyModerationAdapter } from "@/posts/moderation/legacy-moderation.adapter"

import { Command } from "./command.interface"

export class CreateCommentCommand
implements Command {
    constructor(
        private readonly prisma: PrismaService,
        private readonly postId: number,
        private readonly dto: CreateCommentDto,
    ) {}

    async execute() {
        // validaciones
        if (
            this.dto.content.length < 2
        ) {
            throw new BadRequestException(
                "Comment too short",
            )
        }

        // moderacion mediante adapter
        const moderationAdapter =
            new LegacyModerationAdapter()

        const result =
            moderationAdapter.review(
                this.dto.content,
            )

        if (result.blocked) {
            throw new BadRequestException(
                "Comment blocked by moderation",
            )
        }

        // persistencia
        const created =
            await this.prisma.comment.create({
                data: {
                    postId: this.postId,
                    content: this.dto.content,
                    source: "command",
                },
            })

        return created
    }
}