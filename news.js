// news.js  (ES module)
import { articulos as fallbackArticulos } from "./articulos.js";

const MAX_ITEMS = 6;

function toDisplayArticle(item) {
  if (!item) return null;
  const published = item.publishedAt || item.fecha;
  const reading =
    item.readingMinutes != null
      ? `${item.readingMinutes} min`
      : item.lectura || "";
  const cover = item.coverImage || item.cover || "";
  const title = item.title || item.titulo || "Artículo";
  const excerpt = item.excerpt || item.extracto || "";
  const category =
    (Array.isArray(item.tags) && item.tags[0]) || item.categoria || "Blog";
  return {
    slug: item.slug,
    title,
    excerpt,
    cover,
    category,
    reading,
    published,
  };
}

function renderArticles(list) {
  const grid = document.getElementById("articlesGrid");
  if (!grid) return;

  grid.innerHTML = list
    .map((raw) => {
      const article = toDisplayArticle(raw);
      if (!article || !article.slug) return "";

      const date = article.published
        ? new Date(article.published)
        : new Date();
      const fecha = date.toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      return `
<li class="col-12 col-md-6 col-lg-4">
  <a class="news-card h-100" href="articulos/${article.slug}.html" aria-label="${article.title}">
    <div class="news-card__media">
      <img src="${article.cover}" alt="${article.title}" loading="lazy" />
    </div>

    <div class="news-card__body">
      <div class="news-card__chips">
        <span class="chip">${article.category}</span>
      </div>

      <h3 class="news-card__title">${article.title}</h3>

      <p class="news-card__excerpt">${article.excerpt}</p>

      <div class="news-card__divider" role="separator" aria-hidden="true"></div>

      <div class="news-card__meta">
        <time datetime="${article.published || ""}">${fecha}</time>
        <span class="sep">•</span>
        <span>${article.reading}</span>
      </div>
    </div>
  </a>
</li>`;
    })
    .join("");
}

async function loadArticles() {
  try {
    const response = await fetch("blog/articles.json", { cache: "no-store" });
    if (!response.ok) throw new Error("Respuesta no OK");
    const data = await response.json();
    if (!data?.articles?.length) {
      return fallbackArticulos;
    }
    return data.articles;
  } catch (error) {
    console.warn(
      "No se pudo cargar blog/articles.json, usando fallback:",
      error
    );
    return fallbackArticulos;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const articles = await loadArticles();
  renderArticles(articles.slice(0, MAX_ITEMS));
});

// Navegación con botones
const track = document.getElementById("articlesGrid");
const btnNext = document.getElementById("newsNext");
const btnPrev = document.getElementById("newsPrev");

function scrollByCards(dir = 1) {
  if (!track) return;
  const card = track.querySelector("li");
  const step = card
    ? card.getBoundingClientRect().width + 40
    : track.clientWidth * 0.8;
  track.scrollBy({ left: step * dir, behavior: "smooth" });
}

btnNext?.addEventListener("click", () => scrollByCards(1));
btnPrev?.addEventListener("click", () => scrollByCards(-1));

let isDown = false,
  startX,
  scrollLeft;
track?.addEventListener("mousedown", (e) => {
  isDown = true;
  track.classList.add("drag");
  startX = e.pageX - track.offsetLeft;
  scrollLeft = track.scrollLeft;
});
track?.addEventListener("mouseleave", () => {
  isDown = false;
  track.classList.remove("drag");
});
track?.addEventListener("mouseup", () => {
  isDown = false;
  track.classList.remove("drag");
});
track?.addEventListener("mousemove", (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - track.offsetLeft;
  const walk = (x - startX) * 1.2;
  track.scrollLeft = scrollLeft - walk;
});
