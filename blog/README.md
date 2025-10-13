# Módulo Blog

Este módulo agrega un sistema ligero de gestión de artículos que convive con la estructura estática del sitio. La meta es permitir CRUD seguro, generación de assets públicos (HTML, JSON, RSS, sitemap) y un front coherente con el diseño existente.

## Arquitectura

- `blog/server.js`: API Express + autenticación Basic para el panel. Expone endpoints CRUD y gestiona subidas de portada con Multer.
- `blog/storage.js`: utilidades puras para leer/escribir el archivo `data/blog.db.json`, normalizar datos, generar slugs y calcular métricas (lectura, excerpt).
- `blog/builders.js`: generación automática de
  - HTML estático por artículo (`articulos/<slug>.html`)
  - `blog/articles.json` (solo publicados) consumido por el sitio público
  - `sitemap.xml` y `blog/rss.xml`
- `admin/blog.html`: panel protegido (client-side) que consume la API y permite crear/editar/publicar.
- `blog.html` + `blog.js`: listado público con buscador y filtros por etiquetas.

## Datos

`data/blog.db.json`

```json
{
  "articles": [
    {
      "id": "uuid",
      "title": "string",
      "slug": "string",
      "status": "draft|published",
      "tags": ["Flores", "Exportación"],
      "coverImage": "/articulos/media/foto.webp",
      "excerpt": "string",
      "seoTitle": "string",
      "seoDescription": "string",
      "seoKeywords": ["coma", "separadas"],
      "readingMinutes": 5,
      "createdAt": "iso date",
      "updatedAt": "iso date",
      "publishedAt": "iso date|null",
      "content": {
        "markdown": "## Markdown fuente",
        "html": "<h2>Markdown renderizado</h2>"
      }
    }
  ]
}
```

Los campos calculados (`slug`, `readingMinutes`, timestamps) se actualizan automáticamente en cada operación. Los drafts nunca salen al JSON público.

## Autenticación

Basic Auth con credenciales configurables vía variables de entorno:

- `BLOG_ADMIN_USER` (default: `admin`)
- `BLOG_ADMIN_PASSWORD` (default: leer de `.env` o `change-me`)

El middleware devuelve `401` con header `WWW-Authenticate` cuando falta o es incorrecto.

## Endpoints

| Método | Ruta | Descripción |
| --- | --- | --- |
| `GET` | `/api/blog/articles/public` | Listado solo publicados (sin auth) |
| `GET` | `/api/blog/articles` | Listado completo (requiere auth) |
| `GET` | `/api/blog/articles/:id` | Detalle individual (requiere auth) |
| `POST` | `/api/blog/articles` | Crear artículo (multipart para portada) |
| `PUT` | `/api/blog/articles/:id` | Editar artículo |
| `POST` | `/api/blog/articles/:id/publish` | Publicar o despublicar |
| `DELETE` | `/api/blog/articles/:id` | Eliminar |

Todas las mutaciones regeneran los artefactos públicos.

## Scripts

Agregar al `package.json`:

```json
{
  "scripts": {
    "blog:serve": "node blog/server.js",
    "blog:build": "node blog/builders.js --buildAll"
  }
}
```

`blog:serve` levanta Express y recompone assets al vuelo; `blog:build` permite regenerar todo manualmente (Útil en CI).

