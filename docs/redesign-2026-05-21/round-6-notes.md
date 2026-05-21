# Round 6 — Real-data dashboard layer

Date: 2026-05-21 · file: `round-6.html` · screenshot: `round-6.png`

## What changed from R5

1. **Real-data backbone everywhere.** Numbers, station IDs (2091, 2009,
   2016…), units (°C), date range (1990-01-01→2020-12-31) all match the
   actual swiss-1990 CSV. The narrative band reads station 2091 at
   5.83 °C with a −2.1 °C 7-day delta — no synthetic 408 m³/s anymore.
2. **#table panel (new).** Left half of bento now holds a sortable
   editable data table — date / wt °C / at °C / delta / flag, 60 rows
   visible. Two rows highlighted as "edited" (yellow-green tint); the
   last day is a "draft" (italic) showing today's pending value.
   Toolbar: + row · delete · filter · sort · export csv. The `→ syncs
   to #fan` chip in the header signals live binding to the hero chart.
3. **#picker strip (new).** Above the hero fan, a row of chart-type
   tiles — fan (active) · line · area · bar · scatter · table · heatmap
   · multi-model · map. Each tile has a 54×18 SVG glyph and a 9-px
   mono label. The "library / liulian-only" distinction is encoded by
   tile bg: warm-canvas for stock chart types, neutral for liulian
   specials.
4. **Stations rail uses real IDs.** 14 rows visible (sorted by station
   number); active row = 2091 with green `●` real-data dot. Footer
   credits the CSV path + field + date range.
5. **Schema strip in #table header.** Shows the four columns and their
   dtypes (`date · f32 °C · f32 °C · f32 · bool`) — a Power-BI-style
   data type annotation row separating header from rows.
6. **`real CSV` badge in run-header.** Green pill confirms the canvas
   is reading actual data, not synthetic. Removes ambiguity for
   reviewers.
7. **Map redrawn with 28 station dots** matching the actual count.
   2091 sits where the Aare passes Bern.

## UI_AUDIT compliance

| Item | Status |
|---|---|
| 1 px hairlines / no side-stripe | ✅ |
| No gradient text | ✅ |
| No glassmorphism | ✅ |
| No hero-metric template (KPI = table) | ✅ |
| No identical card grids | ✅ |
| No rounded-full on cards | ✅ (only on agent suggestion chips, which is correct usage) |
| No emojis | ✅ |
| No em-dash in user copy | ✅ |
| ≤ 2 reds per viewport | ✅ active row + fan mean = 2 (real-data badge is green) |
| Mono for numbers / data / keys | ✅ — `tnum` + JetBrains Mono on every data cell |
| Distinctive moves | ✅ WONK-italic U + 流 (once) + Fraunces hero + chart picker tiles + editable cells |

## Four tests

| Test | Pass | Note |
|---|---|---|
| AI-slop | ✅ | Editable table + picker tiles + real CSV credit ≠ any default SaaS template |
| Category-reflex | ✅ | Warm canvas + UniBe red + Fraunces ≠ "Power BI purple" / "Tableau orange" / "dark Looker" |
| liulian-copy | ✅ | Specific to this brand: WONK-U / 流 / picker grouping of liulian-only chart types |
| cross-check vs R5 | ✅ | All R5 modules preserved; new modules additive |

## Handoff to R7 — twin-track chart editing

R7 attacks (every chart gets):

1. **Spec drawer (`</>` icon).** Slide-over panel from the right edge
   with 3 tabs:
   - **JSON spec** (LiulianChartSpec, monaco-lite textarea, editable)
   - **Python snippet** (read-only; auto-generated from the spec)
   - **API URL** (read-only; `curl` example + JSON sample)
2. **Vector canvas (`⌗` icon).** Click → modal hosting an iframe
   (`https://embed.diagrams.net/?embed=1&proto=json`) preloaded with
   the chart's rendered SVG XML. User can nudge nodes / change colors /
   add annotations. On save, postMessage round-trips back into the
   chart spec's `annotations` list.
3. **Chat re-style ops.** The agent rail accepts commands like
   `re-colour #fan to ocean palette`, `change #fan type to bar`,
   `annotate #fan at 2020-12-15 "cold snap"`, `swap x and y on #scn`,
   and emits `panel_proposal` events that update the spec live.
4. **Edit toolbar above every chart.** Tiny right-aligned strip:
   `[<code/>] [⌗] [palette] [download SVG]` — single-click affordances.
5. **Annotation overlay on #fan.** A "cold snap" annotation at week
   49 (Dec 12) rendered as a 流-styled marginalia, the result of
   either the drawio canvas or the agent ops.

R7 should not introduce new panels — only new editing affordances on
the existing ones. Density target = same as R6 (no further compression).
