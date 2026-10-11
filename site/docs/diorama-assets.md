# Pyongyang miniature-diorama release

The civilian Pyongyang pilot uses genuine Blender geometry in the MapLibre scene.
The approved imagegen image provides art direction; it is not a map, texture,
or verified neighborhood arrangement. The real three place anchors stay separate.

## Art direction and production

Cream plaster, restrained coral, blue/teal glazing, matte cloth, beveled edges
and soft daylight replace the single-view pixel sprites in the three pilot places.
Anonymous residents, commuters, a parcel carrier, seller, cyclist and bus retain
their existing fictional activities and thought contexts. Furniture and vegetation
are illustrative details rather than a recorded inventory.

`art/pyongyang/` contains the construction/export script, compressed `.blend`,
English production notes, validation script and rendered contact sheet. Blender
5.2 and the connected Blender MCP were used; the original scene was preserved.
See that directory's README for reproduction. The application does not need
Blender, a model service, API keys or a database at runtime.

The 13 GLBs and 13 WebP previews are reviewed in
`content/diorama-production.json`. The same record is published at
`/credits/pyongyang-diorama.json` and linked from the evidence panel. It records
source dates, creators, photo reuse conditions, geometry limits, hashes and the
CC BY-SA 4.0 asset-bundle terms. The earlier sprite assets remain available.

## Spatial and evidentiary boundaries

- Contemporary OSM footprints are the spatial authority, not a reconstruction of
  observations in every year from 2015 through 2019.
- OSM way 210296271 contains three connected circular towers. Reviewed arc points
  register three cylinder modules and a connector within this compound outline.
  The heights of 36/48/36 meters and simplified floor/window counts are explicitly
  illustrative; no survey or exact façade replica is claimed.
- Other pilot façades use the actual polygon outlines with inferred windows,
  frames, floor ledges and doors. Generic block and storefront GLBs are reusable
  production modules held in the asset library. They do not replace unmatched
  real buildings or represent the actual Kwangbok Department Store.
- Bus design, furniture, greenery, clothing, possessions, activity and thoughts
  remain reconstructed. The bus photograph does not identify the modeled bus,
  operator, route, timetable or stopping point.
- Existing Aoji, JSA and parade artwork remains in its established sprite renderer.

## Web implementation

`lib/diorama-layer.ts` is imported on demand after entry into a pilot street.
Three.js shares MapLibre's WebGL context, projection matrix and depth buffer.
The local coordinate system is east/up/south; glTF is Y-up, feet/tires at Y=0,
and forward +Z. Geographic movement, route identity and selection remain owned
by the existing simulation. GLBs embed materials and geometry without textures
or external resource URLs.

Generic static façades are batched by material; windows, frames and ledges use
instancing. Lighting uses inexpensive directional and hemisphere lights, with
simple ground-contact shading rather than a large dynamic shadow map. The layer
reuses loaded models, aborts pending downloads on teardown and disposes GPU
geometry, materials and textures. The selected, hovered or keyboard-focused
person pauses; global pause and reduced motion apply to all activity. A stable
paused scene does not continuously repaint the 3D layer.

Transparent DOM targets keep the same keyboard, touch and panel interactions.
Depth-aware building intersections hide covered targets. Model-load failures
retain original sprites, information and scene navigation; module-load failures
retain the original extrusions. Region/scene navigation disables the pilot layer.

Street mode starts at zoom 15. Pilot entry uses zoom 17.6 and pitch 60°; close map
zoom is bounded at 19. At the upper limit, the next zoom-in action can open the
prepared scene. The street dock has an explicit Open scene action. Scale and
artistic readability are separate: people use a 2.5× visual scale, cyclists 1.65×
and the bus 1.15×. These scales are interpretive and do not measure real people
or vehicles. Routes retain their actual geographic alignment.

## Release budget

| Asset group | Uncompressed size | Delivery behavior |
| --- | ---: | --- |
| All 13 GLBs | 2,052,192 bytes | Requested by the pilot layer as needed |
| All 13 individual WebP previews | 78,430 bytes | Loaded by selected-person panels |
| All GLBs, local gzip estimate | 454,770 bytes | Actual transfer depends on CDN encoding |
| Three.js/GLTF pilot chunk | Approximately 662 KB / 169 KB gzip | Separate from initial application and map chunks |

The asset check enforces a 3 MB library budget, 1.2 MB per model, 90 KB per preview,
20 material primitives per asset, meter-scale/ground/orientation contracts, stable
limb metadata, self-contained GLBs and matching reviewed hashes. Existing moving
limits remain 32 desktop and 20 mobile. Source `.blend`, scripts, PNG render
proofs and contact-sheet source are outside `public/` and absent from browser
release assets. Published preview contact-sheet WebP is optional and is not
loaded during normal exploration.

These figures describe the added artwork, not the entire site. The production
static artifact also includes the existing map worker, geometry, photographs,
scene images and sprite fallback assets. Recheck `scripts/check-diorama.mjs`,
`check-pages.mjs` and both hosting builds after changes. Camera and device
measurements vary; this release does not claim a universal frame-rate guarantee.
