# Documentary map layers

NORTH adds public geographical context through six optional themes and fourteen area references. These entries complement the eight deep exploration places; they do not create additional street reconstructions. The first review was started on 11 October and completed on 12 October 2026 against original publishers and coordinate records.

## Included references

| Theme | Area references | Main evidence |
| --- | --- | --- |
| Nuclear sites | Yongbyon, Punggye-ri | IAEA's 2019 remote-monitoring report, CTBTO's 2017 seismic record, 38 North's location archive and 2018 demolition review |
| Space launch | Sohae | 38 North's assessment of imagery through 27 September 2018 |
| Ports & rail | Nampo, Rajin, Sinuiju, Tumangang | 38 North's April 2019 study of selected 2016–2019 observations |
| Heritage | Kaesong historic city | UNESCO World Heritage inscription in 2013 |
| Nature | Mount Paektu and Mount Kumgang reserves | UNESCO MAB nomination records, dated 1989 and 2018 respectively |
| Markets & life | Tongil Street market area, Kwangbok neighborhood, Puhung metro area, Aoji coal area | First-person 2017 retail account, 2019 metro guide and existing gazetteer, terminology, map and photographs |

Nuclear research, underground testing and space launch are distinct contexts. A facility marker does not establish assembled warheads, inventory, storage or deployment. The dataset does not report current operational readiness. The [IAEA report](https://www.iaea.org/sites/default/files/gc/gc63-20.pdf) explicitly describes limitations resulting from absent on-site access. The [CTBTO record](https://www.ctbto.org/our-work/detecting-nuclear-tests/2017-dprk-nuclear-test) describes seismic evidence and its separate uncertainty; the marker is not a surveyed tunnel location.

## Interaction

Choose **Map layers** from the exploration dock, toggle a theme, and select a pin or list entry. The map focuses its area reference and a source sheet opens at the right on desktop or at the bottom on mobile. Reference zoom is capped at 14, keeping it below the street-simulation threshold. The list collapses when selecting an entry so the marker remains visible. Reopen Map layers to change selection or filters. The list operates independently of MapLibre, providing access to the same records when the map cannot render.

Year selection retains the original dates. The sheet shows the latest record at or before the selected year, with a statement that it does not establish activity throughout that year. History distinguishes **Earlier record**, **In selected year**, and **Later than selected year**. A 2019 assessment remains readable in 2015 without becoming a 2015 observation. A published retrospective account keeps unknown visit dates unknown, and publication events are named explicitly. A designation recorded only by year retains that precision; no month or day is invented. No record means an explicit gap.

Aoji and Kwangbok offer **Explore its street**, connecting to their already reviewed life reconstructions. The other reference entries have source sheets and map context only. Source imagery is not converted into new facility buildings, interiors or fictional operational scenes.

## Locations and reuse

Coordinates are rounded to two decimal degrees and labeled approximate area references. Nampo, Rajin, Sinuiju and Kaesong use city/district references; Tumangang uses a station-area reference. They are not surveyed quay, bridge or protected-property boundaries. The UNESCO nature coordinates describe reserve references, not summits. Tongil is a street-area market-context reference, not a surveyed market pin. The current OSM road record uses Rangrang Street and retains Tongil as its old name; the period label is preserved. Puhung is a rounded station-area reference without underground geometry. OSM mapping retrieved in October 2026 is explicitly contemporary, separate from period observations. No runtime geocoder is used.

Original reports and photographs are linked. Public readability does not authorize downloading, modifying or redistributing their imagery. This addition copies no third-party satellite pixels or photographs. OSM-derived location data retains ODbL attribution. Sources already reviewed for the life scenes keep their existing rights and temporal limitations.

## Content contract

- `content/map-reference-review.json` contains review policy, original `Source` records and fourteen `AtlasFeature` records. Existing life-source IDs resolve through `lib/content.ts`.
- A feature defines its ID, theme, rounded coordinate, spatial sources, marker purpose, summary, limitations, chronological dated events and optional existing street entry.
- An event retains its date precision, original source IDs and evidence level. The UI uses **Documented record** for directly documented events and **Published assessment** for interpretation. This describes the evidence, not an AI-generated image.
- `lib/atlas.ts` supplies canonical theme order, source resolution and selected-year helpers.
- `public/credits/map-references.json` is an exact downloadable mirror; each source sheet links it. Associated older life-source metadata is also included in the sheet and WebMCP response.
- `feature` selects a reference and excludes the region/place/scene/scenario context. `layers` is a comma-separated list of theme IDs. An absent parameter enables all themes; an empty parameter enables none. Selecting a reference enables its theme. Hiding its theme clears the selected reference.

Example on GitHub Pages:

```text
/north/?year=2019&feature=yongbyon
/north/?year=2018&layers=transport,nature
/north/?year=2018&layers=
```

## Adding a reference

Review the original source and coordinate basis before adding a marker. Record original author/publisher, observation or coverage date, publication, location, rights and limitations. Keep unknown dates unknown. Do not turn a publication date into a capture date or repeat the same original material as independent corroboration. Keep precise facilities separate from area-level references; require additional review before changing that scope.

Add the feature and dated events, then update the public JSON mirror. An optional street link must name an existing reviewed place. Run `node scripts/check-atlas.mjs`, TypeScript and the affected production build. Review the pin, source sheet, history, mobile layout, keyboard dismissal, refresh/history and failed-map list access. Record actual checks in [the review log](../content/qa.md).

The atlas check enforces fourteen current entries, six themes, source metadata, chronological records, coordinate precision, valid entry links, exact public mirroring, a 40 KB dataset budget and 280 feature/year/filter URL round trips. Counts should change alongside an approved content expansion. No new model/image downloads, generation server or database are required.

## Remaining coverage

Markets and urban life, nature and heritage appear first in the theme/list order. The first dataset is intentionally selective. It lacks complete annual observations, exact protected-property boundaries, live cargo/traffic data and many local life references. Further useful coverage includes additional markets, public transport routes, power/water infrastructure, schools, hospitals and protected landscapes after their sources and reuse conditions are reviewed. These are editorial candidates, not implemented or verified entries.
