# Changelog

This file records notable product and documentation changes. The pilot has not yet adopted numbered releases.

## Unreleased

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
