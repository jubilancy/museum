# Museum — static artwork gallery

A dependency-free, static site that sources artwork from a CSV file. Built for GitHub Pages: no build step, no framework, no server.

## Structure

- `artworks.csv` — the data: `image_url,title,source,tags` (tags are comma-separated within a quoted field)
- `index.html` + `gallery.js` — masonry gallery with pagination, hover overlay, lightbox, and `?tag=`/`?source=` filtering
- `sources.html` — every source in the CSV, with counts
- `tags.html` — every tag in the CSV, with counts, generated into `tags-data.json`
- `info.html`, `copyright.html` — static pages
- `style.css` — all styling (serif type, masonry grid, hover states)
- `main.js` — shared CSV parser + nav/footer rendering
- `scripts/generate-tags.mjs` — regenerates `tags-data.json` and `sources-data.json` from the CSV
- `.github/workflows/deploy.yml` — runs the generator and deploys to GitHub Pages on every push to `main`

## Adding artwork

Add a row to `artworks.csv` and push to `main`. The Tags and Sources pages update automatically on the next deploy.

## Local preview

Serve the folder with any static file server (`python3 -m http.server`, `npx serve`, etc.) — `fetch()` of the CSV needs `http://`, not `file://`.

## Enabling GitHub Pages

In the repo's Settings → Pages, set the source to "GitHub Actions". The included workflow handles the rest.
