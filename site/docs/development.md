# Development guide

## Prerequisites

- Node.js 22.13 or newer, as declared in `package.json`. The recorded pilot was built with Node 26.4.0 and npm 11.17.0; these are review-environment versions, not a requirement to upgrade to that exact pair.
- npm and the checked-in `package-lock.json`.
- Network access for initial dependency installation and remote map tiles. Served scene assets and geometry are checked in.

The app is in `site/`. From the project root:

```sh
cd site
npm run install:ci
npm run dev
```

The installer uses the lockfile and the selected local execution profile. Fresh clones without `.sites-runtime/execution-profile.json` default to the portable profile. The dev server normally prints `http://127.0.0.1:5173/`. Use its printed URL rather than assuming an occupied port can be reused.

## Commands

Run these from the application directory:

| Command | Purpose |
| --- | --- |
| `npm run install:ci` | Install the lockfile through the supplied profile-aware wrapper |
| `npm run dev` | Start the development server |
| `npx tsc --noEmit` | Check TypeScript without emitting app files |
| `node scripts/check-atlas.mjs` | Check map-reference sources, dated history, location precision, filters, URLs and the public mirror |
| `node scripts/check-content.mjs` | Check content graph, sources, rights, URLs, and road interpolation |
| `node scripts/check-residents.mjs` | Check scenario context and the Nano adapter with a test double |
| `node scripts/check-street-simulation.mjs` | Check placement, stable identities, and movement on source road lines |
| `npm run build` | Build client assets and a Worker-compatible server |
| `npm run start` | Serve the built Worker locally through Wrangler |

The checks transpile the relevant TypeScript modules themselves. They do not require `--experimental-strip-types`. Build output and incremental TypeScript caches are ignored.

## Map providers

The default pilot requires no map key. It uses:

- NASA Blue Marble for coarse country geography, with its original 2004 context.
- Contemporary OSM raster tiles for regional reference.
- The checked-in OSM-derived GeoJSON for street geometry.

For MapTiler, supply `MAPTILER_KEY` to the local server process or hosted runtime. `/api/map-config` sends that key to the browser, so use a public browser key restricted to the permitted local/deployed domains. Do not prefix it with `VITE_`, hardcode it in source, or commit it. A secret credential intended only for a server is not suitable for this endpoint.

MapTiler is optional and remains unconfigured for the recorded pilot. Its failure falls back to the geographic references. Provider resolution and dates must never be presented as historical scene observations. Review provider terms and attribution when changing the service or deployment scope.

## Gemini Nano

The browser's `LanguageModel` capability is probed at runtime. No model is downloaded or session created just because the page loads. A supported visitor chooses the on-device thought action; initial download progress is displayed and the prepared thought stays available.

The implementation requests English. As reviewed on 9 October 2026, the [Chrome Prompt API documentation](https://developer.chrome.com/docs/ai/prompt-api) lists Chrome 148+ for web use, supported desktop operating systems, storage/hardware requirements, and a separate first-use model download. Mobile devices are not supported by this API. Treat these as a dated documentation snapshot; runtime availability is decisive. Embedding/permission policy can also affect availability.

To exercise native inference, open the private site in a supported desktop Chrome environment, select a person, and use the on-device action. Confirm successful generation, label retention, first-use progress, cancellation, and repeated session cleanup. Do not change browser flags or device settings as a substitute for recording an unsupported condition.

Gemma is not bundled or downloaded by this build. Deploying a separate Gemma runtime is a future decision, with its own model-distribution and operational requirements.

## Editing content

Use `lib/content.ts` as the reviewed source of truth. Add or update `Source` records before linking a claim. Keep IDs stable when possible, preserve original dates/locations, and update rights/production records for assets. Follow the [evidence policy](evidence-policy.md).

A scene's hotspot uses image-relative percentages. Its target must exist and belong to the same place. Parent links must remain acyclic. Images live in `public/scenes/`; their URLs start with `/scenes/`.

The checks intentionally encode the pilot's current eight-place scope. If an approved scope expansion changes that count, update the checks and documentation together rather than bypassing validation.

Area-level documentary references use the separate [map-layer dataset](map-layers.md); they must not increase the eight-place scene count or silently create street scenes. Update its downloadable mirror and run `check-atlas.mjs` whenever editing a reference.

## Useful exploration paths

- Country → Map layers → public reference → original dated history and sources → country.
- Country → Pyongyang → Kwangbok apartments → exterior → window → kitchen → evidence → map.
- Street mode → click a mapped building → card → photograph / reconstruction → matching evidence.
- Street mode → pause people → click a visible pedestrian → fictional thought → regional context / evidence.
- Aoji → Haksong railway or neighborhood → regional photograph → reconstructed life scene.

## Troubleshooting

| Symptom | Investigation |
| --- | --- |
| Connection refused | Confirm the dev process is running and use the URL it printed |
| Map unavailable | Check WebGL/provider errors; use the place list and verify its scene paths still work |
| No buildings near Haksong | Known sparse footprint coverage; do not manufacture geometry to fill the view |
| Missing map worker | Confirm `public/maplibre-worker.js` is served and its license is retained |
| Scene transition fails | Check the requested asset URL; the controller should retain the current scene |
| No on-device thought action | Review runtime availability and embedding conditions; prepared thoughts remain supported |
| Nano response rejected | Keep the prepared thought; inspect the adapter contract without treating raw output as evidence |
| Sources appear temporally different | This is expected when source dates differ; the scenario year must not rewrite them |

## Builds and deployment

`npm run build` creates local output. A local commit does not publish it. `.openai/hosting.json` identifies the existing private Sites project; preserve it. Hosted updates use the Sites source/build/archive workflow and a saved version with terminal deployment-status verification. Do not register a second project or expose a private review deployment to a wider audience as part of routine development.

See [repository workflow](repository-workflow.md) for source ownership and commit practices, and [validation](validation.md) for the acceptance checks before a product update.
