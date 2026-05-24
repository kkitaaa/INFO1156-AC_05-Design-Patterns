// este nuevo archivo concentra todos los calculos de negocio que antes estaban
// dispersos en el controller y los mappers.

// se separan de los mappers para que estos solo hagan transformacion de datos.

// calcula la puntuacion de relevancia de un post en base a sus likes, comentarios y antigüedad
export function calcRelevanceScore(
    likesCount: number,
    commentsCount: number,
    createdAt: Date,
): number {
    // 36_000_00 = 1 hora en milisegundos
    const hoursSinceCreated =
        (Date.now() - new Date(createdAt).getTime()) / 36_000_00
    return likesCount * 2 + commentsCount * 3 - Math.floor(hoursSinceCreated)
}

// un post se considera destacado si supera un umbral de relevancia:
export function calcIsFeatured(relevanceScore: number): boolean {
    return relevanceScore > 20
}

// extrae los tags del titulo filtrando palabras cortas:
export function calcTags(title: string): string[] {
    return title.split(" ").filter((word) => word.length > 4)
}

// construye el objeto metadata de un post para el feed:
export function calcPostMetadata(
    likes: { weight: number }[],
    comments: { content: string }[],
    createdAt: Date,
): Record<string, unknown> {
    return {
        likesWeights: likes.map((like) => like.weight),
        commentLengths: comments.map((comment) => comment.content.length),
        hourOfCreate: new Date(createdAt).getHours(),
    }
}

// calcula el puntaje de sentimiento de un comentario segun su largo:
export function calcSentimentScore(contentLength: number): number {
    return contentLength > 80 ? 70 : 45
}