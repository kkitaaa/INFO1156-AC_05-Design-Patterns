import {
    BadRequestException,
} from "@nestjs/common"

import { PrismaService } from "@/prisma/prisma.service"

import { AddLikeDto } from "@/posts/posts.dtos"

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

        // side effects
        logDomainEvent(
            "like.created",
            {
                postId: this.postId,
                likeId: created.id,
            },
        )

        fakeSendNotification(
            "like",
            {
                postId: this.postId,
                reactionType,
            },
        )

        fakeRecomputeSomething(
            this.postId,
        )

        return created
    }
}