# Validation

## What has been checked

The dated [review record](../content/qa.md) is the record of performed checks. It distinguishes desktop/mobile-sized browser review, native WebMCP navigation, intentional asset/geometry failures, and explicit gaps. It is not proof of historical authenticity or universal device support.

The currently recorded review includes:

- The complete apartment exploration path, all twelve prepared scene links, reverse navigation, refresh, browser history, and malformed-link recovery.
- Map/street zoom transitions and restoring the street camera when reselecting a place.
- Direct building selection, changing selected buildings while the map remains interactive, correct photo association, gallery production labels, and image-specific evidence.
- Direct person selection without also selecting the building underneath, pause/resume, and contextual fictional thought display.
- Desktop and mobile-sized viewport layouts, including the right/bottom information panels and visible reconstruction labels.
- Image-load failure retaining the current scene, and geometry-load failure retaining place-list exploration.
- TypeScript checking and the Worker-compatible build.

Mobile-sized viewport review is responsive-layout testing; it is not a complete physical-touch-device test.

## Automated checks

```sh
npx tsc --noEmit
node scripts/check-content.mjs
node scripts/check-residents.mjs
npm run build
```

| Check | Coverage | Limit |
| --- | --- | --- |
| TypeScript | Component and data contracts | Does not prove runtime/device behavior |
| Content integrity | Six places, twelve scenes, source IDs, independent-corroboration policy, graph, assets, 60 year/scene URL round trips, invalid URLs, rights records, road interpolation | Does not verify each historical claim against its source |
| Resident checks | 720 place/year/person contexts, retained source dates, explicit building-photo association, Nano API contract/progress, rejected output, cancellation, cleanup | Uses a test double for Nano; it is not native inference |
| Build | Client and Worker-compatible production output | A passing build is not a successful hosted deployment |

These are executable consistency checks, not a replacement for editorial review. When the approved content scope changes, adjust the expected counts with the content itself.

## Manual acceptance checklist

Use this for affected product changes. Record the environment, actual result, date, and unresolved issues; do not mark an item passed based only on implementation intent.

### Navigation and detail

- [ ] Start at the country map and enter each region.
- [ ] Select each of the three places in each region; follow its complete scene path and return.
- [ ] Cross the street-mode threshold in both directions; reselect the same place.
- [ ] Reload a selected year/place/scene and use browser back/forward.
- [ ] Try unknown IDs and out-of-range years; verify a usable normalized view.
- [ ] Zoom/pan images without distortion or detail beyond available native resolution.
- [ ] Confirm hotspots remain attached to the correct image location through zoom/pan.

### Information and evidence

- [ ] Click a building directly and inspect its source, map date, height qualification, and photo status.
- [ ] Change building selection while its panel is open; confirm the card and highlight update.
- [ ] An unrelated building must not inherit a nearby photograph.
- [ ] Switch gallery image and open evidence; confirm it describes that image.
- [ ] Click a pedestrian directly; confirm only the person inspector opens.
- [ ] Confirm all prepared/generated thought and image labels stay visible.
- [ ] Confirm source dates, proxy locations, temporal mismatches, attribution, and original links.
- [ ] Confirm no arbitrary confidence percentages or duplicated independent evidence claims.

### Device behavior and resilience

- [ ] Review a desktop, a narrow browser, and a physical touch device where available.
- [ ] Use keyboard focus, activation, Escape, and image-detail controls.
- [ ] Enable reduced motion; confirm still pedestrians and immediate camera changes.
- [ ] Exercise a browser without WebGL; enter scenes through the place list.
- [ ] Simulate a target-image failure; retain the current scene and URL.
- [ ] Simulate unavailable geometry/map tiles; keep navigation and source information usable.
- [ ] Confirm source controls and attribution are not covered by other panels.

### Native Nano

- [ ] Use supported desktop Chrome; record browser/device details and runtime availability.
- [ ] Complete a successful generated thought with the AI Reconstruction label retained.
- [ ] Exercise first-use download progress and cancel during preparation or generation.
- [ ] Change person, place, or year while a request is pending; reject stale completion.
- [ ] Keep the prepared thought on failure, unsupported device, or unusable output.
- [ ] Review output for altered meaning or unsupported details; structural validation alone is insufficient.

## Outstanding checks and evidence gaps

Native Nano generation was not exercised on a supported physical Chrome device in the recorded review. A no-WebGL browser was not available for direct testing. Complete physical-touch interaction review is still needed.

Editorial gaps include sparse Haksong footprints, limited direct Aoji period photography, unknown historical heights/uses/interiors, shared annual scene assets, and missing exact delegated generation prompts. These must remain visible limitations, not unchecked acceptance items silently converted to completed work.

## Documentation-only changes

Check relative links, referenced files/commands, English terminology, and consistency with implementation. Confirm repository snapshots contain ordinary application files rather than a gitlink. Reuse successful application checks when source behavior, assets, dependencies, and build inputs are unchanged; a documentation commit does not require another live deployment.
