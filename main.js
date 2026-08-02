/* Shared helpers: CSV parsing, nav rendering, data loading. */

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') { inQuotes = false; }
      else { field += c; }
    } else {
      if (c === '"') inQuotes = true;
      else if (c === ',') { row.push(field); field = ""; }
      else if (c === '\n') { row.push(field); rows.push(row); row = []; field = ""; }
      else if (c === '\r') { /* skip */ }
      else field += c;
    }
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter(r => r.length > 1 || (r.length === 1 && r[0] !== ""));
}

async function loadArtworks() {
  const res = await fetch("artworks.csv");
  const text = await res.text();
  const rows = parseCSV(text);
  const header = rows[0].map(h => h.trim());
  return rows.slice(1).map(r => {
    const obj = {};
    header.forEach((h, i) => obj[h] = (r[i] || "").trim());
    obj.tags = obj.tags ? obj.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
    return obj;
  });
}

function renderNav(active) {
  const links = [
    ["index.html", "Gallery"],
    ["sources.html", "Sources"],
    ["tags.html", "Tags"],
    ["info.html", "About"],
    ["copyright.html", "License"],
  ];
  const nav = document.createElement("nav");
  nav.className = "nav";
  nav.innerHTML = `<a class="nav-brand" href="index.html">Museum</a>` +
    links.map(([href, label]) =>
      `<a href="${href}"${href === active ? ' aria-current="page"' : ''}>${label}</a>`
    ).join("");
  document.body.prepend(nav);
}

function renderFooter() {
  const footer = document.createElement("footer");
  footer.className = "site-footer";
  footer.innerHTML = `<span>Museum — a public-domain artwork gallery.</span>
    <span><a href="copyright.html">Licensing &amp; sources</a></span>`;
  document.body.appendChild(footer);
}
