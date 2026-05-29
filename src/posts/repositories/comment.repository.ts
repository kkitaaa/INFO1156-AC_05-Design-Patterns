import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import { CreateCommentDto } from "@/posts/posts.dtos"

@Injectable()
export class CommentRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Crea un nuevo comentario en la BD
     *
     * @param postId - ID del post al que pertenece
     * @param data - Datos del comentario
     * @returns Comentario creado (datos crudos)
     *
     */
    async create(postId: number, data: CreateCommentDto) {
        return this.prisma.comment.create({
            data: {
                postId,
                content: data.content,
                source: "service",
            },
        })
    }

    /**
     * Obtiene todos los comentarios de un post específico
     *
     * @param postId -
     * @returns 
     *
     */
    async findByPostId(postId: number) {
        return this.prisma.comment.findMany({
            where: { postId },
            orderBy: { createdAt: "desc" },
        })
    }

    /**
     * Obtiene un comentario específico por su ID
     *
     * @param id - 
     * @returns 
     */
    async findById(id: number) {
        return this.prisma.comment.findUnique({
            where: { id },
        })
    }

    /**
        * MÉTODO PRIVADO - Obtiene comentarios pendientes de moderación
     */
    async findPendingModerations(postId: number) {
        return this.prisma.comment.findMany({
            where: {
                postId,
                moderationState: "pending",
            },
            orderBy: { createdAt: "asc" },
        })
    }

    /**
     * MÉTODO PRIVADO - Obtiene comentarios aprobados
     */
    async findApprovedByPostId(postId: number) {
        return this.prisma.comment.findMany({
            where: {
                postId,
                moderationState: "approved",
            },
            orderBy: { createdAt: "desc" },
        })
    }

    /**
     * MÉTODO PRIVADO - Actualiza el estado de moderación
     */
    async updateModerationState(id: number, state: string) {
        return this.prisma.comment.update({
            where: { id },
            data: {},
        })
    }
}
