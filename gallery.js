const PAGE_SIZE = 60;

function getParams() {
  return new URLSearchParams(window.location.search);
}

function esc(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

async function init() {
  renderNav("index.html");
  renderFooter();

  const all = await loadArtworks();
  const params = getParams();
  const tagFilter = params.get("tag");
  const sourceFilter = params.get("source");
  let page = parseInt(params.get("page") || "1", 10);

  let filtered = all;
  if (tagFilter) filtered = filtered.filter(a => a.tags.includes(tagFilter));
  if (sourceFilter) filtered = filtered.filter(a => a.source === sourceFilter);

  const banner = document.getElementById("filter-banner");
  if (tagFilter || sourceFilter) {
    banner.innerHTML = `<div class="filter-banner">
      <span>Filtered by ${tagFilter ? `tag "${esc(tagFilter)}"` : `source "${esc(sourceFilter)}"`} — ${filtered.length} artworks</span>
      <button id="clear-filter">Clear filter</button>
    </div>`;
    banner.querySelector("#clear-filter").addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  page = Math.min(Math.max(1, page), totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pageItems = filtered.slice(start, start + PAGE_SIZE);

  const grid = document.getElementById("grid");
  grid.innerHTML = pageItems.map((a, i) => `
    <div class="art-card" data-index="${start + i}">
      <img src="${esc(a.image_url)}" alt="${esc(a.title)}" loading="lazy">
      <div class="art-overlay">
        <div class="art-title">${esc(a.title)}</div>
        <div class="art-source">${esc(a.source)}</div>
        <div class="art-tags">${a.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>
    </div>
  `).join("");

  grid.querySelectorAll(".art-card").forEach(card => {
    card.addEventListener("click", () => openLightbox(filtered[+card.dataset.index]));
  });

  const pagination = document.getElementById("pagination");
  function pageUrl(p) {
    const sp = new URLSearchParams(params);
    sp.set("page", p);
    return "index.html?" + sp.toString();
  }
  pagination.innerHTML = `
    <button id="prev-page" ${page <= 1 ? "disabled" : ""}>← Previous</button>
    <span class="page-status">Page ${page} of ${totalPages} — ${filtered.length} artworks</span>
    <button id="next-page" ${page >= totalPages ? "disabled" : ""}>Next →</button>
  `;
  pagination.querySelector("#prev-page").addEventListener("click", () => {
    if (page > 1) window.location.href = pageUrl(page - 1);
  });
  pagination.querySelector("#next-page").addEventListener("click", () => {
    if (page < totalPages) window.location.href = pageUrl(page + 1);
  });

  const backdrop = document.getElementById("lightbox");
  document.getElementById("lightbox-close").addEventListener("click", closeLightbox);
  backdrop.addEventListener("click", e => { if (e.target === backdrop) closeLightbox(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeLightbox(); });

  function openLightbox(a) {
    document.getElementById("lightbox-img").src = a.image_url;
    document.getElementById("lightbox-img").alt = a.title;
    document.getElementById("lightbox-title").textContent = a.title;
    document.getElementById("lightbox-source").textContent = a.source;
    document.getElementById("lightbox-tags").innerHTML = a.tags.map(t => `<span class="tag">${esc(t)}</span>`).join("");
    backdrop.classList.add("open");
  }
  function closeLightbox() {
    backdrop.classList.remove("open");
  }
}

init();
