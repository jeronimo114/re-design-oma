// Helper: parse query‑string parameters
function getQueryParams() {
  const params = {};
  window.location.search
    .substring(1)
    .split("&")
    .forEach((pair) => {
      if (!pair) return;
      const [k, v] = pair.split("=");
      if (k) params[decodeURIComponent(k)] = decodeURIComponent(v || "");
    });
  return params;
}

// Crop-problem relationships
const cropProblems = {
  papa: [
    "Gota",
    "Tizón Tardío",
    "Polilla Guatemalteca",
    "Marchitez Bacteriana",
  ],
  rosa: ["Mildeo", "Ácaros", "Trips", "Mancha Negra"],
  clavel: ["Fusarium", "Botritis", "Nemátodos", "Virus del Bronceado"],
  pompon: ["Oídio", "Mosca Blanca", "Minador de Hoja", "Royas"],
  crisantemo: ["Pythium", "Mancha Foliar", "Pulgones", "Tuta Absoluta"],
  hortensia: [
    "Clorosis",
    "Podredumbre Radicular",
    "Cochinillas",
    "Antracnosis",
  ],
  arroz: ["Pyricularia", "Helminthosporium", "Chinche del Arroz", "Malezas"],
  tomate: ["Tuta Absoluta", "Mosca Blanca", "Virus del Mosaico", "Oídio"],
  cebolla: ["Trips", "Botritis", "Mildiu", "Podredumbre Blanca"],
  frijol: ["Antracnosis", "Mosca Blanca", "Roya", "Mustia Hilachosa"],
  fresa: ["Ácaro Ciclamen", "Botritis", "Oídio", "Mancha Angular"],
  aguacate: [
    "Trips",
    "Ácaro Cristalino",
    "Antracnosis",
    "Podredumbre Radicular",
  ],
  maiz: ["Gusano Cogollero", "Mancha de Asfalto", "Tizón Norteño", "Pulgones"],
  arveja: ["Oídio", "Mildiu", "Trips", "Virus del Enanismo"],
};

document.addEventListener("DOMContentLoaded", () => {
  // Detect if we are on the catálogo page
  const isCatalogoPage = window.location.pathname.includes("catalogo");
  /**
   * 1) Inicialización de AOS (Animate On Scroll)
   */
  try {
    AOS.init({
      duration: 1000,
      once: true,
    });
  } catch (error) {
    console.error("Error al inicializar AOS:", error);
  }

  /**
   * 2) GSAP - Animaciones para el contenido del Hero
   */
  try {
    gsap.from(".hero-content h1", { duration: 1, opacity: 0, y: -50 });
    gsap.from(".hero-content p", {
      duration: 1,
      opacity: 0,
      y: 50,
      delay: 0.5,
    });
  } catch (error) {
    console.error("Error con las animaciones de GSAP:", error);
  }

  /**
   * 3) Swiper - Slider de Productos
   */
  try {
    new Swiper(".product-swiper", {
      loop: true,
      pagination: {
        el: ".product-swiper .swiper-pagination",
        clickable: true,
      },
      autoplay: {
        delay: 5000,
        disableOnInteraction: false,
      },
      slidesPerView: 1,
      spaceBetween: 20,
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  } catch (error) {
    console.error("Error al inicializar el slider de productos:", error);
  }

  /**
   * 4) Swiper - Slider de Noticias
   */
  try {
    new Swiper(".news-swiper", {
      loop: true,
      pagination: {
        el: ".news-swiper .swiper-pagination",
        clickable: true,
      },
      autoplay: {
        delay: 6000,
        disableOnInteraction: false,
      },
      slidesPerView: 1,
      spaceBetween: 20,
      breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
      },
    });
  } catch (error) {
    console.error("Error al inicializar el slider de noticias:", error);
  }

  /**
   * 5) Leaflet - Mapa de Representantes con todos los datos
   *    Mostramos cada región como un marcador en Colombia
   */
  try {
    const mapContainer = document.getElementById("map");
    if (mapContainer) {
      // Inicializa el mapa centrado en Colombia
      const map = L.map("map").setView([4.5, -74], 6);

      // Capa de OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      // Array de representantes con coordenadas aproximadas
      const representantes = [
        {
          country: "Colombia",
          region: "ANTIOQUIA FLORES",
          lat: 5.9,
          lng: -75.8,
          reps: [
            "Edwin Martinez - Cel. 316-5275606",
            "Erika Vanegas - Cel. 316-2863143",
          ],
        },
        {
          country: "Colombia",
          region: "ANTIOQUIA PAPA – HORTALIZAS",
          lat: 6.2,
          lng: -75.39,
          reps: [
            "Jorge Restrepo - Cel. 316-4714542",
            "Jhony Alexander Gómez - Cel. 316-6916641",
          ],
        },
        {
          country: "Colombia",
          region: "CUNDINAMARCA FLORES",
          lat: 4.91,
          lng: -74.06,
          reps: [
            "Martha Gualtero - Cel. 311-8115613",
            "María del Pilar Guzmán - Cel. 311-8115614",
          ],
        },
        {
          country: "Colombia",
          region: "CUNDINAMARCA PAPA – HORTALIZAS",
          lat: 5.03,
          lng: -73.99,
          reps: [
            "Adielth Pinilla - Cel. 320-3337754",
            "Gina Paola Piñeros - Cel. 316-4723286",
            "Juan Gilberto Moncada - Cel. 320-3568048",
          ],
        },
        {
          country: "Colombia",
          region: "BOYACÁ",
          lat: 5.57,
          lng: -73.36,
          reps: [
            "William Torres - Cel. 310-3429421",
            "Adriana Tocarruncho - Cel. 310-2406224",
          ],
        },
        {
          country: "Colombia",
          region: "NARIÑO",
          lat: 1.21,
          lng: -77.28,
          reps: [
            "Henry Rueda - Cel. 320-3470039",
            "Edwin Mora - Cel. 317-3659711",
          ],
        },
        {
          country: "Colombia",
          region: "SANTANDER",
          lat: 7.13,
          lng: -73.13,
          reps: [
            "Jaime Andrés Báez - Cel. 314-3570633",
            "Ernesto Vergel - Cel. 314-3570642",
          ],
        },
        {
          country: "Colombia",
          region: "VALLE DEL CAUCA",
          lat: 3.45,
          lng: -76.53,
          reps: ["Cesar Augusto Rivas - Cel. 314-3566836"],
        },
        {
          country: "Colombia",
          region: "NORTE DE SANTANDER",
          lat: 7.91,
          lng: -72.5,
          reps: [
            "Carmen Elena Becerra - Cel. 322-5149964",
            "Edsson Alí Romero - Cel. 310-2406205",
          ],
        },
        {
          country: "Colombia",
          region: "META – CASANARE",
          lat: 4.1,
          lng: -73.64,
          reps: [
            "Mauricio Bastidas - Cel. 311-2761794",
            "Claudia Alejandra Aponte - Cel. 320-3111346",
          ],
        },
        {
          country: "Colombia",
          region: "TOLIMA",
          lat: 4.14,
          lng: -75.24,
          reps: [
            "Favian Sanchez - Cel. 317-3671277",
            "Juan Manuel Garcia - Cel. 314-2024279",
          ],
        },
        {
          country: "Colombia",
          region: "HUILA",
          lat: 2.93,
          lng: -75.28,
          reps: [
            "Sergio Fernando Gualtero - Cel. 314-3569337",
            "Luis Fernando Ardila - Cel. 312-4736210",
          ],
        },
        {
          country: "Colombia",
          region: "CÓRDOBA – COSTA CARIBE",
          lat: 8.04,
          lng: -75.58,
          reps: ["Wilson Calderín - Cel. 312-6032541"],
        },
        {
          country: "República Dominicana",
          region: "REPÚBLICA DOMINICANA",
          lat: 19.4,
          lng: -70.4,
          reps: [
            "AGROTEL S.R.L. - Tel. +1 809-276-3016",
            "Autop. Ramón Cáceres 10, 41000",
            "Web: agrotel.com.do",
          ],
        },
        {
          country: "Panamá",
          region: "PANAMÁ – CHIRIQUÍ",
          lat: 8.43,
          lng: -82.43,
          reps: [
            "El Rancherito S.A. - Tel. 722-2811 / 722-2712",
            "Coquito, David – Chiriquí",
            "E-mail: administracion@elrancheritopanama.com",
          ],
        },
      ];

      const markers = [];

      // Agregamos un marcador con popup por cada región
      representantes.forEach((rep) => {
        const marker = L.marker([rep.lat, rep.lng]).addTo(map);
        marker._country = rep.country; // guarda país en el propio marker
        markers.push(marker); // almacena referencia global
        let popupHTML = `<strong>${rep.region}</strong><br/>`;
        rep.reps.forEach((r) => {
          popupHTML += `${r}<br/>`;
        });
        marker.bindPopup(popupHTML);
      });
      /* ---------- Cobertura por país: poblar listas y filtrar mapa ---------- */
      function populateCountryLists() {
        const lists = {
          Colombia: document.getElementById("listCol"),
          Panamá: document.getElementById("listPan"),
          "República Dominicana": document.getElementById("listRD"),
        };
        representantes.forEach((rep) => {
          const li = document.createElement("li");
          li.className = "mb-3";
          li.innerHTML = `<strong>${rep.region}</strong><br>${rep.reps.join(
            "<br>"
          )}`;
          if (lists[rep.country]) lists[rep.country].appendChild(li);
        });
      }

      function filterMarkers(country) {
        if (!country) {
          markers.forEach((m) => map.addLayer(m));
          return;
        }

        const bounds = [];
        markers.forEach((m) => {
          if (m._country === country) {
            map.addLayer(m);
            bounds.push(m.getLatLng());
          } else {
            map.removeLayer(m);
          }
        });

        if (bounds.length) {
          map.fitBounds(bounds, { padding: [40, 40] });
        }
      }

      /* Ejecuta una vez cargado el mapa */
      populateCountryLists();

      /* Maneja la expansión/colapso de las tarjetas de país */
      document.querySelectorAll(".country-collapse").forEach((col) => {
        col.addEventListener("show.bs.collapse", () => {
          filterMarkers(col.dataset.country);
        });
        col.addEventListener("hide.bs.collapse", () => {
          // al cerrar, mostramos todos nuevamente
          filterMarkers(null);
        });
      });

      // Ajusta el mapa al cambiar tamaño de ventana
      window.addEventListener("resize", () => {
        map.invalidateSize();
      });
    }
  } catch (error) {
    console.error("Error al inicializar el mapa de Leaflet:", error);
  }

  /**
   * 6) Three.js - Fondo Animado en el Hero
   */
  try {
    const canvas = document.getElementById("heroCanvas");
    if (canvas) {
      const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 2.5;

      // Creación de la geometría y material del TorusKnot
      const geometry = new THREE.TorusKnotGeometry(0.5, 0.15, 150, 20);
      const material = new THREE.MeshNormalMaterial({ wireframe: true });
      const torusKnot = new THREE.Mesh(geometry, material);
      scene.add(torusKnot);

      // Función de animación
      const animate = () => {
        requestAnimationFrame(animate);
        torusKnot.rotation.x += 0.005;
        torusKnot.rotation.y += 0.005;
        renderer.render(scene, camera);
      };
      animate();

      // Ajuste de la escena al redimensionar la ventana
      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });
    }
  } catch (error) {
    console.error("Error al inicializar el fondo animado con Three.js:", error);
  }
});

document.addEventListener("DOMContentLoaded", () => {
  new Swiper(".hero-swiper", {
    loop: true,
    effect: "fade", // transición suave
    speed: 800,
    autoplay: {
      delay: 4000, // 4,5 s entre slides
      disableOnInteraction: false,
    },
    fadeEffect: { crossFade: true },
    allowTouchMove: false, // sin swipe manual (opcional)
    // No declaramos navigation ni pagination, así que no aparecen controles
  });
});

/* ---------- Catálogo OMA – Filtro + búsqueda ---------- */
function buildUsesTable(arr) {
  return `
    <div class="table-responsive">
      <table class="table table-sm align-middle">
        <thead class="table-light">
          <tr><th>Cultivo</th><th>Blanco</th><th>Dosis</th><th>P.C.</th><th>P.R.</th></tr>
        </thead>
        <tbody>
          ${arr
            .map(
              (u) => `<tr>
                  <td>${u.crop}</td>
                  <td>${u.target}</td>
                  <td>${u.dose}</td>
                  <td>${u.pc}</td>
                  <td>${u.pr}</td>
                </tr>`
            )
            .join("")}
        </tbody>
      </table>
    </div>`;
}

(function () {
  const qs = new URLSearchParams(window.location.search);
  let currentCategoria = (qs.get("categoria") || "").toLowerCase();
  let currentCultivo = (qs.get("cultivo") || "").toLowerCase();

  // Ocultar “Categorías” cuando se navega por cultivo
  const categoriasSection = document.getElementById("categorias");
  if (categoriasSection) {
    categoriasSection.style.display = currentCultivo ? "none" : "";
  }

  const titleEl = document.querySelector("#catalogo h1");
  const grid = document.getElementById("productGrid");
  const searchInput = document.getElementById("productSearch");
  const clearSearchBtn = document.getElementById("clearSearch");
  const clearFilters = document.getElementById("clearFilters");

  // Contenedor del sub‑filtro (lo creamos si no existe en el HTML)
  let subfilterContainer = document.getElementById("subfilter");
  if (!subfilterContainer && titleEl) {
    subfilterContainer = document.createElement("div");
    subfilterContainer.id = "subfilter";
    subfilterContainer.className = "d-flex flex-wrap gap-2 mb-4";
    subfilterContainer.style.display = "none";
    titleEl.insertAdjacentElement("afterend", subfilterContainer);
  }

  const categoryTitles = {
    herbicida: "Herbicidas",
    fungicida: "Fungicidas",
    insecticida: "Insecticidas",
    "fertilizante-foliar": "Fertilizantes Foliares",
  };
  const cultivoTitles = {
    papa: "Papa",
    tomate: "Tomate",
    maiz: "Maíz",
    arroz: "Arroz",
    cebolla: "Cebolla",
    frijol: "Frijol",
    fresa: "Fresa",
    aguacate: "Aguacate",
    arveja: "Arveja",
    rosa: "Rosa",
    clavel: "Clavel",
    pompon: "Pompon",
    crisantemo: "Crisantemo",
    hortensia: "Hortensia",
  };

  /* ----- Sub‑filtro por categoría dentro de un cultivo ----- */
  const subfilterCats = [
    { slug: "herbicida", label: "Herbicidas" },
    { slug: "fungicida", label: "Fungicidas" },
    { slug: "insecticida", label: "Insecticidas" },
    { slug: "fertilizante-foliar", label: "Fertilizantes Foliares" },
  ];

  if (clearFilters) {
    clearFilters.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "catalogo.html";
    });
  }

  let allProducts = [];
  let visibleProducts = [];

  /* ----- Dibuja el sub‑filtro por categoría ----- */
  function renderSubfilter(counts = {}) {
    if (!subfilterContainer) return;

    // Muestra u oculta según haya cultivo
    subfilterContainer.style.display = currentCultivo ? "" : "none";
    if (!currentCultivo) {
      subfilterContainer.innerHTML = "";
      return;
    }

    // Genera botones con contadores
    subfilterContainer.innerHTML = subfilterCats
      .filter((c) => counts[c.slug] > 0)
      .map(
        (c) => `
        <button type="button"
                class="btn btn-outline-primary me-2 mb-2 ${
                  currentCategoria === c.slug ? "active" : ""
                }"
                data-cat="${c.slug}">
          ${c.label}
          <span class="badge bg-secondary">${counts[c.slug] || 0}</span>
        </button>`
      )
      .join("");

    // Listeners
    subfilterContainer.querySelectorAll("button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const newCat = btn.dataset.cat;
        if (!newCat || newCat === currentCategoria) return;

        currentCategoria = newCat;
        window.history.replaceState(
          null,
          "",
          `?cultivo=${currentCultivo}&categoria=${currentCategoria}`
        );

        visibleProducts = allProducts.filter((p) => {
          const catSlug = (p.category || "").toLowerCase().replace(/\s+/g, "-");
          const cultivos = (p.uses || []).map((u) =>
            (u.crop || "").toLowerCase()
          );
          return (
            catSlug === currentCategoria && cultivos.includes(currentCultivo)
          );
        });

        if (searchInput) searchInput.value = "";
        renderProducts(visibleProducts);
        renderSubfilter(counts); // actualiza botón activo
      });
    });
  }

  function renderProducts(list) {
    if (!grid) return;
    grid.innerHTML = "";

    list.forEach((p) => {
      grid.insertAdjacentHTML(
        "beforeend",
        `
      <div class="col">
        <div class="product-card h-100">
          <div class="img-wrapper">
            <img src="${p.image_url}" class="img-fluid rounded" alt="${p.name}" loading="lazy">
          </div>
          <div class="card-body">
            <h5 class="fw-bold text-primary">${p.name}</h5>
            <p class="small mb-2"><strong>${p.category}</strong></p>
          </div>
        </div>
      </div>`
      );
      grid.lastElementChild
        .querySelector(".product-card")
        .addEventListener("click", () => openProductModal(p));
    });

    if (!list.length) {
      grid.innerHTML =
        '<div class="col-12"><div class="alert alert-warning">No hay productos que coincidan con la búsqueda o filtros.</div></div>';
    }
  }

  const modal = document.getElementById("productModal")
    ? new bootstrap.Modal(document.getElementById("productModal"))
    : null;

  function openProductModal(prod) {
    if (!modal) return;
    document.getElementById("modalImg").src = prod.image_url;
    document.getElementById("modalImg").alt = prod.name;
    document.getElementById("modalCategory").textContent = prod.category;
    document.getElementById("modalName").textContent = prod.name;
    document.getElementById("modalDesc").textContent = prod.description || "";

    document.getElementById("modalCompList").innerHTML = (
      prod.composition || []
    )
      .map(
        (c) => `<li>${c.ai || c.nutrient} ${c.pct || c.amount_g_L || ""}</li>`
      )
      .join("");

    document.getElementById("modalFormulationText").textContent =
      prod.formulation || "";
    document.getElementById("modalPresentations").textContent = (
      prod.presentations || []
    ).join(", ");
    document.getElementById("modalChemicalGroup").textContent =
      prod.chemical_group || "";

    document.getElementById("modalMode").textContent =
      prod.mode_of_action || "";
    document.getElementById("modalMechanism").textContent =
      prod.mechanism || "";

    document.getElementById("modalWarnings").textContent = prod.warnings || "";

    document.getElementById("modalUsesTable").innerHTML = buildUsesTable(
      prod.uses || []
    );

    document.getElementById("modalFichaPdf").href = prod.ficha_pdf || "#";
    document.getElementById("modalTarjetaPdf").href = prod.tarjeta_pdf || "#";
    document.getElementById("modalHojaPdf").href = prod.hoja_pdf || "#";

    modal.show();
  }

  fetch("products.json")
    .then((r) => r.json())
    .then(({ products }) => {
      allProducts = products;

      visibleProducts = allProducts.filter((p) => {
        const catSlug = (p.category || "").toLowerCase().replace(/\s+/g, "-");
        const cultivos = (p.uses || []).map((u) =>
          (u.crop || "").toLowerCase()
        );
        const matchCategoria = currentCategoria
          ? catSlug === currentCategoria
          : true;
        const matchCultivo = currentCultivo
          ? cultivos.includes(currentCultivo)
          : true;
        return matchCategoria && matchCultivo;
      });

      if (titleEl) {
        if (currentCategoria && categoryTitles[currentCategoria]) {
          titleEl.textContent = categoryTitles[currentCategoria];
        } else if (currentCultivo && cultivoTitles[currentCultivo]) {
          titleEl.textContent = cultivoTitles[currentCultivo];
        }
      }

      /* Recalcula y muestra el número de productos por categoría */
      const categoryCards = document.querySelectorAll("#categorias .cat-card");
      if (categoryCards.length) {
        const counters = {};
        products.forEach((p) => {
          const slug = (p.category || "").toLowerCase().replace(/\s+/g, "-");
          counters[slug] = (counters[slug] || 0) + 1;
        });
        categoryCards.forEach((card) => {
          const cat = new URL(
            card.href,
            window.location.origin
          ).searchParams.get("categoria");
          const span = card.querySelector(".cat-count");
          if (span) span.textContent = `${counters[cat] || 0} productos`;
        });
      }

      /* Conteo por categoría dentro del cultivo activo */
      const subCounts = {};
      if (currentCultivo) {
        products.forEach((p) => {
          const cultivos = (p.uses || []).map((u) =>
            (u.crop || "").toLowerCase()
          );
          if (cultivos.includes(currentCultivo)) {
            const slug = (p.category || "").toLowerCase().replace(/\s+/g, "-");
            subCounts[slug] = (subCounts[slug] || 0) + 1;
          }
        });
      }
      renderSubfilter(subCounts);

      renderProducts(visibleProducts);
    })
    .catch((err) => console.error("[Catálogo] Error cargando productos:", err));

  if (searchInput) {
    searchInput.addEventListener("input", () => {
      const q = searchInput.value.toLowerCase().trim();
      if (!q) {
        renderProducts(visibleProducts);
        return;
      }
      const filtered = visibleProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.active_ingredient || "").toLowerCase().includes(q)
      );
      renderProducts(filtered);
    });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener("click", () => {
      searchInput.value = "";
      renderProducts(visibleProducts);
      searchInput.focus();
    });
  }
  /* ---------- Click dinámico en “Soluciones por Cultivo” ---------- */
  document
    .querySelectorAll('a[href*="catalogo.html?cultivo="]')
    .forEach((link) => {
      link.addEventListener("click", (e) => {
        // Sólo interceptamos si ya estamos en la página de catálogo
        if (!window.location.pathname.includes("catalogo")) return;
        e.preventDefault();
        const url = new URL(link.href, window.location.origin);
        const newCultivo = (
          url.searchParams.get("cultivo") || ""
        ).toLowerCase();
        if (!newCultivo) return;

        // Actualiza estado interno y URL sin recargar
        currentCultivo = newCultivo;
        currentCategoria = ""; // al elegir cultivo limpiamos la categoría
        window.history.replaceState(null, "", `?cultivo=${currentCultivo}`);

        // NEW: If the products JSON hasn’t finished loading yet,
        // let the fetch() callback handle rendering to avoid flashing an empty grid
        if (!allProducts.length) {
          if (searchInput) searchInput.value = "";
          return;
        }

        // Oculta sección de categorías y actualiza título
        if (categoriasSection) categoriasSection.style.display = "none";
        if (titleEl) {
          titleEl.textContent =
            cultivoTitles[currentCultivo] ||
            currentCultivo.charAt(0).toUpperCase() + currentCultivo.slice(1);
        }

        // Recalcula productos visibles
        visibleProducts = allProducts.filter((p) => {
          const cultivos = (p.uses || []).map((u) =>
            (u.crop || "").toLowerCase()
          );
          return cultivos.includes(currentCultivo);
        });

        // Re‑genera conteos y refresca sub‑filtro
        const newCounts = {};
        allProducts.forEach((p) => {
          const cultivos = (p.uses || []).map((u) =>
            (u.crop || "").toLowerCase()
          );
          if (cultivos.includes(currentCultivo)) {
            const slug = (p.category || "").toLowerCase().replace(/\s+/g, "-");
            newCounts[slug] = (newCounts[slug] || 0) + 1;
          }
        });
        renderSubfilter(newCounts);

        // Limpia búsqueda y pinta resultados
        if (searchInput) searchInput.value = "";
        renderProducts(visibleProducts);
      });
    });
})();
