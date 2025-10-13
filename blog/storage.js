import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { randomUUID } from "node:crypto";
import {
  buildExcerpt,
  calculateReadingMinutes,
  ensureFilePath,
  formatDateISO,
  markdownToHtml,
  sanitizeTags,
  slugify,
  toPlainText,
} from "./utils.js";

const BLOG_DIR = fileURLToPath(new URL(".", import.meta.url));
const ROOT_DIR = resolve(BLOG_DIR, "..");

export const PATHS = {
  ROOT_DIR,
  DATA_PATH: resolve(ROOT_DIR, "data/blog.db.json"),
  PUBLIC_JSON_PATH: resolve(ROOT_DIR, "blog/articles.json"),
  RSS_PATH: resolve(ROOT_DIR, "blog/rss.xml"),
  SITEMAP_PATH: resolve(ROOT_DIR, "sitemap.xml"),
  ARTICLES_DIR: resolve(ROOT_DIR, "articulos"),
  MEDIA_DIR: resolve(ROOT_DIR, "articulos/media"),
};

const VALID_STATUS = new Set(["draft", "published"]);

async function readDB() {
  try {
    const buffer = await readFile(PATHS.DATA_PATH, "utf8");
    const parsed = JSON.parse(buffer);
    if (!parsed.articles || !Array.isArray(parsed.articles)) {
      return { articles: [] };
    }
    return { articles: parsed.articles };
  } catch (error) {
    if (error.code === "ENOENT") {
      return { articles: [] };
    }
    throw error;
  }
}

async function writeDB(db) {
  await ensureFilePath(PATHS.DATA_PATH);
  await writeFile(PATHS.DATA_PATH, JSON.stringify(db, null, 2));
}

function uniqueSlug(baseSlug, articles, currentId = null) {
  let slug = baseSlug || "articulo";
  let counter = 1;
  const exists = (candidate) =>
    articles.some(
      (article) =>
        article.slug === candidate && (!currentId || article.id !== currentId)
    );
  while (exists(slug)) {
    counter += 1;
    slug = `${baseSlug}-${counter}`;
  }
  return slug;
}

function normalizeKeywords(value = []) {
  if (Array.isArray(value)) {
    return value
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeStatus(value, fallback = "draft") {
  const status = String(value || "").toLowerCase();
  return VALID_STATUS.has(status) ? status : fallback;
}

function composeArticle(record, payload, allArticles) {
  const now = new Date();
  const base = record ?? {
    id: randomUUID(),
    createdAt: formatDateISO(now),
  };

  const title = payload.title ? String(payload.title).trim() : base.title;
  if (!title) {
    throw new Error("El título es obligatorio");
  }

  const contentMarkdown =
    payload.contentMarkdown ?? payload.content ?? base.content?.markdown ?? "";
  const html = markdownToHtml(contentMarkdown);

  const incomingSlug = payload.slug ? slugify(payload.slug) : null;

  const combined = {
    ...base,
    title,
    slug: base.slug,
    updatedAt: formatDateISO(now),
    status: normalizeStatus(payload.status, base.status ?? "draft"),
    tags: sanitizeTags(payload.tags ?? base.tags ?? []),
    coverImage: payload.coverImage ?? base.coverImage ?? "",
    excerpt:
      payload.excerpt && payload.excerpt.trim()
        ? payload.excerpt.trim()
        : buildExcerpt(contentMarkdown || title),
    seoTitle:
      payload.seoTitle && payload.seoTitle.trim()
        ? payload.seoTitle.trim()
        : title,
    seoDescription:
      payload.seoDescription && payload.seoDescription.trim()
        ? payload.seoDescription.trim()
        : buildExcerpt(contentMarkdown || title, 30),
    seoKeywords: normalizeKeywords(
      payload.seoKeywords ?? base.seoKeywords ?? []
    ),
    readingMinutes: calculateReadingMinutes(contentMarkdown),
    content: {
      markdown: contentMarkdown,
      html,
      plain: toPlainText(html),
    },
  };

  const requestedPublishedAt = payload.publishedAt
    ? formatDateISO(payload.publishedAt)
    : null;

  if (
    !base.slug ||
    (payload.title && payload.title !== base.title) ||
    incomingSlug
  ) {
    const baseSlug = incomingSlug || slugify(title);
    combined.slug = uniqueSlug(baseSlug, allArticles, base.id);
  }

  if (combined.status === "published") {
    combined.publishedAt = base.publishedAt
      ? formatDateISO(requestedPublishedAt ?? base.publishedAt)
      : requestedPublishedAt ?? formatDateISO(now);
  } else {
    combined.publishedAt = requestedPublishedAt ?? null;
  }

  return combined;
}

export async function listArticles() {
  const db = await readDB();
  return db.articles || [];
}

export async function listPublished() {
  const articles = await listArticles();
  return articles
    .filter((article) => article.status === "published" && article.publishedAt)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));
}

export async function findArticleById(id) {
  const articles = await listArticles();
  return articles.find((item) => item.id === id) ?? null;
}

export async function findArticleBySlug(slug) {
  const articles = await listArticles();
  return (
    articles.find((item) => item.slug === slug && item.status === "published") ??
    null
  );
}

export async function createArticle(payload) {
  const db = await readDB();
  const article = composeArticle(null, payload, db.articles);
  db.articles.push(article);
  await writeDB(db);
  return article;
}

export async function updateArticle(id, payload) {
  const db = await readDB();
  const index = db.articles.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("Artículo no encontrado");
  }
  const updated = composeArticle(
    db.articles[index],
    payload,
    db.articles.filter((item) => item.id !== id)
  );
  db.articles[index] = updated;
  await writeDB(db);
  return updated;
}

export async function deleteArticle(id) {
  const db = await readDB();
  const index = db.articles.findIndex((item) => item.id === id);
  if (index === -1) {
    throw new Error("Artículo no encontrado");
  }
  const [removed] = db.articles.splice(index, 1);
  await writeDB(db);
  return removed;
}

export async function setPublishStatus(id, publish) {
  const db = await readDB();
  const index = db.articles.findIndex((item) => item.id === id);
  if (index === -1) throw new Error("Artículo no encontrado");
  const current = db.articles[index];
  const status = publish ? "published" : "draft";
  const updated = composeArticle(
    { ...current, status },
    { status },
    db.articles.filter((item) => item.id !== id)
  );
  db.articles[index] = updated;
  await writeDB(db);
  return updated;
}

export function toPublicArticle(article) {
  return {
    id: article.id,
    title: article.title,
    slug: article.slug,
    tags: article.tags ?? [],
    coverImage: article.coverImage ?? "",
    excerpt: article.excerpt ?? "",
    readingMinutes: article.readingMinutes ?? 1,
    publishedAt: article.publishedAt ?? null,
    seoTitle: article.seoTitle ?? article.title,
    seoDescription: article.seoDescription ?? article.excerpt,
    seoKeywords: article.seoKeywords ?? [],
    contentHtml: article.content?.html ?? "",
  };
}
