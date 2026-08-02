// Node script run by the GitHub Actions workflow on every push.
// Regenerates tags-data.json (tag -> count) and sources-data.json from artworks.csv.
import { readFileSync, writeFileSync } from "fs";

function parseCSV(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i], next = text[i + 1];
    if (inQuotes) {
      if (c === '"' && next === '"') { field += '"'; i++; }
      else if (c === '"') inQuotes = false;
      else field += c;
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

const csv = readFileSync(new URL("../artworks.csv", import.meta.url), "utf8");
const rows = parseCSV(csv);
const header = rows[0].map(h => h.trim());
const records = rows.slice(1).map(r => {
  const obj = {};
  header.forEach((h, i) => (obj[h] = (r[i] || "").trim()));
  obj.tags = obj.tags ? obj.tags.split(",").map(t => t.trim()).filter(Boolean) : [];
  return obj;
});

const tagCounts = {};
records.forEach(r => r.tags.forEach(t => { tagCounts[t] = (tagCounts[t] || 0) + 1; }));

const sourceCounts = {};
records.forEach(r => { if (r.source) sourceCounts[r.source] = (sourceCounts[r.source] || 0) + 1; });

writeFileSync(new URL("../tags-data.json", import.meta.url), JSON.stringify({
  generatedAt: new Date().toISOString(),
  totalArtworks: records.length,
  tags: tagCounts,
}, null, 2));

writeFileSync(new URL("../sources-data.json", import.meta.url), JSON.stringify({
  generatedAt: new Date().toISOString(),
  sources: sourceCounts,
}, null, 2));

console.log(`Generated ${Object.keys(tagCounts).length} tags and ${Object.keys(sourceCounts).length} sources from ${records.length} artworks.`);
