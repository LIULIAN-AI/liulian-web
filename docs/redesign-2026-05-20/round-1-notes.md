# Round 1 — notes

**Lens**: minimalist-ui + impeccable shared design laws. Faithful PD §4 coverage.

## Module coverage

| # | Module | Status |
|---|---|---|
| 1 | Scientific running header | ✓ sticky JBM, live dot, palette + agent + map + help kbd hints |
| 2 | Bento 12×8 grid | ✓ visible asymmetry: map (7c) + fan (5c) + KPI strip (8c) + alerts mini (4c) + correlation (6c) + severity (6c) + add-panel band |
| 3 | Stations list | ✓ 8 stations, J/K nav hint, active red dot + sparkline on aare-bern |
| 4 | River-network map | ✓ SVG mock with 8 nodes, topology edges thickness ∝ discharge, lakes, active red ring |
| 5 | Forecast time-series fan | ✓ obs solid charcoal + dashed red mean + Q05-Q95 tint + threshold dotted line + pulsing marker + dataZoom slider |
| 6 | Multi-model overlay | ◐ tab present (Compare ·3), full panel deferred — will inflate in R3 density round |
| 7 | Correlation matrix | ✓ 8×8 Spearman heatmap, topology-ordered, diagonal differentiated |
| 8 | Severity ribbon | ✓ 3 rules across 24 h with watch/elev/crit segments, plus mini-ribbon in row 5 |
| 9 | Scenario / counterfactual | ◐ tab present, panel form deferred to R2 |
| 10 | Station profile peek | ◐ referenced by `o` keyboard hint, slide-out behavior deferred (interaction not static) |
| 11 | Report builder / Add-panel | ✓ dashed add-panel band with chip suggestions |
| 12 | BI agent notebook | ✓ scientific notebook: trace → tool calls → answer with footnote refs + proposed-panel chip user can accept |
| 13 | Cmdk palette hint | ✓ ⌘K in header |
| 14 | Keyboard discipline | ✓ b / m / o / ? / / surfaced |
| 15 | Empty / loading / error | ◐ implicit ("ask in plain English" prompt is the empty state); explicit shimmer / error variants deferred |

## Self-test against UI_AUDIT §I (the four tests)

- **AI-slop** — does it look AI-generic? **Pass**. The running header, mono captions, scientific notebook, hairline rhythm and Swiss-river map are bespoke; no gradient bling, no glassmorphism, no big-number/sparkline-ring template.
- **Category-reflex** — could palette be guessed from "hydrology"? **Pass**. Default would be blue-on-white; we use warm-bone + UniBe red.
- **liulian-copy** — looks like a liulian neo-banker screen? **Pass**. No bank-domain UI, the IA is forecast / station / alert.
- **gui-demo cross-check** — warm-bone canvas + UniBe red sole spot + editorial typography? **Pass**. Red present only on active station, threshold marker, severity-elevated/critical, accepted-proposal CTA — within the "≤ 2 visible per viewport (≤ 3 on alert ribbon)" rule when counted per scroll position.

## What works

- Bento has real asymmetry (no row of identical cards).
- Agent as scientific notebook with proposed-panel pattern (the 2026 Notion / Deepnote convention) — feels load-bearing, not bolted on.
- Running header carries real working state and the keyboard hint set.
- Map + correlation + severity together signal "BI tool" not "one chart with sidebars".

## What R2 should attack (handed off)

1. **Visual hierarchy** — every panel has the same border weight; the fan chart should be the page hero, with a Fraunces 28-36 px station title above it. Right now panel headers are all uniform JBM captions.
2. **Map detail** — the basemap is a featureless blob. Add Aare + Rhine river paths as flowing curves so the topology is grounded in actual geography. Cantons hinted with dashed lines.
3. **Micro-typography** — turn on Fraunces `opsz` so the panel hero size uses display-cut, body uses text-cut. Switzer `ss01` / `cv11` for character disambiguation. Tabular numerals stay everywhere they already are.
4. **Density rhythm** — KPI strip is roomy; correlation matrix is roomy; map is loose; fan chart is fine. R2 tightens the supporting panels and gives the hero more breathing room (Tufte ink-data ratio).
5. **One-line narrative** — top of the canvas could carry a single editorial sentence summarising the page state ("8 stations live · 1 watch · 0 elevated, but `rhine-rheinfelden` Q95 trends toward the 850 m³/s mark over the next 72 h."). This is the 2026 BI default (Tableau Pulse / Hex Magic) and currently absent.
6. **Red count audit** — currently visible reds: active station (1) + threshold dotted line + animated marker (2) + severity-critical sliver (3) + agent proposal chip (4). On the threshold of "≤ 3 on alert ribbon" rule. R2 should tighten to 3.

## File

- HTML: `round-1.html`
- PNG: `round-1.png` (1440 × 980, viewport screenshot)
- Server: `python3 -m http.server 8930` from `redesign-2026-05-20/` → `http://localhost:8930/round-1.html`
