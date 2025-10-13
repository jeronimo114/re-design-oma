import express from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import { unlink } from "node:fs/promises";
import process from "node:process";
import {
  createArticle,
  deleteArticle,
  listArticles,
  listPublished,
  setPublishStatus,
  updateArticle,
  toPublicArticle,
  PATHS,
  findArticleById,
} from "./storage.js";
import {
  ensureDir,
  slugify,
  sanitizeTags,
  buildExcerpt,
} from "./utils.js";
import { buildPublicArtifacts } from "./builders.js";

loadEnv();

await ensureDir(PATHS.MEDIA_DIR);
try {
  await buildPublicArtifacts();
} catch (error) {
  console.warn("No se pudieron generar los artefactos iniciales del blog:", error);
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = PATHS.ROOT_DIR;

const app = express();
app.use(express.json({ limit: "2mb" }));
app.use(
  express.static(ROOT_DIR, {
    extensions: ["html"],
    maxAge: "0",
  })
);

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, PATHS.MEDIA_DIR),
  filename: (_, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const baseName = slugify(
      path.basename(file.originalname, path.extname(file.originalname))
    );
    const filename = `${baseName || "cover"}-${Date.now()}${ext}`;
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Solo se permiten archivos de imagen"));
    } else {
      cb(null, true);
    }
  },
});

const ADMIN_USER = process.env.BLOG_ADMIN_USER || "admin";
const ADMIN_PASS = process.env.BLOG_ADMIN_PASSWORD || "change-me";

function unauthorized(res) {
  return res
    .status(401)
    .set("WWW-Authenticate", 'Basic realm="Blog Admin"')
    .json({ error: "Autenticación requerida" });
}

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Basic ")) {
    return unauthorized(res);
  }
  const credentials = Buffer.from(header.replace("Basic ", ""), "base64")
    .toString("utf8")
    .split(":");
  const [user, pass] = [credentials[0], credentials.slice(1).join(":")];
  if (user === ADMIN_USER && pass === ADMIN_PASS) {
    return next();
  }
  return unauthorized(res);
}

function parseListField(value) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => String(item || "").trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item || "").trim()).filter(Boolean);
      }
    } catch {
      // ignore
    }
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
  return [];
}

function parseDateField(value) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return undefined;
  return date.toISOString();
}

function normalizePayload(body, coverPath) {
  const tags = sanitizeTags(parseListField(body.tags));
  const seoKeywords = parseListField(body.seoKeywords);
  const payload = {
    title: body.title,
    status: body.status,
    slug: body.slug,
    tags,
    seoTitle: body.seoTitle,
    seoDescription: body.seoDescription,
    seoKeywords,
    excerpt: body.excerpt,
    contentMarkdown: body.contentMarkdown ?? body.markdown ?? body.content,
    publishedAt: parseDateField(body.publishedAt),
  };

  if (coverPath) {
    payload.coverImage = coverPath;
  }

  if (!payload.excerpt && payload.contentMarkdown) {
    payload.excerpt = buildExcerpt(payload.contentMarkdown);
  }

  return payload;
}

app.get("/api/blog/articles/public", async (_, res) => {
  const published = await listPublished();
  res.json({
    articles: published.map((article) => toPublicArticle(article)),
  });
});

app.get("/api/blog/articles", requireAuth, async (_, res) => {
  const articles = await listArticles();
  res.json({ articles });
});

app.get("/api/blog/articles/:id", requireAuth, async (req, res) => {
  const article = await findArticleById(req.params.id);
  if (!article) {
    return res.status(404).json({ error: "Artículo no encontrado" });
  }
  res.json({ article });
});

app.post(
  "/api/blog/articles",
  requireAuth,
  upload.single("cover"),
  async (req, res) => {
    try {
      const file = req.file;
      const coverPath = file ? `/articulos/media/${file.filename}` : undefined;
      const payload = normalizePayload(req.body, coverPath);
      const article = await createArticle(payload);
      await buildPublicArtifacts();
      res.status(201).json({ article });
    } catch (error) {
      console.error("Error creando artículo:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

app.put(
  "/api/blog/articles/:id",
  requireAuth,
  upload.single("cover"),
  async (req, res) => {
    try {
      const current = await findArticleById(req.params.id);
      if (!current) {
        return res.status(404).json({ error: "Artículo no encontrado" });
      }
      const file = req.file;
      const coverPath = file ? `/articulos/media/${file.filename}` : undefined;
      const payload = normalizePayload(req.body, coverPath);
      const article = await updateArticle(req.params.id, payload);
      await buildPublicArtifacts();
      if (current.slug && current.slug !== article.slug) {
        const oldPath = path.resolve(
          PATHS.ARTICLES_DIR,
          `${current.slug}.html`
        );
        try {
          await unlink(oldPath);
        } catch (error) {
          if (error.code !== "ENOENT") {
            console.warn("No se pudo remover el antiguo HTML:", error);
          }
        }
      }
      res.json({ article });
    } catch (error) {
      console.error("Error actualizando artículo:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

app.post(
  "/api/blog/articles/:id/publish",
  requireAuth,
  async (req, res) => {
    try {
      const publish = req.body?.publish ?? true;
      const article = await setPublishStatus(req.params.id, !!publish);
      await buildPublicArtifacts();
      res.json({ article });
    } catch (error) {
      console.error("Error cambiando estado de publicación:", error);
      res.status(400).json({ error: error.message });
    }
  }
);

app.delete("/api/blog/articles/:id", requireAuth, async (req, res) => {
  try {
    const removed = await deleteArticle(req.params.id);
    await buildPublicArtifacts();
    const htmlPath = path.resolve(
      PATHS.ARTICLES_DIR,
      `${removed.slug}.html`
    );
    try {
      await unlink(htmlPath);
    } catch (error) {
      if (error.code !== "ENOENT") {
        console.warn("No se pudo eliminar el archivo de artículo:", error);
      }
    }
    res.json({ article: removed });
  } catch (error) {
    console.error("Error eliminando artículo:", error);
    res.status(400).json({ error: error.message });
  }
});

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    res.status(400).json({ error: err.message });
  } else if (err) {
    console.error("Error inesperado:", err);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

app.use((_, res) => {
  res.status(404).json({ error: "No encontrado" });
});

const PORT = process.env.BLOG_PORT || process.env.PORT || 3030;

app.listen(PORT, () => {
  console.log(`📝 Blog admin API disponible en http://localhost:${PORT}`);
});
