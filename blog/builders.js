import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";
import {
  listPublished,
  toPublicArticle,
  PATHS,
  listArticles,
} from "./storage.js";
import {
  ensureFilePath,
  escapeXml,
  formatDateHuman,
  formatDateISO,
} from "./utils.js";

const SITE_BASE_URL =
  process.env.SITE_BASE_URL || "https://www.quimicosoma.com";
const BRAND_NAME = process.env.SITE_BRAND_NAME || "Químicos OMA";

const STATIC_PAGES = [
  { loc: `${SITE_BASE_URL}/`, priority: "1.0" },
  { loc: `${SITE_BASE_URL}/catalogo.html`, priority: "0.9" },
  { loc: `${SITE_BASE_URL}/productoZoom.html`, priority: "0.6" },
  { loc: `${SITE_BASE_URL}/blog.html`, priority: "0.9" },
];

function getRelatedArticles(target, articles, limit = 3) {
  const targetTags = new Set(target.tags || []);
  return articles
    .filter((item) => item.id !== target.id)
    .map((item) => {
      const shared =
        item.tags?.filter((tag) => targetTags.has(tag)).length || 0;
      return {
        article: item,
        score: shared,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (
        new Date(b.article.publishedAt || b.article.updatedAt || 0) -
        new Date(a.article.publishedAt || a.article.updatedAt || 0)
      );
    })
    .slice(0, limit)
    .map((entry) => entry.article);
}

function renderRelatedCard(article) {
  const cover = article.coverImage || "/media/sliderN1.jpg";
  const tags = Array.isArray(article.tags) ? article.tags : [];
  const date = article.publishedAt
    ? formatDateHuman(article.publishedAt)
    : "";
  const duration =
    article.readingMinutes != null
      ? `${article.readingMinutes} min lectura`
      : "";

  return `<div class="col-12 col-md-4">
  <a class="news-card h-100" href="../articulos/${article.slug}.html" aria-label="${escapeXml(
    article.title
  )}">
    <div class="news-card__media">
      <img src="${escapeXml(cover)}" alt="${escapeXml(
    article.title
  )}" loading="lazy" />
    </div>
    <div class="news-card__body">
      <div class="news-card__chips">
        ${tags
          .slice(0, 2)
          .map((tag) => `<span class="chip">${escapeXml(tag)}</span>`)
          .join("")}
      </div>
      <h3 class="news-card__title">${escapeXml(article.title)}</h3>
      <p class="news-card__excerpt">${escapeXml(article.excerpt || "")}</p>
      <div class="news-card__divider" role="separator" aria-hidden="true"></div>
      <div class="news-card__meta">
        <span>${escapeXml(date)}</span>
        ${
          duration
            ? `<span class="sep">•</span><span>${escapeXml(duration)}</span>`
            : ""
        }
      </div>
    </div>
  </a>
</div>`;
}

function renderArticleHtml(article, relatedArticles = []) {
  const canonical = `${SITE_BASE_URL}/articulos/${article.slug}.html`;
  const cover = article.coverImage
    ? `${SITE_BASE_URL}${article.coverImage}`
    : "";
  const publishedHuman = article.publishedAt
    ? formatDateHuman(article.publishedAt)
    : "";
  const excerpt =
    article.excerpt || article.seoDescription || article.content?.plain || "";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.seoDescription,
    image: cover || undefined,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: {
      "@type": "Organization",
      name: BRAND_NAME,
    },
    publisher: {
      "@type": "Organization",
      name: BRAND_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_BASE_URL}/media/oma.png`,
      },
    },
    mainEntityOfPage: canonical,
  };

  const ldJson = JSON.stringify(jsonLd, null, 2);

  const tagsList = (article.tags || [])
    .map((tag) => `<span class="chip">${escapeXml(tag)}</span>`)
    .join("");

  const relatedMarkup = relatedArticles
    .map((item) => renderRelatedCard(item))
    .join("");

  const primaryTag = article.tags?.[0] || "";
  const yearNow = new Date().getFullYear();

  return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <title>${escapeXml(article.seoTitle || article.title)}</title>
    <meta name="description" content="${escapeXml(
      article.seoDescription || ""
    )}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeXml(
      article.seoTitle || article.title
    )}" />
    <meta property="og:description" content="${escapeXml(
      article.seoDescription || ""
    )}" />
    ${
      cover
        ? `<meta property="og:image" content="${escapeXml(cover)}" />
    <meta property="twitter:image" content="${escapeXml(cover)}" />`
        : ""
    }
    <meta property="og:url" content="${escapeXml(canonical)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="keywords" content="${escapeXml(
      (article.seoKeywords || []).join(", ")
    )}" />
    ${
      article.publishedAt
        ? `<meta property="article:published_time" content="${escapeXml(
            article.publishedAt
          )}" />`
        : ""
    }
    <meta property="article:modified_time" content="${escapeXml(
      article.updatedAt || article.publishedAt || ""
    )}" />
    <link rel="canonical" href="${escapeXml(canonical)}" />
    <link
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      rel="stylesheet"
    />
    <link
      rel="stylesheet"
      href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css"
    />
    <link rel="stylesheet" href="../dist/css/main.css" />
    <script type="application/ld+json">
${ldJson}
    </script>
  </head>
  <body>
    <header id="header">
      <nav class="navbar navbar-expand-lg">
        <div class="container">
          <a class="navbar-brand" href="../index.html">
            <img src="/media/oma.png" alt="${escapeXml(
              BRAND_NAME
            )}" width="120" />
          </a>
          <button
            class="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarNav"
            aria-controls="navbarNav"
            aria-expanded="false"
            aria-label="Alternar navegación"
          >
            <span class="navbar-toggler-icon"></span>
          </button>
          <div class="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul class="navbar-nav gap-3">
              <li class="nav-item">
                <a class="nav-link" href="../index.html#inicio">Inicio</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="../catalogo.html">Productos</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="../blog.html">Blog</a>
              </li>
              <li class="nav-item">
                <a class="nav-link" href="../index.html#contacto">Contacto</a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>

    <main class="blog-article-page">
      <section class="blog-article-hero">
        <div class="container">
          <div class="blog-article-hero__top">
            <a class="btn btn-outline-primary btn-sm" href="../blog.html">
            <i class="fa-solid fa-arrow-left-long me-2"></i>Volver al blog
          </a>
          <nav aria-label="breadcrumb" class="blog-article-breadcrumb">
            <ol class="breadcrumb mb-3">
              <li class="breadcrumb-item"><a href="../index.html">Inicio</a></li>
              <li class="breadcrumb-item"><a href="../blog.html">Blog</a></li>
              <li class="breadcrumb-item active" aria-current="page">${escapeXml(
                article.title
              )}</li>
            </ol>
          </nav>
          </div>
          <div class="row align-items-start gy-4">
            <div class="col-lg-7">
              <h1 class="blog-article-title" itemprop="headline">
                ${escapeXml(article.title)}
              </h1>
              ${
                excerpt
                  ? `<p class="blog-article-excerpt">${escapeXml(
                      excerpt
                    )}</p>`
                  : ""
              }
              <div class="blog-article-meta">
                ${
                  tagsList
                    ? `<div class="blog-article-tags">${tagsList}</div>`
                    : ""
                }
                <div class="blog-article-details">
                  <span><i class="fa-solid fa-calendar-days me-2"></i>${escapeXml(
                    publishedHuman
                  )}</span>
                  <span class="sep">•</span>
                  <span><i class="fa-solid fa-clock me-2"></i>${escapeXml(
                    `${article.readingMinutes} min lectura`
                  )}</span>
                </div>
              </div>
            </div>
            ${
              cover
                ? `<div class="col-lg-5">
              <figure class="blog-article-figure">
                <img
                  src="${escapeXml(article.coverImage)}"
                  alt="${escapeXml(article.title)}"
                  loading="lazy"
                  itemprop="image"
                />
                ${
                  primaryTag
                    ? `<span class="blog-article-figure__tag">${escapeXml(
                        primaryTag
                      )}</span>`
                    : ""
                }
              </figure>
            </div>`
                : ""
            }
          </div>
        </div>
      </section>

      <section class="blog-article-content">
        <div class="container">
          <article class="blog-article-body" itemscope itemtype="https://schema.org/BlogPosting">
            ${article.publishedAt ? `<meta itemprop="datePublished" content="${escapeXml(article.publishedAt)}" />` : ""}
            <meta itemprop="timeRequired" content="PT${Number(article.readingMinutes || 1)}M" />
            <meta itemprop="headline" content="${escapeXml(article.title)}" />
            ${
              cover
                ? `<meta itemprop="image" content="${escapeXml(article.coverImage)}" />`
                : ""
            }
            <div class="blog-article-body__content" itemprop="articleBody">
              ${article.content?.html ?? ""}
            </div>
          </article>
          <div class="blog-article-nav">
            <a class="btn btn-outline-primary" href="../blog.html">
              <i class="fa-solid fa-arrow-left-long me-2"></i>Volver al listado
            </a>
          </div>
        </div>
      </section>

      ${
        relatedMarkup
          ? `<section class="blog-article-related">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h2 class="sec-title mb-0">Artículos relacionados</h2>
            <a class="btn btn-link btn-sm" href="../blog.html">Ver todos</a>
          </div>
          <div class="row g-4">
            ${relatedMarkup}
          </div>
        </div>
      </section>`
          : ""
      }

      <footer class="blog-article-footer text-center text-muted small">
        <p>© ${yearNow} ${escapeXml(BRAND_NAME)} — Todos los derechos reservados.</p>
      </footer>
    </main>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
  </body>
</html>`;
}

async function writePublicJson(publicArticles) {
  await ensureFilePath(PATHS.PUBLIC_JSON_PATH);
  await writeFile(
    PATHS.PUBLIC_JSON_PATH,
    JSON.stringify({ articles: publicArticles }, null, 2)
  );
}

async function writeArticlePages(articles) {
  for (const article of articles) {
    const related = getRelatedArticles(article, articles);
    const html = renderArticleHtml(article, related);
    const target = path.resolve(PATHS.ARTICLES_DIR, `${article.slug}.html`);
    await ensureFilePath(target);
    await writeFile(target, html, "utf8");
  }
}

async function buildSitemap(publicArticles) {
  const urls = [...STATIC_PAGES];
  for (const article of publicArticles) {
    urls.push({
      loc: `${SITE_BASE_URL}/articulos/${article.slug}.html`,
      lastmod: article.updatedAt ?? article.publishedAt ?? formatDateISO(),
      priority: "0.8",
    });
  }

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map((url) => {
    const lastmod = url.lastmod
      ? `<lastmod>${escapeXml(
          new Date(url.lastmod).toISOString()
        )}</lastmod>`
      : `<lastmod>${new Date().toISOString()}</lastmod>`;
    return `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    ${lastmod}
    <priority>${url.priority || "0.5"}</priority>
  </url>`;
  })
  .join("\n")}
</urlset>`;

  await ensureFilePath(PATHS.SITEMAP_PATH);
  await writeFile(PATHS.SITEMAP_PATH, sitemapXml, "utf8");
}

async function buildRss(publicArticles) {
  const items = publicArticles
    .map((article) => {
      const link = `${SITE_BASE_URL}/articulos/${article.slug}.html`;
      return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
      ${
        article.publishedAt
          ? `<pubDate>${new Date(article.publishedAt).toUTCString()}</pubDate>`
          : ""
      }
      <description><![CDATA[${article.excerpt || ""}]]></description>
      <content:encoded><![CDATA[${article.contentHtml || ""}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(`${BRAND_NAME} Blog`)}</title>
    <link>${escapeXml(`${SITE_BASE_URL}/blog.html`)}</link>
    <description>${escapeXml(
      `Novedades y artículos técnicos de ${BRAND_NAME}`
    )}</description>
${items}
  </channel>
</rss>`;

  await ensureFilePath(PATHS.RSS_PATH);
  await writeFile(PATHS.RSS_PATH, rssXml, "utf8");
}

export async function buildPublicArtifacts() {
  const published = await listPublished();
  const publicArticles = published.map((article) => ({
    ...toPublicArticle(article),
    updatedAt: article.updatedAt,
  }));

  await Promise.all([
    writePublicJson(publicArticles),
    writeArticlePages(published),
    buildSitemap(publicArticles),
    buildRss(publicArticles),
  ]);
}

export async function ensureArtifacts() {
  await ensureFilePath(PATHS.PUBLIC_JSON_PATH);
  await ensureFilePath(PATHS.RSS_PATH);
  await ensureFilePath(PATHS.SITEMAP_PATH);
  await writePublicJson(
    (await listPublished()).map((article) => ({
      ...toPublicArticle(article),
      updatedAt: article.updatedAt,
    }))
  );
}

const isCli =
  process.argv[1] &&
  new URL(`file://${process.argv[1]}`).href === import.meta.url;

if (isCli) {
  buildPublicArtifacts()
    .then(() => {
      console.log("✅ Artefactos del blog generados");
    })
    .catch((error) => {
      console.error("❌ Error al generar artefactos del blog:", error);
      process.exit(1);
    });
}
