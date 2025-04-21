// script.js
fetch("products.json")
  .then((response) => response.json())
  .then((data) => {
    const container = document.getElementById("product-container");
    data.products.forEach((p) => {
      container.insertAdjacentHTML(
        "beforeend",
        `
        <div class="position-relative mb-3">
          ${(() => {
            const src = p.image_url || "/media/man.jpg";
            return `<img src="${src}" class="img-fluid rounded" alt="${p.name}" loading="lazy">`;
          })()}
          <span class="position-absolute top-0 end-0 translate-middle badge bg-primary">${
            p.ica
          }</span>
        </div>
      `
      );
    });
  })
  .catch((error) => console.error("Error fetching products:", error));
