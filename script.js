document.addEventListener("DOMContentLoaded", () => {
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
          region: "ANTIOQUIA FLORES",
          lat: 5.9,
          lng: -75.8,
          reps: [
            "Edwin Martinez - Cel. 316-5275606",
            "Erika Vanegas - Cel. 316-2863143",
          ],
        },
        {
          region: "ANTIOQUIA PAPA – HORTALIZAS",
          lat: 6.2,
          lng: -75.39,
          reps: [
            "Jorge Restrepo - Cel. 316-4714542",
            "Jhony Alexander Gómez - Cel. 316-6916641",
          ],
        },
        {
          region: "CUNDINAMARCA FLORES",
          lat: 4.91,
          lng: -74.06,
          reps: [
            "Martha Gualtero - Cel. 311-8115613",
            "María del Pilar Guzmán - Cel. 311-8115614",
          ],
        },
        {
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
          region: "BOYACÁ",
          lat: 5.57,
          lng: -73.36,
          reps: [
            "William Torres - Cel. 310-3429421",
            "Adriana Tocarruncho - Cel. 310-2406224",
          ],
        },
        {
          region: "NARIÑO",
          lat: 1.21,
          lng: -77.28,
          reps: [
            "Henry Rueda - Cel. 320-3470039",
            "Edwin Mora - Cel. 317-3659711",
          ],
        },
        {
          region: "SANTANDER",
          lat: 7.13,
          lng: -73.13,
          reps: [
            "Jaime Andrés Báez - Cel. 314-3570633",
            "Ernesto Vergel - Cel. 314-3570642",
          ],
        },
        {
          region: "VALLE DEL CAUCA",
          lat: 3.45,
          lng: -76.53,
          reps: ["Cesar Augusto Rivas - Cel. 314-3566836"],
        },
        {
          region: "NORTE DE SANTANDER",
          lat: 7.91,
          lng: -72.5,
          reps: [
            "Carmen Elena Becerra - Cel. 322-5149964",
            "Edsson Alí Romero - Cel. 310-2406205",
          ],
        },
        {
          region: "META – CASANARE",
          lat: 4.1,
          lng: -73.64,
          reps: [
            "Mauricio Bastidas - Cel. 311-2761794",
            "Claudia Alejandra Aponte - Cel. 320-3111346",
          ],
        },
        {
          region: "TOLIMA",
          lat: 4.14,
          lng: -75.24,
          reps: [
            "Favian Sanchez - Cel. 317-3671277",
            "Juan Manuel Garcia - Cel. 314-2024279",
          ],
        },
        {
          region: "HUILA",
          lat: 2.93,
          lng: -75.28,
          reps: [
            "Sergio Fernando Gualtero - Cel. 314-3569337",
            "Luis Fernando Ardila - Cel. 312-4736210",
          ],
        },
        {
          region: "CÓRDOBA – COSTA CARIBE",
          lat: 8.04,
          lng: -75.58,
          reps: ["Wilson Calderín - Cel. 312-6032541"],
        },
      ];

      // Agregamos un marcador con popup por cada región
      representantes.forEach((rep) => {
        const marker = L.marker([rep.lat, rep.lng]).addTo(map);
        let popupHTML = `<strong>${rep.region}</strong><br/>`;
        rep.reps.forEach((r) => {
          popupHTML += `${r}<br/>`;
        });
        marker.bindPopup(popupHTML);
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

  /* -------------------------------------------------------------
   * 7) Catálogo de productos (carga y render)
   * ----------------------------------------------------------- */
  fetch("products.json")
    .then((r) => r.json())
    .then(({ products, safety_notice }) => {
      const grid = document.getElementById("productGrid");
      if (!grid) {
        console.warn("[Catálogo] No se encontró #productGrid en el DOM.");
        return;
      }
      grid.innerHTML = ""; // vacía cards estáticas

      products.forEach((p) => {
        const cultivos = [
          ...new Set(p.targets.map((t) => t.crop.toLowerCase())),
        ];
        const problemas = [
          ...new Set(
            p.targets.map((t) => t.pest.toLowerCase().replace(/ /g, "-"))
          ),
        ];

        grid.insertAdjacentHTML(
          "beforeend",
          `
          <div class="col"
               data-cultivos="${cultivos.join(",")}"
               data-problemas="${problemas.join(",")}"
               data-categoria="${p.category.toLowerCase()}">
            <div class="product-card h-100 p-3">
              <div class="position-relative mb-3">
                <img src="/media/man.jpg" class="img-fluid rounded" alt="${
                  p.name
                }" loading="lazy">
                <span class="position-absolute top-0 end-0 translate-middle badge bg-primary">${
                  p.ica
                }</span>
              </div>
              <h5 class="fw-bold text-primary">${p.name}</h5>
              <p class="small text-muted">${p.active_ingredient}</p>
              <p class="small mb-2"><strong>${p.category}</strong> • ${
            p.formulation
          }</p>
              <button class="btn btn-doc w-100 disabled-opa-50">Ficha Técnica (próx.)</button>
            </div>
          </div>`
        );
      });

      // Aviso de seguridad
      grid.insertAdjacentHTML(
        "beforeend",
        `
        <div class="col-12">
          <div class="alert alert-danger">
            <i class="fas fa-skull-crossbones me-2"></i>${safety_notice}
          </div>
        </div>`
      );

      // Recalcula contadores en Home (si existen)
      if (document.querySelectorAll("#categorias .cat-card").length) {
        const counters = {
          herbicida: 0,
          fungicida: 0,
          insecticida: 0,
          "fertilizante foliar": 0,
        };
        products.forEach((p) => counters[p.category.toLowerCase()]++);
        document.querySelectorAll("#categorias .cat-card").forEach((card) => {
          const cat = new URL(card.href).searchParams.get("categoria");
          const span = card.querySelector(".cat-count");
          if (span) span.textContent = counters[cat] + " productos";
        });
      }

      // Primer filtrado
      filterProducts();
    })
    .catch((err) => console.error("Error cargando products.json:", err));

  /* Listeners protegidos para los filtros */
  const cropEl = document.getElementById("cropFilter");
  const probEl = document.getElementById("problemFilter");
  const searchEl = document.getElementById("searchInput");
});

function filterProducts() {
  const cropSel = document.getElementById("cropFilter").value;
  const probSel = document.getElementById("problemFilter").value;
  const searchText = document.getElementById("searchInput").value.toLowerCase();
  const catParam = getQueryParams().categoria || "";

  document.querySelectorAll("#productGrid .col").forEach((card) => {
    const crops = card.dataset.cultivos.split(",");
    const probs = card.dataset.problemas.split(",");
    const cat = card.dataset.categoria;

    const okCrop = !cropSel || crops.includes(cropSel);
    const okProb = !probSel || probs.includes(probSel);
    const okCat = !catParam || cat === catParam;
    const okSearch =
      !searchText || card.textContent.toLowerCase().includes(searchText);

    card.style.display =
      okCrop && okProb && okCat && okSearch ? "block" : "none";
  });
}
