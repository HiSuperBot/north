# Deployment

NORTH has two outputs from the same React explorer and reviewed static content.

| Target | Build | Hosting | Access |
| --- | --- | --- | --- |
| GitHub Pages | `npm run build:pages` → `dist-pages/` | HTML, CSS, JavaScript, images, and map data | Public |
| Existing Sites | `npm run build` → client assets and Worker | Vinext / Cloudflare-compatible Worker | Owner-private |

Neither target runs an image-generation server, external thought model, or database. Optional Gemini Nano runs in supported visitors' browsers. Unsupported browsers use prepared fictional thoughts. Map tiles remain external NASA/OSM services; service availability and their original observation dates still apply.

## GitHub Pages Actions

The repository owner has selected **GitHub Actions** in Settings → Pages. `.github/workflows/pages.yml` runs on pushes to `main` or manual dispatch:

1. Check out source and install the locked application dependencies with Node 22.
2. Run type, content, resident, route, and dated-scenario checks.
3. Read the Pages base path from `actions/configure-pages` and build the static app.
4. Check the packaged HTML, scene images, map worker/data, and required assets.
5. Upload `site/dist-pages` and deploy it to the `github-pages` environment.

The build job has read-only repository permission. The deployment job receives `pages: write` and `id-token: write`. No SSH key or personal access token is included in the workflow. See [GitHub's custom workflow contract](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

The default local base is `/north/`, suitable for `https://hisuperbot.github.io/north/`. Actions derives the live base path from Pages configuration, so a configured custom domain can use `/`. All prepared images, geometry, download links, the MapLibre worker, and history URLs use this base. Query-string deep links remain on the static index and survive refresh/back/forward.

```sh
cd site
npm run build:pages
node scripts/check-pages.mjs
npm run preview:pages
```

Open the printed `/north/` URL. To test a root-domain build, set `PAGES_BASE_PATH=/` for both the build and packaged check. The Pages build bypasses the Sites `/api/map-config` endpoint. Default NASA/OSM needs no key; an optional `VITE_MAPTILER_KEY` is a public build-time browser key and must be domain-restricted. No real key is committed or currently required.

## Private Sites

Retain `.openai/hosting.json` and the existing project. The supported Sites source helper synchronizes its separate source repository, checks/builds the exact source, and returns a matching source SHA and archive. Private deployment saves that archive and source together. A successful build, source push, or GitHub Pages deployment is not proof that Sites has updated; verify its terminal deployment result separately.

Existing published Sites SHAs are preserved. New source commits use the requested project identity. Do not repoint the Sites repository to GitHub or upload `dist-pages/` as a Worker package.

## Troubleshooting

- A Pages 404 before deployment: inspect the Actions run and Pages environment. The first push must complete its deployment job.
- Asset 404s or navigation leaving `/north/`: verify the Actions `base_path`, the generated index asset URLs, and `check-pages.mjs`; do not add a guessed SPA redirect for query-only routing.
- Unsupported WebGL: use the place cards to enter documented image scenes.
- Unavailable geometry, sprites, or photos: information/evidence remains accessible, and failed scene preloads retain the current view.
- Nano unavailable: prepared thoughts remain usable; hosting does not supply a remote AI fallback.

GitHub Pages and Sites publish independently. Keep both validation and audience results explicit in the release report.
