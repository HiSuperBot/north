# Changelog

This file records notable product and documentation changes. The pilot has not yet adopted numbered releases.

## Private pilot update — 2026-10-10

### Street interaction

- Preserve pedestrian identities and route progress across camera changes; distribute people by mapped road length and use varied illustrative walking speeds with endpoint rests.
- Pause the hovered, keyboard-focused, or selected pedestrian and show a selection ring. The toolbar now selects a visible mapped pedestrian instead of creating an unrelated person card.
- Use a desktop side panel and a full-width mobile thought sheet, with more visible map space and a close control that remains reachable while scrolling.
- Keep Escape scoped to the topmost evidence sheet so it preserves the person or scene underneath.
- Add motion checks across all six places, including source-road containment, spacing, unsuitable roads, identity stability, endpoint rests, and closed loops.

TypeScript, content/resident/street checks, documentation links, and the production build passed. The existing owner-private Site was updated successfully. Native Nano inference and physical-device review remain pending.

## Repository documentation — 2026-10-09

### Documentation and repository

- Track the complete application as ordinary files in the main project repository while preserving local Sites deployment history.
- Add English guides for architecture, evidence policy, development, validation, roadmap, and repository workflow.
- Document the distinction between a selected scenario year and dated observations, and between tested behavior and outstanding device checks.
- Exclude local research downloads, screenshots, caches, private configuration, and deployment archives from project commits.

## Private pilot — 2026-10-09

### Exploration

- Add country and regional map exploration for Pyongyang and Aoji, with six place anchors and twelve scene records.
- Add a 2015–2019 scenario timeline, map/detail zoom controls, scene hotspots, URL state, and browser-history navigation.
- Add street simulation using mapped roads, railway lines, and extruded building footprints, with moving fictional pedestrians.
- Add clickable building cards with photographs where explicitly associated, original capture dates, map records, and sources; use bottom sheets on small screens.
- Add contextual fictional resident thoughts and an optional on-device Gemini Nano rephrasing path, with prepared-scenario fallback.

### Evidence and resilience

- Add element-level evidence and source metadata, including regional proxies, time mismatches, reuse conditions, and persistent AI Reconstruction labels.
- Add scene preloading, retention of the current view on image-load failure, place-list fallback, and reduced-motion behavior.
- Add native WebMCP exploration and evidence tools when supported.
- Add content integrity and resident/Nano-adapter checks.

### Known review gaps

- Shared scene assets do not establish annual historical changes.
- Direct Aoji period references and Haksong building footprints remain limited.
- Native Nano inference and a browser without WebGL have not been directly exercised in the recorded review.
