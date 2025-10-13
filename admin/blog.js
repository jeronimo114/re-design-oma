const API_BASE = "/api/blog";
const STORAGE_KEY = "omaBlogAuth";

const state = {
  credentials: null,
  articles: [],
  activeId: null,
};

const els = {
  loginView: document.getElementById("loginView"),
  loginForm: document.getElementById("loginForm"),
  loginUser: document.getElementById("loginUser"),
  loginPass: document.getElementById("loginPass"),
  loginError: document.getElementById("loginError"),
  dashboardView: document.getElementById("dashboardView"),
  articleList: document.getElementById("articleList"),
  form: document.getElementById("articleForm"),
  formFeedback: document.getElementById("formFeedback"),
  newArticleBtn: document.getElementById("newArticleBtn"),
  deleteArticleBtn: document.getElementById("deleteArticleBtn"),
  publishToggleBtn: document.getElementById("publishToggleBtn"),
  fields: {
    id: document.getElementById("articleId"),
    title: document.getElementById("articleTitle"),
    slug: document.getElementById("articleSlug"),
    status: document.getElementById("articleStatus"),
    tags: document.getElementById("articleTags"),
    publishedAt: document.getElementById("articlePublishedAt"),
    excerpt: document.getElementById("articleExcerpt"),
    seoTitle: document.getElementById("articleSeoTitle"),
    seoDescription: document.getElementById("articleSeoDescription"),
    seoKeywords: document.getElementById("articleSeoKeywords"),
    content: document.getElementById("articleContent"),
    cover: document.getElementById("articleCover"),
  },
};

function getStoredCredentials() {
  const encoded = sessionStorage.getItem(STORAGE_KEY);
  return encoded ? `Basic ${encoded}` : null;
}

function storeCredentials(user, pass) {
  const encoded = btoa(`${user}:${pass}`);
  sessionStorage.setItem(STORAGE_KEY, encoded);
  state.credentials = `Basic ${encoded}`;
}

function clearCredentials() {
  sessionStorage.removeItem(STORAGE_KEY);
  state.credentials = null;
}

function authHeader() {
  return state.credentials || getStoredCredentials();
}

async function apiFetch(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const credential = authHeader();
  if (credential) headers.set("Authorization", credential);

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    clearCredentials();
    throw new Error("Autenticación requerida o inválida.");
  }

  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    const message = detail.error || response.statusText || "Error desconocido";
    throw new Error(message);
  }

  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }
  return response.text();
}

function toDatetimeLocal(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  const offset = date.getTimezoneOffset();
  const local = new Date(date.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function fromDatetimeLocal(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString();
}

function renderLoginError(message) {
  if (!els.loginError) return;
  els.loginError.textContent = message;
  els.loginError.classList.remove("d-none");
}

function hideLoginError() {
  els.loginError?.classList.add("d-none");
}

function showDashboard() {
  els.loginView?.classList.add("d-none");
  els.dashboardView?.classList.remove("d-none");
}

function showLogin() {
  els.dashboardView?.classList.add("d-none");
  els.loginView?.classList.remove("d-none");
}

function renderArticleList() {
  if (!els.articleList) return;
  if (!state.articles.length) {
    els.articleList.innerHTML =
      '<div class="alert alert-info">Aún no hay artículos. Crea el primero con el botón "Nuevo artículo".</div>';
    return;
  }

  els.articleList.innerHTML = state.articles
    .map((article) => {
      const isActive = article.id === state.activeId;
      const statusClass =
        article.status === "published" ? "published" : "draft";
      const date = article.publishedAt
        ? new Date(article.publishedAt).toLocaleDateString("es-CO", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "Sin publicar";
      return `
        <article
          class="article-item${isActive ? " is-active" : ""}"
          data-id="${article.id}"
        >
          <div class="d-flex justify-content-between align-items-start">
            <h4>${article.title}</h4>
            <span class="badge-status ${statusClass}">
              ${article.status === "published" ? "Publicado" : "Borrador"}
            </span>
          </div>
          <small>${article.slug}</small><br />
          <small>${date}</small>
        </article>
      `;
    })
    .join("");
}

function resetForm() {
  els.form?.reset();
  Object.values(els.fields).forEach((field) => {
    if (field?.nodeName === "SELECT") field.selectedIndex = 0;
    if (field?.nodeName === "INPUT" && field.type === "file") {
      field.value = "";
    }
  });
  els.fields.id.value = "";
  state.activeId = null;
  updateActionButtons();
}

function fillForm(article) {
  els.fields.id.value = article.id || "";
  els.fields.title.value = article.title || "";
  els.fields.slug.value = article.slug || "";
  els.fields.status.value = article.status || "draft";
  els.fields.tags.value = (article.tags || []).join(", ");
  els.fields.publishedAt.value = toDatetimeLocal(article.publishedAt);
  els.fields.excerpt.value = article.excerpt || "";
  els.fields.seoTitle.value = article.seoTitle || "";
  els.fields.seoDescription.value = article.seoDescription || "";
  els.fields.seoKeywords.value = (article.seoKeywords || []).join(", ");
  els.fields.content.value = article.content?.markdown || "";
  els.fields.cover.value = "";
  state.activeId = article.id;
  updateActionButtons(article);
}

function collectFormData() {
  const payload = {
    title: els.fields.title.value.trim(),
    slug: els.fields.slug.value.trim(),
    status: els.fields.status.value,
    tags: els.fields.tags.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    publishedAt: fromDatetimeLocal(els.fields.publishedAt.value),
    excerpt: els.fields.excerpt.value.trim(),
    seoTitle: els.fields.seoTitle.value.trim(),
    seoDescription: els.fields.seoDescription.value.trim(),
    seoKeywords: els.fields.seoKeywords.value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    content: els.fields.content.value,
  };
  return payload;
}

async function loadArticles() {
  const { articles } = await apiFetch("/articles");
  const sorted = articles.slice().sort((a, b) => {
    const aDate = a.publishedAt || a.updatedAt;
    const bDate = b.publishedAt || b.updatedAt;
    return new Date(bDate) - new Date(aDate);
  });
  state.articles = sorted;
  renderArticleList();
  if (state.activeId) {
    const active = state.articles.find((item) => item.id === state.activeId);
    if (active) {
      fillForm(active);
    }
  }
}

function updateActionButtons(article) {
  const isEditing = Boolean(els.fields.id.value);
  els.deleteArticleBtn.disabled = !isEditing;
  els.publishToggleBtn.disabled = !isEditing;
  if (!isEditing) {
    els.publishToggleBtn.textContent = "Publicar";
    return;
  }
  const current =
    article ||
    state.articles.find((item) => item.id === els.fields.id.value) ||
    {};
  els.publishToggleBtn.textContent =
    current.status === "published" ? "Mover a borrador" : "Publicar";
  els.publishToggleBtn.classList.toggle(
    "btn-outline-danger",
    current.status === "published"
  );
  els.publishToggleBtn.classList.toggle(
    "btn-outline-success",
    current.status !== "published"
  );
}

function renderFormFeedback(message, type = "success") {
  if (!els.formFeedback) return;
  els.formFeedback.textContent = message;
  els.formFeedback.className = `alert alert-${type}`;
  els.formFeedback.classList.remove("d-none");
  setTimeout(() => {
    els.formFeedback?.classList.add("d-none");
  }, 4500);
}

function handleArticleSelection(event) {
  const card = event.target.closest("[data-id]");
  if (!card) return;
  const { id } = card.dataset;
  const article = state.articles.find((item) => item.id === id);
  if (!article) return;
  fillForm(article);
  state.activeId = id;
  renderArticleList();
}

async function handleLogin(event) {
  event.preventDefault();
  hideLoginError();
  const user = els.loginUser.value.trim();
  const pass = els.loginPass.value;
  if (!user || !pass) {
    renderLoginError("Debes ingresar usuario y contraseña.");
    return;
  }
  try {
    storeCredentials(user, pass);
    await loadArticles();
    showDashboard();
  } catch (error) {
    clearCredentials();
    renderLoginError(error.message);
  }
}

async function handleFormSubmit(event) {
  event.preventDefault();
  try {
    const payload = collectFormData();
    if (!payload.title || !payload.content) {
      renderFormFeedback("El título y el contenido son obligatorios.", "warning");
      return;
    }

    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value == null) return;
      if (Array.isArray(value)) {
        if (value.length) formData.append(key, JSON.stringify(value));
      } else if (value !== "") {
        formData.append(key, value);
      }
    });

    const file = els.fields.cover.files?.[0];
    if (file) {
      formData.append("cover", file);
    }

    const id = els.fields.id.value;
    const method = id ? "PUT" : "POST";
    const url = id ? `/articles/${id}` : "/articles";
    const result = await apiFetch(url, {
      method,
      body: formData,
    });
    const savedId = result?.article?.id;
    if (savedId) {
      state.activeId = savedId;
    }
    renderFormFeedback("Cambios guardados correctamente.");
    await loadArticles();
    if (state.activeId) {
      const active = state.articles.find((item) => item.id === state.activeId);
      if (active) fillForm(active);
    }
  } catch (error) {
    renderFormFeedback(error.message, "danger");
  } finally {
    if (els.fields.cover) els.fields.cover.value = "";
  }
}

async function handlePublishToggle() {
  const id = els.fields.id.value;
  if (!id) return;
  const article =
    state.articles.find((item) => item.id === id) || { status: "draft" };
  const publish = article.status !== "published";
  try {
    await apiFetch(`/articles/${id}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publish }),
    });
    renderFormFeedback(
      publish ? "Artículo publicado." : "Artículo movido a borrador."
    );
    await loadArticles();
  } catch (error) {
    renderFormFeedback(error.message, "danger");
  }
}

async function handleDelete() {
  const id = els.fields.id.value;
  if (!id) return;
  if (
    !window.confirm(
      "Esta acción eliminará el artículo de forma permanente. ¿Deseas continuar?"
    )
  ) {
    return;
  }
  try {
    await apiFetch(`/articles/${id}`, { method: "DELETE" });
    renderFormFeedback("Artículo eliminado.");
    resetForm();
    await loadArticles();
  } catch (error) {
    renderFormFeedback(error.message, "danger");
  }
}

function setupInitialState() {
  const credential = getStoredCredentials();
  if (credential) {
    state.credentials = credential;
    loadArticles()
      .then(() => showDashboard())
      .catch(() => {
        clearCredentials();
        showLogin();
      });
  } else {
    showLogin();
  }
}

els.loginForm?.addEventListener("submit", handleLogin);
els.articleList?.addEventListener("click", handleArticleSelection);
els.form?.addEventListener("submit", handleFormSubmit);
els.newArticleBtn?.addEventListener("click", () => {
  resetForm();
  renderArticleList();
});
els.publishToggleBtn?.addEventListener("click", handlePublishToggle);
els.deleteArticleBtn?.addEventListener("click", handleDelete);

setupInitialState();
