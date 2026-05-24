import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import { AddLikeDto } from "@/posts/posts.dtos"

/**
 * LikeRepository - Abstracción para acceso a datos de Reacciones/Likes
 */
@Injectable()
export class LikeRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Crea una nueva reacción en la BD
     *
     * @param postId 
     * @param data 
     * @returns 
     */
    async create(postId: number, data: AddLikeDto) {
        return this.prisma.like.create({
            data: {
                postId,
                reactionType: data.reactionType || "like",
                weight: data.weight || 1,
                source: "service",
            },
        })
    }

    /**
     * Obtiene todas las reacciones de un post específico
     *
     * @param postId 
     * @returns 
     */
    async findByPostId(postId: number) {
        return this.prisma.like.findMany({
            where: { postId },
            orderBy: { createdAt: "desc" },
        })
    }

    /**
     * Obtiene una reacción específica por su ID
     *
     * @param id
     * @returns 
     */
    async findById(id: number) {
        return this.prisma.like.findUnique({
            where: { id },
        })
    }

    /**
     * MÉTODO PRIVADO - Obtiene estadísticas de reacciones de un post
     */
    async getReactionStats(postId: number) {
        return this.prisma.like.groupBy({
            by: ["reactionType"],
            where: { postId },
            _count: true,
            _sum: {
                weight: true,
            },
        })
    }

    /**
     * MÉTODO PRIVADO - Obtiene reacciones por tipo específico
     */
    async findByPostIdAndType(postId: number, reactionType: string) {
        return this.prisma.like.findMany({
            where: {
                postId,
                reactionType,
            },
            orderBy: { createdAt: "desc" },
        })
    }

    /**
     * MÉTODO PRIVADO - Obtiene el peso total de reacciones de un post
     */
    async getTotalReactionWeight(postId: number) {
        const result = await this.prisma.like.aggregate({
            where: { postId },
            _sum: {
                weight: true,
            },
        })

        return result._sum.weight ?? 0
    }

    /**
     * MÉTODO PRIVADO - Obtiene reacciones "importantes" (que afectan ranking)
     */
    async findImpactfulReactionsByPostId(postId: number) {
        return this.prisma.like.findMany({
            where: {
                postId,
                reactionType: {
                    in: ["fire", "clap"], // Solo reacciones que afectan ranking
                },
            },
            orderBy: { createdAt: "desc" },
        })
    }
}
