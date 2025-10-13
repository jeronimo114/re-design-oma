import { articulos as fallbackArticulos } from "./articulos.js";

const state = {
  articles: [],
  query: "",
  activeTags: new Set(),
};

const els = {
  search: document.getElementById("blogSearch"),
  results: document.getElementById("blogResults"),
  filters: document.getElementById("blogFilters"),
  feedback: document.getElementById("blogFeedback"),
  clear: document.getElementById("blogClearFilters"),
};

const formatter = new Intl.DateTimeFormat("es-CO", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(date) {
  if (!date) return "";
  try {
    return formatter.format(new Date(date)).replace(".", "");
  } catch {
    return "";
  }
}

function renderFeedback(message, isError = false) {
  if (!els.feedback) return;
  els.feedback.textContent = message;
  els.feedback.classList.remove("d-none", "alert-info", "alert-danger");
  els.feedback.classList.add(isError ? "alert-danger" : "alert-info");
}

function clearFeedback() {
  if (!els.feedback) return;
  els.feedback.classList.add("d-none");
}

function createArticleCard(article) {
  const date = formatDate(article.publishedAt);
  const duration =
    article.readingMinutes != null
      ? `${article.readingMinutes} min de lectura`
      : "Lectura rápida";
  const tags =
    Array.isArray(article.tags) && article.tags.length
      ? article.tags
      : ["Blog"];
  const cover = article.coverImage || "/media/sliderN1.jpg";
  const excerpt =
    article.excerpt || article.seoDescription || "Consulta el artículo completo.";
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <a class="news-card h-100" href="articulos/${article.slug}.html" aria-label="${article.title}">
        <div class="news-card__media">
          <img src="${cover}" alt="${article.title}" loading="lazy" />
        </div>

        <div class="news-card__body">
          <div class="news-card__chips">
            ${tags
              .map(
                (tag) =>
                  `<span class="chip">${tag}</span>`
              )
              .join("")}
          </div>

          <h3 class="news-card__title">${article.title}</h3>

          <p class="news-card__excerpt">${excerpt}</p>

          <div class="news-card__divider" role="separator" aria-hidden="true"></div>

          <div class="news-card__meta">
            <time datetime="${article.publishedAt || ""}">${date}</time>
            <span class="sep">•</span>
            <span>${duration}</span>
          </div>
        </div>
      </a>
    </div>
  `;
}

function renderArticles(articles) {
  if (!els.results) return;
  if (!articles.length) {
    els.results.innerHTML = `
      <div class="col-12">
        <div class="alert alert-warning" role="alert">
          No encontramos resultados que coincidan con tu búsqueda. Ajusta los filtros o intenta con palabras clave diferentes.
        </div>
      </div>`;
    return;
  }
  els.results.innerHTML = articles.map(createArticleCard).join("");
}

function updateTagUI() {
  if (!els.filters) return;
  const tags = new Set();
  state.articles.forEach((article) => {
    (article.tags || []).forEach((tag) => tags.add(tag));
  });

  if (!tags.size) {
    els.filters.innerHTML =
      '<span class="text-muted">Los artículos publicados aún no tienen etiquetas.</span>';
    return;
  }

  const sorted = Array.from(tags).sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );
  els.filters.innerHTML = sorted
    .map((tag) => {
      const isActive = state.activeTags.has(tag);
      const baseClass = isActive
        ? "btn btn-sm btn-primary"
        : "btn btn-sm btn-outline-primary";
      return `<button type="button" class="${baseClass}" data-tag="${tag}">${tag}</button>`;
    })
    .join("");
}

function applyFilters() {
  const query = state.query.trim().toLowerCase();
  const hasQuery = query.length > 1;
  const hasTags = state.activeTags.size > 0;

  return state.articles.filter((article) => {
    const matchesQuery = hasQuery
      ? [
          article.title,
          article.excerpt,
          article.seoDescription,
          ...(article.tags || []),
        ]
          .join(" ")
          .toLowerCase()
          .includes(query)
      : true;

    const matchesTags = hasTags
      ? (article.tags || []).some((tag) => state.activeTags.has(tag))
      : true;

    return matchesQuery && matchesTags;
  });
}

function update() {
  const filtered = applyFilters();
  clearFeedback();
  renderArticles(filtered);
}

function attachEvents() {
  els.search?.addEventListener("input", (event) => {
    state.query = event.target.value;
    update();
  });

  els.clear?.addEventListener("click", () => {
    state.query = "";
    state.activeTags.clear();
    if (els.search) els.search.value = "";
    updateTagUI();
    update();
  });

  els.filters?.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-tag]");
    if (!button) return;
    const tag = button.dataset.tag;
    if (state.activeTags.has(tag)) {
      state.activeTags.delete(tag);
    } else {
      state.activeTags.add(tag);
    }
    updateTagUI();
    update();
  });
}

function normalizeArticle(raw) {
  return {
    slug: raw.slug,
    title: raw.title || "Artículo",
    excerpt: raw.excerpt || raw.seoDescription || "",
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    coverImage: raw.coverImage,
    publishedAt: raw.publishedAt,
    readingMinutes: raw.readingMinutes,
    seoDescription: raw.seoDescription,
  };
}

async function loadArticles() {
  try {
    const response = await fetch(`blog/articles.json?${Date.now()}`, {
      cache: "no-store",
    });
    if (!response.ok) throw new Error("Respuesta no OK");
    const data = await response.json();
    if (!data?.articles?.length) throw new Error("Sin artículos publicados");
    return data.articles.map(normalizeArticle);
  } catch (error) {
    console.warn("Fallo cargando artículos del blog, usando fallback:", error);
    return fallbackArticulos.map(normalizeArticle);
  }
}

async function bootstrap() {
  if (!els.results) return;
  renderFeedback("Cargando artículos…");
  state.articles = await loadArticles();
  updateTagUI();
  update();
}

attachEvents();
bootstrap().then(() => clearFeedback());
