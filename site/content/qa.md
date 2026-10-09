# Review record

Verified locally in Codex IAB before the private pilot deployment:

- Desktop 1440×1000, mobile-sized viewport 390×844, and the normal 645×700 preview.
- Country → Pyongyang → apartment map → exterior → window → regional kitchen → evidence; return to map.
- All 12 prepared scene URLs, including the five other places, loaded their intended photograph / generated image and production label through native WebMCP.
- Native WebMCP place navigation returns the committed exploration state. Scene navigation and source records use the same content manifest as the UI.
- Zoom-out crosses back to map mode; reselecting the same place restores the street camera.
- Person clicked directly on the map; fictional thought and AI Reconstruction label shown. Pause / resume controls verified.
- Building inspector shows mapped feature identity, illustrative height qualification, map record date and original OSM link. Canvas building selection uses the same inspector. The keyboard-accessible toolbar provides an alternate entry.
- Scenario year changed to 2017, survived reload. Browser back restored the previous scene; previous-view control returned to the regional reference.
- Invalid year and nonexistent scene recovered to the nearest valid regional map with a notice and normalized URL.
- Generated shop image temporarily removed: attempted transition retained the observed exterior and URL with a load-failure notice. Asset restored.
- Geometry temporarily removed: map displayed the failure notice and the place list still opened the coal scene. Dataset restored.
- Source panel separates original capture and publication dates, regional Namyang / Chongjin references, institutional food preparation, and later RUSI observations. Photo license links and attributions displayed.
- Source integrity check: six places, 12 scenes, 60 year/scene URL round-trips, navigation graph, rights records, and interpolation along mapped roads.
- TypeScript and Worker-compatible production build passed.

Limits: selected years share the reviewed 2015–2019 reconstruction assets rather than five dated worlds. Contemporary geometry does not prove historical continuity. Haksong station / district have sparse footprint coverage, so the underlying reference map remains visible there. MapTiler awaits a domain-restricted runtime MAPTILER_KEY; NASA / OSM fallback is active. A no-WebGL browser was not available for direct QA; the constructor failure and place-list fallback were reviewed. Exact delegated imagegen prompts were not returned; retained production briefs are explicitly distinguished from the exact recorded shop prompt.

## Building cards and contextual thoughts — 9 October 2026

- Direct canvas building click opened the right information sheet; selecting another building kept the map interactive and refreshed the record.
- The explicitly matched apartment shows the 2018 exterior, a separately labeled generated kitchen, capture date, attribution, source links and map record. Unmatched features show no verified photograph rather than inheriting a nearby photo.
- The selected gallery image opens its own evidence: the kitchen’s regional / institutional references appear when the generated kitchen is selected.
- A 390×844 mobile-sized viewport uses a full-width bottom sheet with a scrollable body. The street reconstruction label remains visible above the panel. Desktop 1280×720 uses the right sheet and resizes the map with zoom controls beside it. This responsive-layout check does not constitute a physical-touch-device review.
- Pedestrian buttons stop map event propagation, so clicking a person does not also select the building underneath. Direct pedestrian click showed the contextual fictional thought.
- Prepared thoughts vary by place, role, routine and scenario-year seed. This does not represent verified annual changes or historical testimony.
- Gemini Nano is optional and starts only from a user action. Availability is probed with English input/output options; unsupported IAB showed the prepared scenario. Download progress, cancellation, rejected output and resource cleanup are implemented.
- Resident checks cover 720 place/year/person combinations, preservation of source dates, strict building-photo association and the Nano adapter’s success, malformed output and cancellation paths. The adapter checks use a test double. Native Nano model generation was not exercised on a supported physical Chrome device in this review.

## English documentation review — 9 October 2026

- Reviewed the project and application READMEs, contributing guide, changelog, and six technical/editorial guides against the implementation and retained asset records.
- Checked 28 relative documentation links, documented npm command names, and referenced implementation files. All passed.
- Re-ran content integrity and resident checks using the documented commands. Both passed; native Nano inference remains untested.
- Clarified that the narrow-screen review used a mobile-sized viewport, without claiming a physical-touch-device test.
- Application behavior, assets, dependencies, and build inputs were unchanged. The previously successful type check and build remain the relevant application checks; this documentation update was not redeployed.
