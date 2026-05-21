# Round 7 — Twin-track chart editing

Date: 2026-05-21 · file: `round-7.html` · screenshot: `round-7.png`

## What changed from R6

1. **Edit toolbar on every chart header.** Tiny right-aligned strip:
   `[</>] [⌗] [●●] [↓]`. Click `</>` opens the spec drawer; `⌗` opens
   the vector canvas modal; `●●` opens an inline palette; `↓` downloads
   the rendered SVG.
2. **Spec drawer (slide-over from hero fan).** 340 px wide. Three tabs:
   **JSON spec** (active by default, shows a LiulianChartSpec — id,
   chart_type, dataset_ref, encoding, style, annotations, forecast) ·
   **Python** (auto-generated `liulian.plot.fan(...)` call, read-only) ·
   **API URL** (`curl` example + JSON sample). Footer: `apply / revert
   / copy`. This is the **code-track** the user asked for — "I should
   always be able to see what code/script the chart is".
3. **Vector canvas modal (drawio embed).** Fixed overlay 1080×680.
   Header: `vector canvas · #map · station-network · embed.diagrams.net`
   + `[discard] [save → chart spec] [×]`. 3-column body:
   - Left: shape palette (station node · flow edge · basin polygon ·
     legend box · hairline rule), 6-swatch colour row, align tools
   - Centre: dotted-grid canvas with the map, station 2091 selected
     with handles + dashed selection rectangle, a new "cold-front
     origin" annotation chip linking to another node
   - Right: selected-object inspector (`x: 285 / y: 225 / r: 6 /
     fill: #E20613 / label: 2091`) + round-trip protocol caption
     (`postMessage{action:'save', xml:<mxGraphModel>…} → host
     serialises into LiulianChartSpec.annotations`)
4. **Annotation chip on the hero fan.** Above the chart's mean line:
   *cold-front · −2.1 °C in 7 d · agent added* — a dashed-border pill
   that the agent added in response to the chat re-style request.
5. **Chat re-style answer.** Agent rail now shows a real re-style
   exchange: "annotate the cold snap on #fan and re-colour to ocean
   palette" → agent applies the annotation, declines the recolour with
   a brand-contract reason, applies the ocean overlay to **#mm**
   instead, and points the user to the spec drawer to persist.
6. **Pinned chips reflect editing context.** `#fan spec open`, `#map
   canvas` chips replace the static "3 models" / "4 stations" — so the
   user knows what surfaces are alive.

## Drawio embed protocol (per R7 mockup)

The actual implementation would use:

```
https://embed.diagrams.net/?embed=1&proto=json&libraries=1&configure=1
```

inside an iframe. Communication via `window.postMessage`:

```
host → embed   { action: 'load', xml: '<mxGraphModel>…</mxGraphModel>' }
embed → host   { event: 'init' } | { event: 'save', xml: '…' } | { event: 'exit' }
```

Host serialises the chart's rendered SVG to an `mxGraphModel` on open,
deserialises the saved XML back to `LiulianChartSpec.annotations` on
save. (Spec doc in R8 locks the protocol.)

## UI_AUDIT compliance

| Item | Status |
|---|---|
| 1 px hairlines / no side-stripe | ✅ |
| No gradient text | ✅ |
| No glassmorphism | ✅ (modal scrim is solid translucent ink, not blurred) |
| No hero-metric template | ✅ |
| No identical card grids | ✅ |
| No rounded-full on chart panels | ✅ |
| No emojis | ✅ (the `●●` `⌗` `</>` glyphs are typographic, not emoji) |
| No em-dash in user copy | ✅ |
| ≤ 2 reds per viewport | ✅ active station + fan mean = 2; modal selection is ocean blue |
| Mono for numbers / code / keys | ✅ |
| Distinctive moves | ✅ WONK-U + 流 (still once on the fan) + Fraunces annotation chip + drawio canvas embed |

## Four tests

| Test | Pass | Note |
|---|---|---|
| AI-slop | ✅ | Drawio canvas + spec drawer with LiulianChartSpec ≠ any default editor template |
| Category-reflex | ✅ | Not "Figma colored sidebar", not "Power BI ribbon", not "Tableau side panel" |
| liulian-copy | ✅ | The combination — spec drawer + drawio embed + chat re-style with brand-contract pushback — is uniquely ours |
| cross-check vs R5/R6 | ✅ | R5 modules + R6 dashboard layer intact; new affordances additive |

## Handoff to R8 — synthesis + lock

R8 attacks:

1. **Save / Load dashboards.** Each user can persist a canvas
   layout — which panels, sizes, spec versions. Endpoint sketch:
   `POST /dashboards` → returns id; `GET /dashboards/{id}` returns
   the full spec tree (a list of LiulianChartSpec + layout).
2. **A11y pass on the new surfaces.** Spec drawer needs `role="region"`,
   `aria-labelledby`. Drawio modal needs `role="dialog"`, focus trap,
   esc-to-close. Edit toolbar buttons need `aria-label`.
3. **Empty + error states.** Drawio modal that fails to load (offline)
   → fallback to "edit annotations in JSON" with a link to the spec
   drawer. Spec drawer with no chart selected → empty-state copy. KPI
   table with no observations → "no data in this window".
4. **Spec lock doc.** `docs/superpowers/specs/2026-05-21-forecast-dashboard-design.md`
   covering: information architecture · LiulianChartSpec schema · panel-id
   contract update · agent re-style command grammar · drawio embed message
   protocol · keyboard map · save-load endpoints · a11y · implementation
   file map.
5. **Trim a single visual loss from R7.** The annotation chip on the
   hero fan currently sits at 30% from top; with the spec drawer open
   the chart area is narrower, so the chip may collide with the drawer
   edge. R8 confines the annotation layer to the chart-area bounds.
