# AC-05 Design Patterns Refactor

## Objetivo

El objetivo de esta actividad fue refactorizar la arquitectura del sistema aplicando distintos patrones de diseño para mejorar:

* separación de responsabilidades
* mantenibilidad
* extensibilidad
* reutilización de código
* desacoplamiento entre componentes

El sistema originalmente concentraba demasiada lógica dentro de los controllers, generando código difícil de mantener y extender.

# Problemas Detectados

## 1. Controllers con demasiadas responsabilidades

El archivo:

```txt
src/posts/posts.controller.ts
```

contenía:

* lógica de negocio
* acceso a base de datos
* validaciones
* moderación
* construcción de entidades
* manejo de eventos
* algoritmos de ordenamiento

Esto generaba:

* alto acoplamiento
* baja reutilización
* dificultad de testing
* dificultad para extender funcionalidades

## 2. Uso excesivo de condicionales

Existían múltiples:

* `if`
* `switch`
* `else`

para manejar:

* sorting del feed
* validaciones
* moderación
* manejo de estados

Cada nueva funcionalidad obligaba a modificar código existente.

## 3. Dependencia directa de Prisma ORM

Los controllers accedían directamente a Prisma:

```ts
this.prisma.post.findMany(...)
```

Esto acoplaba fuertemente el sistema al ORM.

## 4. API legacy de moderación inconsistente

La API de moderación retornaba formatos distintos:

```txt
"BLOCK"
1
{ pass: true }
```

El controller debía interpretar manualmente cada respuesta.

## 5. Side effects acoplados

Acciones como:

* logs
* notificaciones
* recomputaciones

eran ejecutadas directamente desde controllers y services.

## 6. Creación manual de entidades

Muchos objetos eran construidos manualmente dentro de distintos módulos, generando:

* duplicación
* inconsistencias
* lógica repetida

# Patrones de Diseño Aplicados

## 1. Strategy Pattern

### Problema

El feed utilizaba múltiples condicionales para decidir el algoritmo de ordenamiento:

```ts
switch(mode)
```

### Solución

Se implementó el patrón Strategy para encapsular cada algoritmo de ordenamiento en clases independientes.

### Estructura

```txt
FeedStrategy
├── LatestFeedStrategy
├── MostLikedFeedStrategy
├── MostCommentedFeedStrategy
└── RelevanceFeedStrategy
```

### Ejemplo

```ts
interface FeedStrategy {
  sort(posts: Post[]): Post[];
}

class LatestFeedStrategy implements FeedStrategy {
  sort(posts: Post[]) {
    return posts.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
}
```

### Beneficios

* eliminación de `switch`
* extensibilidad
* bajo acoplamiento
* mejor mantenibilidad

## 2. Observer Pattern

### Problema

Los controllers ejecutaban directamente:

* logs
* notificaciones
* recomputaciones

Ejemplo:

```ts
fakeSendNotification()
logDomainEvent()
```

### Solución

Se implementó un sistema de eventos utilizando Observer Pattern.

### Estructura

```txt
EventManager
├── LoggerObserver
├── NotificationObserver
└── RecomputeObserver
```

Cuando ocurre un evento:

```ts
eventManager.notify("post.created", payload)
```

los observers reaccionan automáticamente.

### Beneficios

* desacoplamiento
* separación de responsabilidades
* extensibilidad

## 3. Adapter Pattern

### Problema

La API legacy de moderación retornaba formatos inconsistentes:

```txt
"BLOCK"
1
{ pass: true }
```

### Solución

Se implementó un Adapter Pattern para normalizar respuestas.

### Estructura

```txt
LegacyModerationApi
        ↓
LegacyModerationAdapter
        ↓
ModerationResult
```

El adapter transforma todas las respuestas a un formato estándar:

```ts
{
  blocked: boolean,
  reason?: string
}
```

### Beneficios

* encapsulación de compatibilidad legacy
* simplificación del controller
* desacoplamiento

## 4. Factory Pattern

### Problema

Las entidades eran creadas manualmente en distintos lugares del sistema.

### Solución

Se implementaron factories para centralizar la creación de objetos.

### Estructura

```txt
PostFactory
CommentFactory
LikeFactory
```

### Ejemplo

```ts
const post = PostFactory.create(dto)
```

### Beneficios

* reducción de duplicación
* creación consistente
* mejor mantenibilidad

## 5. Repository Pattern

### Problema

Los controllers accedían directamente a Prisma ORM.

### Solución

Se implementaron repositories para encapsular las consultas a base de datos.

### Estructura

```txt
PostsRepository
CommentsRepository
LikesRepository
```

### Ejemplo

```ts
const posts = await postsRepository.findAll()
```

### Beneficios

* desacoplamiento del ORM
* reutilización de queries
* mejor testing

## 6. Service Layer Pattern

### Problema

La lógica de negocio estaba mezclada con la lógica HTTP.

### Solución

Se creó una capa de servicios encargada exclusivamente de la lógica de negocio.

### Flujo

```txt
Controller
    ↓
Service
    ↓
Repository
    ↓
Prisma ORM
```

### Beneficios

* controllers más limpios
* mejor organización
* separación de responsabilidades

## 7. Chain of Responsibility Pattern

### Problema

Las validaciones estaban implementadas mediante múltiples condicionales anidados.

### Solución

Se implementó una cadena de validadores independientes.

### Estructura

```txt
LengthValidator
    ↓
SpamValidator
    ↓
ProfanityValidator
    ↓
ModerationValidator
```

Cada validator:

* procesa la validación
* pasa el control al siguiente validator

### Beneficios

* extensibilidad
* eliminación de `if` complejos
* validaciones desacopladas

## 8. Mapper Pattern

### Problema

Las transformaciones entre DTOs, entidades y respuestas API estaban repetidas en distintos lugares.

### Solución

Se implementaron mappers especializados.

### Estructura

```txt
PostMapper
CommentMapper
LikeMapper
```

### Ejemplo

```ts
const response = PostMapper.toResponse(post)
```

### Beneficios

* reutilización
* consistencia
* menos duplicación

## 9. Command Pattern

### Problema

Las operaciones complejas eran ejecutadas directamente desde controllers y services.

### Solución

Se encapsularon operaciones en comandos independientes.

### Estructura

```txt
CreatePostCommand
CreateCommentCommand
LikePostCommand
```

Cada comando implementa:

```ts
execute()
```

### Ejemplo

```ts
await command.execute()
```

### Beneficios

* encapsulación de acciones
* mejor organización
* facilidad de testing

# Arquitectura Final

```txt
Controller
    ↓
Service Layer
    ↓
Commands / Strategies / Validators
    ↓
Repositories
    ↓
Prisma ORM
```

Además:

* Observer maneja eventos
* Factory crea entidades
* Mapper transforma datos
* Adapter encapsula APIs legacy
