import { Injectable } from "@nestjs/common"
import { AddLikeDto, CreateCommentDto, CreatePostDto } from "@/posts/posts.dtos"
import { PrismaService } from "@/prisma/prisma.service"
import { PostFactory } from "@/posts/factories/post.factory"
import { CommentFactory } from "@/posts/factories/comment.factory"
import { LikeFactory } from "@/posts/factories/like.factory"
import { PostEntity } from "@/posts/entities/post.entity"
import { CommentEntity } from "@/posts/entities/comment.entity"
import { LikeEntity } from "@/posts/entities/like.entity"

/**
 * PostsService - Servicio de Posts
 *
 * RESPONSABILIDADES:
 * 1. Acceder a la base de datos (vía Prisma)
 * 2. Usar factories para crear entidades enriquecidas
 * 3. Devolver entidades con lógica de negocio aplicada
 *
 * VENTAJAS DEL FACTORY PATTERN AQUÍ:
 * - El servicio NO crea directamente objetos
 * - La lógica de creación está CENTRALIZADA en las factories
 * - Si necesitamos cambiar cómo se crean objetos, solo cambias la factory
 * - El servicio se enfoca en su trabajo: acceso a datos
 */
@Injectable()
export class PostsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly postFactory: PostFactory,
        private readonly commentFactory: CommentFactory,
        private readonly likeFactory: LikeFactory,
    ) {}

    /**
     * Crea un nuevo post
     *
     * FLUJO:
     * 1. Valida datos (DTO hace esto)
     * 2. Crea en BD vía Prisma
     * 3. USA LA FACTORY para crear PostEntity enriquecida
     * 4. Retorna la entidad (no datos crudos)
     */
    async create(data: CreatePostDto): Promise<PostEntity> {
        const now = new Date()

        // Crear en BD
        const createdPost = await this.prisma.post.create({
            data,
        })

        // USAR LA FACTORY para enriquecer el objeto
        return this.postFactory.createFromDatabase({
            id: createdPost.id,
            title: createdPost.title,
            description: createdPost.description,
            imageUrl: createdPost.imageUrl,
            createdAt: createdPost.createdAt,
            updatedAt: createdPost.updatedAt,
        })
    }

    /**
     * Obtiene todos los posts
     *
     * FLUJO:
     * 1. Recupera datos de BD
     * 2. USA LA FACTORY para enriquecer CADA post
     * 3. Retorna colección de entidades enriquecidas
     */
    async findAll(): Promise<PostEntity[]> {
        const posts = await this.prisma.post.findMany({
            orderBy: { createdAt: "desc" },
        })

        // Transformar cada post crudode BD a PostEntity enriquecida
        return posts.map((post) =>
            this.postFactory.createFromDatabase({
                id: post.id,
                title: post.title,
                description: post.description,
                imageUrl: post.imageUrl,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
            }),
        )
    }

    /**
     * Obtiene un post por ID
     *
     * FLUJO:
     * 1. Recupera de BD
     * 2. USA LA FACTORY para enriquecerlo
     * 3. Retorna PostEntity enriquecida
     */
    async findById(id: number): Promise<PostEntity | null> {
        const post = await this.prisma.post.findUnique({ where: { id } })

        if (!post) return null

        return this.postFactory.createFromDatabase({
            id: post.id,
            title: post.title,
            description: post.description,
            imageUrl: post.imageUrl,
            createdAt: post.createdAt,
            updatedAt: post.updatedAt,
        })
    }

    /**
     * Crea un comentario
     *
     * FLUJO:
     * 1. Valida datos (DTO hace esto)
     * 2. Crea en BD vía Prisma
     * 3. USA LA FACTORY para crear CommentEntity enriquecida
     * 4. Retorna la entidad
     *
     * La factory automáticamente:
     * - Calcula sentimentScore del comentario
     * - Detecta el idioma
     * - Marca como "pending" para moderación
     */
    async createComment(postId: number, data: CreateCommentDto): Promise<CommentEntity> {
        const now = new Date()

        // Crear en BD
        const createdComment = await this.prisma.comment.create({
            data: {
                postId,
                content: data.content,
                source: "service",
            },
        })

        // USAR LA FACTORY para enriquecer el objeto
        return this.commentFactory.createFromDatabase({
            id: createdComment.id,
            postId: createdComment.postId,
            content: createdComment.content,
            createdAt: createdComment.createdAt,
            updatedAt: createdComment.updatedAt,
            source: createdComment.source,
        })
    }

    /**
     * Agrega una reacción (like, fire, clap) a un post
     *
     * FLUJO:
     * 1. Valida datos (DTO hace esto)
     * 2. Crea en BD vía Prisma
     * 3. USA LA FACTORY para crear LikeEntity enriquecida
     * 4. Retorna la entidad
     *
     * La factory automáticamente:
     * - Normaliza el peso según el tipo
     * - Calcula la etiqueta de fortaleza
     * - Determina si afecta el ranking
     */
    async addLike(postId: number, data: AddLikeDto): Promise<LikeEntity> {
        const now = new Date()

        // Crear en BD
        const createdLike = await this.prisma.like.create({
            data: {
                postId,
                reactionType: data.reactionType || "like",
                weight: data.weight || 1,
                source: "service",
            },
        })

        // USAR LA FACTORY para enriquecer el objeto
        return this.likeFactory.createFromDatabase({
            id: createdLike.id,
            postId: createdLike.postId,
            reactionType: createdLike.reactionType,
            weight: createdLike.weight,
            createdAt: createdLike.createdAt,
            source: createdLike.source,
        })
    }
}
