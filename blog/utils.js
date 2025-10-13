import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { marked } from "marked";

const WORDS_PER_MINUTE = 210;

marked.setOptions({
  mangle: false,
  headerIds: false,
});

export async function ensureDir(targetPath) {
  await mkdir(targetPath, { recursive: true });
}

export function slugify(input) {
  return String(input || "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function toPlainText(value = "") {
  return String(value)
    .replace(/<\/?[^>]+(>|$)/g, " ")
    .replace(/[`*_>#~\[\]\(\)!]/g, " ")
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function calculateReadingMinutes(raw = "") {
  const words = toPlainText(raw).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE) || 1);
}

export function buildExcerpt(source = "", maxWords = 40) {
  const words = toPlainText(source).split(/\s+/).filter(Boolean);
  if (!words.length) return "";
  if (words.length <= maxWords) return words.join(" ");
  return `${words.slice(0, maxWords).join(" ")}…`;
}

export function sanitizeTags(tags = []) {
  if (!Array.isArray(tags)) return [];
  return Array.from(
    new Set(
      tags
        .map((tag) => String(tag || "").trim())
        .filter(Boolean)
        .map((tag) => tag.replace(/\s+/g, " "))
    )
  );
}

export function formatDateISO(date) {
  if (!date) return new Date().toISOString();
  const d = date instanceof Date ? date : new Date(date);
  return d.toISOString();
}

export function formatDateHuman(date) {
  const d = date instanceof Date ? date : new Date(date || Date.now());
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    year: "numeric",
  })
    .format(d)
    .replace(".", "");
}

export function escapeXml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function ensureFilePath(filePath) {
  await ensureDir(dirname(filePath));
}

export function markdownToHtml(markdown = "") {
  const raw = marked.parse(markdown || "");
  return raw
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/href=("|\')javascript:[^"\']*\1/gi, 'href="#"')
    .replace(/on\w+=(["']).*?\1/gi, "");
}
