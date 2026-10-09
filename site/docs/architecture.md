# Architecture

## System boundary

NORTH uses one exploration route. Its React client connects a MapLibre map to prepared image scenes and information panels. Reviewed content is static and checked into the repository. The server supplies runtime map configuration; it does not generate resident thoughts or scene images.

Image generation happens during production. Optional resident-thought rephrasing happens on the visitor's device through a supported browser API. There is no external model service or user-content database in the implemented journey. D1, R2, and connector helpers come from the Sites starter; the current exploration feature does not use them.

## Exploration state

`lib/exploration.ts` defines the shared state:

```ts
interface Exploration {
  year: number;
  regionId: string | null;
  placeId: string | null;
  sceneId: string | null;
  view: 'map' | 'street';
}
```

The controller in `app/page.tsx` owns this state. It serializes navigation into the URL, restores it on mount and `popstate`, and recovers malformed links to the nearest available view. A valid scene determines its place and region. The supported year range is 2015–2019, with 2018 as the default.

Example links:

```text
/?year=2018
/?year=2018&region=pyongyang
/?year=2018&region=pyongyang&place=kwangbok-apartment&view=street
/?year=2018&region=pyongyang&place=kwangbok-apartment&scene=kitchen-life
```

Year selection changes the scenario state and prepared thought variant. It does not replace source dates or load a separately observed historical world.

## Map and street simulation

`components/map-view.tsx` creates MapLibre after client mount. It loads map configuration and `public/neighborhoods.geojson`, then adds country outlines, mapped roads, railway lines, and building extrusions.

- Without a MapTiler key, NASA Blue Marble supplies a coarse country overview and contemporary OSM raster tiles supply regional reference.
- Street mode begins at map zoom 15. Place selection normally uses zoom 16.6, pitch 52°, and bearing −28°; zooming out reverses the mode transition.
- Map zoom is capped at 18. When a selected place reaches sufficiently close map zoom, the next zoom-in action can open its prepared entry scene.
- Height tags are used when present; levels can supply an inferred height. The fallback height and rendered colors are illustrative. Footprints do not establish height, use, occupancy, or historical appearance.
- Areas with insufficient footprint coverage retain the underlying reference map. Missing geometry is not replaced with invented buildings.

Up to 24 fictional sprites follow nearby mapped road segments. Movement uses segment-length interpolation, a repeated forward/backward phase, and reduced-motion/pause controls. It does not model observed routes, schedules, traffic, or population density. Occluded sprites are hidden and removed from keyboard navigation. Marker clicks stop event propagation so a person or place does not also select a building behind it.

A map failure leaves the place list available. The map container observes layout changes when a desktop building panel opens. Selected building color is a UI highlight, not a change to the source data.

## Scene viewer

`components/scene-viewer.tsx` preserves image aspect ratio and supports pan, bounded detail zoom, and normalized hotspots. Maximum detail is limited by the available native image resolution and a four-times interaction cap. Window detail uses an interactive crop of the observed exterior; it does not reveal a real interior.

The controller preloads a target before committing a scene transition. A load failure keeps the current state and image with a notice. A navigation token prevents a completed older request from replacing a newer selection. Scenes have parent links for reverse exploration and optional hotspot links for the next detail.

## Information panels

- **Building panel:** a non-modal right sheet on desktop, bottom sheet on small screens. It shows a reviewed photo/gallery when associated, metadata, limits, and original sources. `placeForBuilding()` matches explicit source URLs; proximity alone never assigns a photo.
- **Person panel:** an imagined role, activity, scenario location/year, inner thought, and regional context. No real identity or testimony is represented.
- **Evidence panel:** a modal provenance sheet for the current scene, selected building, or fictional resident context. Repeated aliases of one original source are deduplicated in the source list.

A gallery's evidence action opens the evidence for the displayed image. All generated images remain labeled AI Reconstruction, while element-level claim labels describe the evidence for particular details.

## Resident thoughts and Gemini Nano

`lib/resident.ts` selects a fictional routine from the place and pedestrian index. A deterministic year/index seed selects a prepared thought. The context pack preserves regional claim limitations and source capture dates. It does not supply invented year-specific events.

`components/person-panel.tsx` probes `LanguageModel.availability()` with English input/output options. A user action can create a Nano session and rephrase the supplied draft. The system prompt asks it to preserve meaning and avoid new historical claims. Output is constrained JSON and checked for shape, length, markup, links, and explicit years. Cancellation prevents stale output from replacing a newer person; sessions are destroyed after use.

Download progress and failure are surfaced. Unsupported devices, rejected responses, and failed generation retain the prepared thought. Validation is structural, not a factual-verification model: generated text remains fictional and can still be inaccurate.

## Runtime map configuration

The Worker in `build/sites-worker.ts` places `MAPTILER_KEY` in request-scoped `AsyncLocalStorage`. `app/api/map-config/route.ts` returns the public browser key with `Cache-Control: no-store`. Local process configuration is a fallback. The request-scoped wrapper avoids mixing runtime values across concurrent requests.

`.openai/hosting.json` identifies the existing Sites project. Production output is a Cloudflare-compatible Worker and client assets. Checkout-local execution profiles, dependencies, and build output are not project source.

## Native WebMCP

When `document.modelContext` or the earlier `navigator.modelContext` interface is available, the controller registers:

| Tool | Effect |
| --- | --- |
| `get_exploration_state` | Read the shared exploration state |
| `navigate_to_place` | Select one of the six map anchors |
| `navigate_to_scene` | Preload and open a prepared scene |
| `get_scene_evidence` | Return claim and original-source records |

These tools use the same state transitions and content as the UI. Registration is cleaned up on unmount. Ordinary browsers retain all UI controls without a WebMCP polyfill.

## Principal implementation files

| Concern | Files |
| --- | --- |
| Route/controller | `app/page.tsx`, `app/layout.tsx` |
| Visual system | `app/globals.css`, `components/ui/` |
| Geographic rendering | `components/map-view.tsx`, `public/neighborhoods.geojson` |
| Image exploration | `components/scene-viewer.tsx` |
| Metadata and evidence | `lib/content.ts`, `components/evidence-panel.tsx` |
| Fictional residents | `lib/resident.ts`, `components/person-panel.tsx` |
| Runtime provider key | `lib/map-config.ts`, `app/api/map-config/route.ts`, `build/sites-worker.ts` |
| Integrity checks | `scripts/check-content.mjs`, `scripts/check-residents.mjs` |
