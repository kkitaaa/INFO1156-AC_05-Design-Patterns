import { Injectable } from "@nestjs/common"
import { PrismaService } from "@/prisma/prisma.service"
import { CreatePostDto } from "@/posts/posts.dtos"

/**
 * PostRepository - Abstracción para acceso a datos de Posts
 */
@Injectable()
export class PostRepository {
    constructor(private readonly prisma: PrismaService) {}

    /**
     * Crea un nuevo post en la BD
     *
     * @param data 
     * @returns 
     */
    async create(data: CreatePostDto) {
        return this.prisma.post.create({
            data: {
                title: data.title,
                description: data.description,
                imageUrl: data.imageUrl,
                // Campos por defecto aquí si fuera necesario
                // likesCount: 0,
                // commentsCount: 0,
            },
        })
    }

    /**
     * Obtiene TODOS los posts de la BD
     *
     * @returns Array de posts (datos crudos)
     */
    async findAll() {
        return this.prisma.post.findMany({
            orderBy: { createdAt: "desc" },
        })
    }

    /**
     * Obtiene un post específico por su ID
     *
     * @param id
     * @returns 
     */
    async findById(id: number) {
        return this.prisma.post.findUnique({
            where: { id },
        })
    }

    async findFeed() {
        return this.prisma.post.findMany({
            include: {
                comments: true,
                likes: true,
            },
            orderBy: { createdAt: "desc" },
        })
    }

    /**
     * MÉTODO PRIVADO - Obtiene posts con conteos de likes y comentarios
     */
    async findAllWithRelations() {
        return this.prisma.post.findMany({
            include: {
                _count: {
                    select: {
                        likes: true,
                        comments: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
        })
    }

    /**
     * MÉTODO PRIVADO - Búsqueda avanzada por texto
     *
     */
    async searchByText(query: string) {
        return this.prisma.post.findMany({
            where: {
                OR: [
                    { title: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            },
            orderBy: { createdAt: "desc" },
        })
    }
}
