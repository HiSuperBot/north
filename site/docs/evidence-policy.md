# Evidence and reconstruction policy

## Editorial rule

Fix the details that sources establish, then identify every inference and generated addition. NORTH explores possible everyday life; it must not present a reconstruction as a photograph, an identified resident, or a verified interior.

Scene production and claim evidence are separate concepts. An AI-generated image is always labeled **AI Reconstruction**, even if some depicted elements are informed by an observed photograph. Element-level evidence does not make the generated image itself an observation.

## Evidence levels

| Level | Meaning | Required review |
| --- | --- | --- |
| Observed | A detail directly visible in an original photograph or observation | Identify the original source and the detail it actually shows |
| Corroborated | Independent original sources agree about the same claim | Check independence, matching place/time, and the actual claim |
| Inferred | A reasonable interpretation from context, spatial relationships, or regional material | State the inference and its limits |
| AI Reconstruction | A generated detail with no direct observation of that exact scene | Keep the production label visible and avoid factual wording |

Reposts, a database linking the same photograph, and articles reusing one satellite image are one original evidence chain. They do not become independent corroboration by appearing on several websites. No numerical confidence percentage is assigned.

The current horizontal map geometry is a contemporary reference. It is not automatically an Observed claim about the selected historical year. An OSM edit timestamp is not a capture date.

## Records and responsibilities

`lib/content.ts` contains the reviewed content model:

| Record | Responsibility |
| --- | --- |
| `Region` | Regional identity, center, and introduction |
| `Place` | A reviewed exploration anchor, coordinates, entry scene, and spatial-source links |
| `Scene` | Production type, image, original period/location, description, parent/hotspot, credit, and claims |
| `Source` | Original URL, creator, capture/observation time, publication time, original location, reuse conditions, evidence-chain identity, and limitations |
| `Claim` | One element's evidence level, explanation, source IDs, and optional scope |

Keep capture and publication dates separate. Unknown capture dates must remain unknown. A date declared by a source but not independently verified must retain that qualification. The `original` field identifies the original evidence chain for deduplication and independence review.

## Current place anchors

Coordinates are listed as latitude, longitude; application coordinate arrays use longitude, latitude.

| Place ID | Anchor | What the material establishes | What it does not establish |
| --- | --- | --- | --- |
| `kwangbok-apartment` | 39.03030, 125.68402 | A 2018 cylindrical apartment exterior; editorial match to OSM way 210296271 | The actual interior behind a window, resident identity, or historical height |
| `pyongyang-transit` | 39.02034, 125.73320 | A photographed Pyongyang street viewpoint from July 2019 | An exact bus stop, timetable, or passenger journey |
| `kwangbok-store` | 39.03400, 125.69230 | The named store's photographed exterior from August 2019 | Actual interior layout, stock, or the depicted transaction |
| `aoji-coal` | 42.52637, 130.35570 | A mine-area gazetteer anchor and naming context | The exact 2015–2019 surface facilities, equipment, or working routine |
| `haksong-rail` | 42.51886, 130.39360 | A contemporary mapped station point | That a Namyang reference depicts Haksong, or verifies a particular train/platform |
| `haksong-housing` | 42.51991, 130.39505 | A contemporary district reference point | A specific Haksong house, courtyard, or household |

Each record links its sources in the application. A place anchor is not a claim that every surrounding structure or historical activity has been documented.

## Spatial and temporal limits

- NASA Blue Marble is a 2004 composite used for a coarse overview. It cannot establish 2015–2019 buildings or daily life.
- The OSM extract was downloaded on 8 October 2026. Footprints fix the horizontal geometry of the current reference data, not verified historical continuity.
- Height, use, interiors, facade details, and occupancy are not established by a footprint alone. Missing heights and rendered colors are illustrative.
- Namyang housing/rail photographs and Chongjin transport material are North Hamgyong regional context. Retain their original locations; do not relabel them as Aoji observations.
- The 2026 RUSI Aoji profile uses recent observations, principally 2024. It supplies later spatial context and is not evidence of the pilot's historical daily-life scenes. Its satellite images are not reused as service assets or generation inputs.
- The 2017 MICS provides population/province-level household context. An institutional food-preparation account is an institutional proxy, not an observation of the selected household.
- The selected year frames a scenario. Shared assets and seeded text variations do not prove annual changes.

The kitchen is a **regional household reconstruction** entered through an observed exterior. The description must never suggest that a particular real family or room has been identified behind that window.

## Asset rights

Public viewing, downloading, adaptation, and redistribution are separate permissions. Use only assets whose reuse conditions have been reviewed for the intended use.

- `content/asset-rights.json` records the five served photograph derivatives, original file/source URLs, creators, licenses, capture/publication metadata, and modifications.
- The current photographs retain CC BY-SA 4.0 attribution and license links. Preserve those requirements when resizing, converting, cropping, or redistributing derivatives.
- `public/neighborhoods.geojson` is the served ODbL derived dataset. Keep the OpenStreetMap attribution and dataset access link.
- Natural Earth outlines are public-domain cartographic data. NASA overview imagery retains NASA credit.
- The copied MapLibre worker has its license in `public/maplibre-license.txt`; vendored UI/build assets retain their accompanying licenses.
- A source marked `link only` may inform a reviewed textual claim. It does not authorize copying its images into the service or using them as generation inputs.

Do not add a blanket project license that purports to replace these third-party conditions. Project code licensing has not yet been specified.

## Image-production workflow

1. Define the scene's region, period, entry anchor, and intended claims.
2. Review original sources, dates, locations, independence, and reuse conditions.
3. Decide which elements are fixed, inferred, or fully generated. Reject source material whose rights are not suitable for the intended asset/input use.
4. Generate only the identified reconstruction, with explicit instructions against exact identities or unsupported factual claims.
5. Inspect anatomy, geometry, visible technology, readable text, and accidental political or identifying detail. Correct the asset or narrow its claim before accepting it.
6. Record the prompt, references, asset, transformations, reviewer observations, and unresolved limits; add source/claim records and a persistent production label.
7. Verify asset loading, attribution, hotspot placement, bounded zoom, and the evidence panel; run content integrity checks.

`content/production.json` records the built-in image generator, input policy, references, retained briefs, and inspection notes. `content/shop-prompt.txt` retains the exact shop prompt. The original delegated prompts for the other generated assets were not returned; their records are honestly labeled retained production briefs. Do not describe them as exact prompts or a fully reproducible generation log. Newly produced assets should preserve the exact prompt at creation time.

Raw research downloads and local screenshots are workspace material outside the committed source. Move any newly accepted evidence into the reviewed manifests; a file's presence in the research folder does not make it approved.

## Resident thoughts

People, identities, roles, routines, and thoughts are fictional scenarios. Nano receives the selected year/location, imagined role/action, a prepared draft, and regional evidence with original dates and limitations. It rephrases the draft; it does not verify a resident's thoughts or discover new evidence.

Keep **AI Reconstruction** visible for both prepared and generated thoughts. Describe a supported output as generated on-device, not as testimony. Structural output validation cannot guarantee factual correctness. Do not make real people, unsupported political views, prices, specific services, or historical events into unqualified claims.

Public-figure reenactment is outside this pilot. Any future recorded-event reconstruction needs its own source review and must distinguish the record from unobserved additions.
