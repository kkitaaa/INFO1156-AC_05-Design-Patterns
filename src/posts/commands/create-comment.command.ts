import {
    BadRequestException,
} from "@nestjs/common"

import { PrismaService } from "@/prisma/prisma.service"

import { CreateCommentDto } from "@/posts/posts.dtos"

import { LegacyModerationAdapter } from "@/posts/moderation/legacy-moderation.adapter"

import { Command } from "./command.interface"

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

const fakeRecomputeSomething = (
    postId: number,
) => {
    console.log(`[recompute] postId=${postId}`)
}

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

        // side effects
        logDomainEvent(
            "comment.created",
            {
                postId: this.postId,
                commentId: created.id,
            },
        )

        fakeSendNotification(
            "comment",
            {
                postId: this.postId,
            },
        )

        fakeRecomputeSomething(
            this.postId,
        )

        return created
    }
}