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

## Street selection and movement — 10 October 2026

- Reviewed locally in Codex IAB at 1280×800, 390×844, and the normal 645×680 preview. Narrow dimensions are viewport checks, not physical-touch-device tests.
- Directly clicked a moving map pedestrian and activated another with Enter. Only the person inspector opened. The selected marker received a ring, text label and pressed state, and stopped moving while other people remained active.
- Selected identity and thought remained after a zoom change. Global pause/resume and Escape dismissal of the person card were exercised. Retained route/progress behavior was also reviewed in the reconciliation code.
- The visible-person toolbar action opened an actual visible marker. When geometry was temporarily unavailable, no person card was fabricated and the apartment photograph remained accessible. The reviewed GeoJSON was restored before packaging.
- Desktop thoughts reserve map space in a right panel. The mobile thought card spans the screen width, keeps reconstruction text visible, and scrolls to regional context/evidence with a persistent close control.
- Opening person evidence and pressing Escape retained the selected person. The apartment exterior → window → kitchen path was repeated; dismissing kitchen evidence retained the kitchen and its URL. This caught and fixed an Escape event reaching both the sheet and exploration shortcut.
- The 2017 scenario year survived a reload; original photograph and regional source dates retained their own meanings.
- Content and resident checks passed. The new street check covered all six mapped pools and 10,472 positions along source roads, plus stable route identity, initial spacing, unsuitable-road filtering, endpoint rests and closed loops.
- Native Nano inference, a physical touch device, and a browser without WebGL remain outside this review. No new historical evidence or image assets were introduced.

## Street expansion and static Pages review — 11 October 2026

- Reviewed the actual `dist-pages/` build at `/north/` in Codex IAB, using the normal 1280×720 viewport and a 390×844 mobile override; restored the override afterward. This is not a physical touch-device check.
- Opened all 17 prepared scenes through the current WebMCP tools. All returned successful transitions and showed their intended title, photograph/reconstruction label, base-prefixed image, and nonzero native width. The eight places and five years also passed automated navigation/source checks.
- JSA 2018 normalized to the after-demilitarization default with unarmed fictional guards. Selecting the before context changed its URL, reference date, and guard sprites and cleared the prior inspector.
- Clicked a JSA guard and Panmungak. The person and object panels showed the appropriate thought or observed context photo, original dates, limits, and reconstruction labels. Closing guard evidence with Escape preserved the selected guard.
- Entering the square selected 2015 and the event date. A tank click showed the 10 October photograph, CC BY-SA 2.0 attribution, and chassis/model/viewpoint limits. Selecting 2018 removed tanks and marching participants and exposed the dated parade entry.
- Activated a marching participant with Enter. After resuming global motion, its ID and rendered position remained fixed while the other participants changed position. The building toolbar then replaced the person card with one building card.
- Transport filtering removed tanks without removing people. Selected objects and region changes used one inspector state. The mobile parade pool contained exactly 12 walkers and 8 moving parade entities, meeting the 20-element limit. The desktop pool stayed under 32.
- Mobile object sheets settled at 72% viewport height with a reachable close control; the street reconstruction/date label remained visible above them. Selected place cards automatically scrolled into view. Reviewed miniature alpha margins and readable guard/vehicle scales in the production contact sheet.
- Temporarily removed the built bus sprite: a textual fallback control appeared. Restored it afterward.
- Temporarily removed the built guard photo: the attempted scene transition returned `ok:false`, retained the JSA exterior and URL, and displayed its failure notice. Restored the photo afterward.
- Temporarily removed both built geometry files: the legacy region-only Aoji link selected the coal anchor, an invalid scenario recovered to `aoji-life`, the failure notice appeared, and the coal scene remained accessible. Browser back restored the street route. Restored both datasets afterward.
- Reviewed source dates, proxy limits, actual CC license versions, DVIDS credit/non-endorsement notice, and independent-original deduplication. Added geometry extraction dates to selected building records so new map features are not attributed to the older extract.
- TypeScript, source/resident/motion/scenario checks, the standalone Pages build/artifact check, and the Sites Worker build passed. The static entry lives in `static-app/` so Vinext does not register it as an extra Pages Router route. The checked sample counts are 85 scene/year URL round trips, 960 prepared resident contexts, 10,472 ordinary pedestrian motion positions, and 8,136 street-entity road/rail positions.

Limits: native Nano inference, a physical touch device, and a no-WebGL browser remain untested. Source-based military miniatures do not prove actual guard positions, formation size, routes, vehicle models, or individual thoughts. The 2019 JSA context is inferred from the 2018 record; other selected years do not invent new events. Contemporary footprints and the MDL alignment are not historical observations or surveyed legal boundaries. Haksong geometry and direct Aoji period photographs remain sparse.
