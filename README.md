# Feed de Publicaciones

Este proyecto implementa un feed social sencillo, sin usuarios ni autenticación, centrado en la interacción entre publicaciones, likes y comentarios. La aplicación está pensada para simular una plataforma de contenido visual con lógica de negocio realista pero acotada.

## Requerimientos

- Docker

## Resumen funcional

El sistema permite crear publicaciones con imagen, texto y descripción, y mostrarlas en un feed central. Cada publicación puede recibir likes y comentarios, y esas interacciones modifican cómo se percibe su importancia dentro del feed.

El comportamiento general del producto gira alrededor de tres ideas:

- **contenido**: las publicaciones son la unidad principal del sistema,
- **interacción**: likes y comentarios enriquecen cada publicación,
- **priorización**: el feed puede cambiar de orden según distintos criterios de relevancia.

## Lógica de negocio principal

La lógica del sistema no solo guarda datos, también construye una vista enriquecida del feed. Para cada publicación se calcula información derivada, como la cantidad de interacciones y una puntuación de relevancia que combina actividad reciente con volumen de participación.

Además, antes de persistir comentarios se aplica una validación/moderación para filtrar contenido problemático. El sistema también ejecuta efectos operativos cuando se crean interacciones (por ejemplo trazas y procesos internos de recálculo), reflejando un flujo típico de aplicaciones de contenido.

## Contexto técnico

La solución está construida con NestJS en backend, Prisma ORM y SQLite como almacenamiento local.

## Arquitectura orientada a eventos

La capa de posts ahora separa la lógica principal de los efectos secundarios mediante un gestor de eventos simple:

## Separación de responsabilidades con Service Layer

La lógica de negocio se movió fuera del controller hacia un servicio dedicado en [src/posts/services/posts.service.ts](src/posts/services/posts.service.ts), lo que permite:

- separación HTTP / lógica de negocio;
- arquitectura escalable y mantenible;
- reutilización del mismo servicio en otras capas o pruebas;
- menor acoplamiento entre rutas y reglas de negocio.

- **separación de responsabilidades**: el comando persiste datos y el controlador dispara eventos;
- **bajo acoplamiento**: los observers (`logger`, `notification`, `recompute`) no dependen del flujo principal;
- **facilidad para extender**: agregar otro observer requiere solo implementar la interfaz `Observer`;
- **arquitectura orientada a eventos**: nuevas acciones pueden reaccionar a eventos como `post.created`, `comment.created` o `like.created` sin modificar la lógica del caso de uso.

La base de datos es fija en `sqlite.db`

## Ejecución:

Para levantar todo el sistema con Docker:

1. `make setup`
2. `make run`

Este comando construye la imagen, instala dependencias dentro del contenedor, aplica migraciones Prisma, genera el cliente y arranca NestJS en modo watch.

En este flujo, los artefactos de compilación y cache de paquetes se mantienen dentro de volúmenes Docker para no ensuciar el directorio del proyecto.

La aplicación queda disponible en:

- `http://localhost:3000`
- `http://localhost:3000/docs`
- `http://localhost:5555` (Prisma Studio - Database Manager)

Comandos útiles:

- `make stop` para detener el contenedor
- `make logs` para ver logs en tiempo real
