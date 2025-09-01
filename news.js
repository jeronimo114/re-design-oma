// news.js  (ES module)
import { articulos } from "./articulos.js";

function renderArticles(list) {
  const grid = document.getElementById("articlesGrid");
  if (!grid) return;

  grid.innerHTML = list
    .map((a) => {
      const fecha = new Date(a.fecha).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      return `
<li class="col-12 col-md-6 col-lg-4">
  <a class="news-card h-100" href="articulos/${a.slug}.html" aria-label="${a.titulo}">
    <div class="news-card__media">
      <img src="${a.cover}" alt="${a.titulo}" loading="lazy" />
    </div>

    <div class="news-card__body">
      <div class="news-card__chips">
        <span class="chip">${a.categoria}</span>
      </div>

      <h3 class="news-card__title">${a.titulo}</h3>

      <p class="news-card__excerpt">${a.extracto}</p>

      <div class="news-card__divider" role="separator" aria-hidden="true"></div>

      <div class="news-card__meta">
        <time datetime="${a.fecha}">${fecha}</time>
        <span class="sep">•</span>
        <span>${a.lectura}</span>
      </div>
    </div>
  </a>
</li>`;
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  renderArticles(articulos);
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
