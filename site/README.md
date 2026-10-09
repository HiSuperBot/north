# NORTH

An English documentary map pilot with a left-hand 2015–2019 scenario timeline and right-hand map/detail zoom. Selecting a place or reaching zoom 15 reveals isometric mapped buildings and clickable fictional pedestrians. Six map anchors connect to dated photographs, regional references and prepared AI scenes.

## Run

```sh
npm install
npm run dev
npx tsc --noEmit
node --experimental-strip-types scripts/check-content.mjs
npm run build
```

The application is in this `site` directory. Sites owns the private deployment; `.openai/hosting.json` contains its project ID. Do not create another site for this checkout.

Set `MAPTILER_KEY` as a runtime deployment variable to use MapTiler satellite tiles. The public browser key must be restricted to the local / deployed domains in MapTiler. Without it, the map uses NASA's 2004 Blue Marble composite for overview and contemporary OpenStreetMap tiles for regional context. Street rendering uses the checked-in OSM extract, not fabricated geometry. Map/provider dates are not treated as observations of the selected scenario year.

## Content and evidence

- `lib/content.ts`: Region, Place, Scene, Source and Claim records with original dates, locations, rights and limitations.
- `public/neighborhoods.geojson`: ODbL derived OSM roads, rails and building footprints, downloaded 8 October 2026. Heights without OSM tags are illustrative. Geometry is contemporary; historical continuity is not verified.
- `public/geography.geojson`: generalized Natural Earth country boundaries (public domain).
- `public/scenes`: resized attributed Commons photographs and six imagegen reconstructions, plus one transparent pedestrian sprite.
- `content/production.json` and `content/shop-prompt.txt`: production briefs, available exact prompt, sources and editorial inspection records. Delegated originals did not return their exact tool prompts; those records are explicitly identified as retained briefs.
- `content/asset-rights.json`: exact source pages and licensing for served photograph derivatives.

People, thoughts, routes, routines and rendered appearances are explicitly fictional/inferred. Years select a scenario, not five separately documented historical worlds. Generated scene assets remain shared across the range; original photographic dates stay visible. Aoji uses labeled Namyang / Chongjin regional context. The apartment kitchen is regional household reconstruction, not a verified interior behind the selected window.

Unsupported WebGL falls back to the place list. Image transitions preload the target and retain the current view on failure. Reduced-motion users see still pedestrians and instant camera transitions. Photos preserve aspect ratio; pan and detail zoom stop at available image resolution. Scene, place, region and year round-trip through the URL and browser history.

Native WebMCP registers state, place navigation, scene navigation and evidence tools when `document.modelContext` or the earlier `navigator.modelContext` API exists. Sources: https://developer.chrome.com/docs/ai/webmcp/imperative-api . Ordinary browsers require no polyfill.

### Building information and thoughts

Click an extruded footprint for its information card; documented place pins also open cards with the reviewed photo / scene gallery. Photos are associated with a footprint only through an explicit reviewed source match, never by proximity. Unmatched buildings retain an honest missing-photo state. Desktop cards use the right side; small screens use the bottom sheet.

`lib/resident.ts` supplies fictional role/routine context, a stable year-dependent draft, source dates and limitations. `components/person-panel.tsx` probes Chrome's built-in `LanguageModel` and offers optional, user-triggered Gemini Nano generation. It rephrases the draft without requesting new historical claims. Output is constrained JSON and remains labeled AI Reconstruction. Unsupported devices, failures and rejected output retain the prepared scenario. Nothing is sent to an external model service, and no API key is required. A model can still produce an inaccurate rephrasing; fictional output is never treated as evidence.

Requirements and availability are determined at runtime, using the [Chrome Prompt API documentation](https://developer.chrome.com/docs/ai/prompt-api) (reviewed 9 October 2026). Desktop Chrome 148+ is the documented web baseline, with hardware/storage requirements and a first-use model download. Mobile is unsupported. The product requests English, one of the documented languages. Sites displayed within an embedding browser may have different availability; open the private site in supported desktop Chrome to try generation. Gemma is a separate deployment option and is not loaded by this build.

Additional check: `node scripts/check-residents.mjs`. Native Nano inference needs a supported device; the automated adapter checks use a test double.
