# NORTH

**Explore North Korea by following documented geography into explicitly labeled reconstructions of everyday life.**

NORTH is an English-language documentary web pilot. It starts with a country map and follows six places in Pyongyang and Aoji into photographs, small details, and imagined life scenes. At street zoom, mapped building footprints become an isometric neighborhood with moving, clickable fictional pedestrians.

The central rule is to preserve what sources establish and identify what has been inferred or generated. A photographed apartment can lead into an imagined kitchen; it does not establish the real interior behind that window.

## Current experience

- A left-hand timeline selects a scenario year from 2015 to 2019; the right-hand controls change map or image detail.
- Street zoom shows mapped roads, railway lines, extruded buildings, and fictional walkers. Buildings open a photo and information panel on desktop or a bottom sheet on small screens.
- People expose an imagined role, routine, and inner thought. Supported browsers can optionally rephrase a prepared thought with on-device Gemini Nano.
- Photographs and AI-generated scenes have persistent production labels. The evidence panel retains original source dates, locations, reuse conditions, and limitations.
- Exploration state survives refresh and browser history. Place lists remain usable when map rendering fails.

This is a pilot with reviewed references and explicit gaps. Selected years share the same scene assets; they are not five independently documented historical worlds. Aoji has limited direct period evidence and sparse mapped footprint coverage. Native Nano inference still needs validation on a supported physical Chrome device.

## Start locally

Use Node.js **22.13 or newer** and npm. The application and lockfile are in `site/`.

```sh
cd site
npm run install:ci
npm run dev
```

Open the address printed by the server, normally `http://127.0.0.1:5173/`. No map or model key is required for the default pilot: it uses NASA / OpenStreetMap references and prepared fictional thoughts.

```sh
npx tsc --noEmit
node scripts/check-content.mjs
node scripts/check-residents.mjs
npm run build
```

See the [development guide](site/docs/development.md) for configuration and troubleshooting.

## Documentation

| Document | Purpose |
| --- | --- |
| [Application README](site/README.md) | App entry points, commands, and configuration |
| [Architecture](site/docs/architecture.md) | Exploration state, rendering, panels, and runtime boundaries |
| [Evidence and reconstruction policy](site/docs/evidence-policy.md) | Source review, claim levels, asset rights, and production records |
| [Development](site/docs/development.md) | Setup, local workflow, configuration, and checks |
| [Validation](site/docs/validation.md) | Automated coverage, manual review, and outstanding checks |
| [Roadmap](site/docs/roadmap.md) | Current limits and the next accepted product priorities |
| [Repository workflow](site/docs/repository-workflow.md) | Commits, source ownership, and deployment separation |
| [Review record](site/content/qa.md) | Dated observations from the local pilot review |
| [Changelog](CHANGELOG.md) | Notable project changes |

## Repository layout

```text
north/
├── README.md
├── CONTRIBUTING.md
├── CHANGELOG.md
└── site/
    ├── app/                 # Explorer route, styles, and map configuration API
    ├── components/          # Map, scene viewer, and information panels
    ├── lib/                 # Content, navigation, and resident scenarios
    ├── content/             # Rights, image production, and review records
    ├── docs/                # English technical and editorial documentation
    ├── public/              # Served scenes, map data, and attribution
    ├── scripts/             # Installation, checks, and framework commands
    └── .openai/hosting.json  # Existing Sites project identity
```

The project repository tracks `site/` as ordinary files, not a submodule. A separate local Sites repository may exist at `site/.git`; it is deployment tooling state and is not part of a clone of this repository. Research downloads, local screenshots, dependency caches, and deployment packages are excluded. Reviewed provenance is retained in `site/lib/content.ts` and `site/content/`.

## Review deployment

The pilot is available to authorized viewers at [NORTH · north-evidence-explorer.glassypike.chatgpt.site](https://north-evidence-explorer.glassypike.chatgpt.site). Its current audience is owner-private. A local build or Git commit does not itself update the hosted version.

Third-party photographs, map data, and libraries retain their own licenses. Consult the [evidence policy](site/docs/evidence-policy.md) and [asset rights manifest](site/content/asset-rights.json) before reusing them. This repository does not currently declare a blanket license for all project code and assets.
