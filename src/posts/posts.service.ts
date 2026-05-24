import { Injectable } from "@nestjs/common"
import { AddLikeDto, CreateCommentDto, CreatePostDto } from "@/posts/posts.dtos"
import { PostFactory } from "@/posts/factories/post.factory"
import { CommentFactory } from "@/posts/factories/comment.factory"
import { LikeFactory } from "@/posts/factories/like.factory"
import { PostRepository } from "@/posts/repositories/post.repository"
import { CommentRepository } from "@/posts/repositories/comment.repository"
import { LikeRepository } from "@/posts/repositories/like.repository"
import { PostEntity } from "@/posts/entities/post.entity"
import { CommentEntity } from "@/posts/entities/comment.entity"
import { LikeEntity } from "@/posts/entities/like.entity"

/**
 * PostsService - Servicio de Posts
 *
 * RESPONSABILIDADES (Después de Repository Pattern):
 * 1. Orquestar llamadas a repositories para acceder a datos
 * 2. Usar factories para enriquecer entidades
 * 3. Devolver entidades con lógica de negocio aplicada
 *
 * ARQUITECTURA ACTUAL (3 capas):
 *
 * Controller
 *     ↓
 * Service (Este archivo) ← LÓGICA DE NEGOCIO
 *     ↓
 * Repository ← ACCESO A DATOS (Prisma)
 *     ↓
 * Base de Datos
 *
 * VENTAJAS CON REPOSITORY PATTERN:
 * - El servicio NO conoce Prisma
 * - El servicio NO sabe cómo se implementan las queries
 * - Si cambias de BD (Prisma → TypeORM), solo cambias el repository
 * - El servicio se enfoca en LÓGICA DE NEGOCIO
 * - Fácil de testear: mockear los repositories
 *
 * FLUJO TÍPICO:
 * 1. repositorio.create() → Obtiene datos crudos de BD
 * 2. factory.createFromDatabase() → Enriquece los datos
 * 3. return → Retorna entidad enriquecida
 */
@Injectable()
export class PostsService {
    constructor(
        // ⭐ Repositories - Acceso a datos (NO Prisma directamente)
        private readonly postRepository: PostRepository,
        private readonly commentRepository: CommentRepository,
        private readonly likeRepository: LikeRepository,

        // Factories - Enriquecimiento de datos
        private readonly postFactory: PostFactory,
        private readonly commentFactory: CommentFactory,
        private readonly likeFactory: LikeFactory,
    ) {}

    /**
     * Crea un nuevo post
     *
     * FLUJO CON REPOSITORY PATTERN:
     * 1. Repository crea en BD (sabe CÓMO)
     * 2. Factory enriquece (sabe QUÉ campos agregar)
     * 3. Service orquesta (sabe EN QUÉ ORDEN)
     */
    async create(data: CreatePostDto): Promise<PostEntity> {
        // PASO 1: Delegar creación en BD al repository
        // El repository maneja la lógica de Prisma
        const createdPost = await this.postRepository.create(data)

        // PASO 2: Enriquecer con factory
        // El factory añade lógica de negocio
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
     * 1. Repository obtiene de BD
     * 2. Factory enriquece cada uno
     * 3. Service retorna colección enriquecida
     *
     * NOTA: El servicio NO sabe que usa Prisma
     * Podría cambiar a TypeORM/MongoDB y el servicio seguiría igual
     */
    async findAll(): Promise<PostEntity[]> {
        // PASO 1: Obtener datos crudos del repository
        const posts = await this.postRepository.findAll()

        // PASO 2: Enriquecer cada post con la factory
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
     * 1. Repository obtiene de BD
     * 2. Factory enriquece
     * 3. Service retorna
     */
    async findById(id: number): Promise<PostEntity | null> {
        // PASO 1: Repository obtiene
        const post = await this.postRepository.findById(id)

        if (!post) return null

        // PASO 2: Factory enriquece
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
     * 1. Repository crea en BD
     * 2. Factory enriquece (calcula sentimiento, detecta idioma, etc.)
     * 3. Service retorna
     *
     * ¿Qué pasó con Prisma?
     * - Está SOLO en CommentRepository
     * - Este servicio NO lo conoce
     * - Si cambias de BD, cambias CommentRepository, no esto
     */
    async createComment(postId: number, data: CreateCommentDto): Promise<CommentEntity> {
        // PASO 1: Repository crea en BD
        // (No necesitamos saber CÓMO lo hace)
        const createdComment = await this.commentRepository.create(postId, data)

        // PASO 2: Factory enriquece
        // (Calcula sentimiento, idioma, etc.)
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
     * 1. Repository crea en BD
     * 2. Factory enriquece (normaliza peso, calcula label, etc.)
     * 3. Service retorna
     *
     * VENTAJA CON REPOSITORY:
     * - El servicio es LIMPIO
     * - La lógica de Prisma está en LikeRepository
     * - El servicio se enfoca en LÓGICA DE NEGOCIO
     */
    async addLike(postId: number, data: AddLikeDto): Promise<LikeEntity> {
        // PASO 1: Repository crea en BD
        const createdLike = await this.likeRepository.create(postId, data)

        // PASO 2: Factory enriquece
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
