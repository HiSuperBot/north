# NORTH application

NORTH is an English-language documentary map pilot built with React, TypeScript, Vinext, and MapLibre GL JS. It follows eight places in Pyongyang, Aoji, and Panmunjom from mapped geography into dated photographs and explicitly labeled reconstructions of everyday life.

At street zoom, contemporary mapped footprints become isometric buildings and fictional people move along mapped road lines. Building cards show reviewed photos where associated, original dates, map information, and sources. Person cards show imagined routines and thoughts, with optional on-device Gemini Nano rephrasing.

The country map also offers six documentary layers and fourteen public area references. Each opens a source sheet with original dates and explicit limits. These references do not add fourteen street reconstructions or establish nuclear-warhead locations. See [map-layer content and behavior](docs/map-layers.md).

## Quick start

Use Node.js **22.13 or newer** and npm. Run these commands in this directory:

```sh
npm run install:ci
npm run dev
```

The portable development server normally runs at `http://127.0.0.1:5173/`. Use the address printed in the terminal. Fresh clones default to the portable execution profile; checkout-local Sites tooling may select a managed profile.

## Checks and build

```sh
npx tsc --noEmit
node scripts/check-content.mjs
node scripts/check-atlas.mjs
node scripts/check-residents.mjs
node scripts/check-street-simulation.mjs
node scripts/check-street-entities.mjs
node scripts/check-diorama.mjs
npm run build
```

`npm run start` serves the built Worker locally through Wrangler. It requires a successful build; it is not a deployment command. Keep the checked-in npm lockfile and use the supplied installation wrapper for repeatable setup.

## Configuration

| Setting | Purpose | Default |
| --- | --- | --- |
| `MAPTILER_KEY` | Public, domain-restricted MapTiler browser key supplied to the server/runtime | Empty: NASA overview and contemporary OSM references |
| `.openai/hosting.json` | Existing Sites project identity and logical hosting configuration | Reuse the checked-in project; do not register a replacement |
| `.sites-runtime/execution-profile.json` | Local tooling's execution-profile selection | Absent in fresh clones: portable |

The map key is returned by `/api/map-config` for browser use. It is not a confidential server credential. Restrict it to allowed domains in the provider dashboard and supply it through local process or hosted runtime configuration. Never commit a real key.

Gemini Nano is detected through the browser's `LanguageModel` API. It requires no API key and is only started by a user action. Unsupported devices and failed or rejected generation retain the prepared thought. The product uses English input and output. Native inference remains an outstanding device check; see [validation](docs/validation.md).

## Source map

- `app/page.tsx`: exploration controller, navigation, UI composition, and native WebMCP tools.
- `components/map-view.tsx`: map providers, mapped geometry, camera transitions, building selection, and fictional pedestrians.
- `components/scene-viewer.tsx`: aspect-preserving image detail, pan, hotspots, and bounded zoom.
- `components/building-panel.tsx`, `person-panel.tsx`, `evidence-panel.tsx`: information and provenance.
- `lib/atlas.ts`, `components/atlas-browser.tsx`, `atlas-panel.tsx`: public map-reference filters, dated history, source sheets, and existing street-entry links.
- `content/map-reference-review.json`: reviewed source and area-reference records; `public/credits/map-references.json` is the downloadable mirror.
- `lib/content.ts`: reviewed Region, Place, Scene, Source, and Claim records.
- `lib/exploration.ts`: URL parsing, serialization, and interpolation along mapped roads.
- `lib/resident.ts`: contextual fictional routines, Nano prompts, output checks, and session cleanup.
- `lib/street-content.ts` and `street-entities.ts`: dated scenarios, typed selectable entities, and mapped transport routes.
- `lib/hosting.ts`, `static-app/`, and `vite.pages.config.ts`: the standalone static build and shared asset/base-path handling.
- `lib/street-simulation.ts`: length-aware placement and stable, bounded fictional movement on mapped roads.
- `content/military-source-review.json`, `street-sprite-production.json`: new photograph metadata, reviewed geometry, exact sprite prompts, and limitations.
- `content/asset-rights.json`, `production.json`, `shop-prompt.txt`: asset rights and production records.
- `content/qa.md`: dated review results and explicit gaps.
- `public/`: served photographs, generated scenes, map data, and MapLibre worker/license.

## Documentation

Start with [development](docs/development.md), then read [architecture](docs/architecture.md), [evidence policy](docs/evidence-policy.md), and [validation](docs/validation.md). The [roadmap](docs/roadmap.md) distinguishes current implementation from remaining work. [Repository workflow](docs/repository-workflow.md) explains project commits and the separate Sites source history.

## Pilot limits

The timeline selects a scenario year, not five separately observed historical worlds. Photographs retain their capture dates; generated assets are shared across 2015–2019. Contemporary geometry does not prove historical continuity. Missing heights and rendered appearance are inferred. Aoji includes explicitly labeled Namyang and Chongjin regional references, and Haksong footprint coverage is sparse. The apartment kitchen is a regional household reconstruction, not a verified interior or identified resident.

No free-roaming 3D world, video, live image generation, verified annual world changes, or public-figure reenactment is included in this pilot.

## GitHub Pages

```sh
npm run build:pages
node scripts/check-pages.mjs
npm run preview:pages
```

The static app serves at `/north/` by default. `PAGES_BASE_PATH` overrides that base; the Actions workflow reads it from GitHub's Pages configuration, including custom domains. This target uses the same explorer components, content, and evidence as Sites, without the runtime map-key endpoint. NASA / OSM and prepared thoughts need no server. A separately supplied `VITE_MAPTILER_KEY` would be a public build-time browser key.

The Pages site is public. Existing Sites access remains owner-private. See [deployment](docs/deployment.md) for the build/publish boundary and troubleshooting.

## Miniature asset production

The three civilian Pyongyang places use a lazy-loaded Three.js layer with Blender GLBs, mapped-footprint façades, shared map depth and fallback sprites. See [production, evidence boundaries and release budgets](docs/diorama-assets.md) and the reproducible sources in `art/pyongyang/`.
