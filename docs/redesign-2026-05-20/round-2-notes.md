# Round 2 — notes

**Lens**: high-end-visual-design + gpt-taste applied to R1. Same 15 modules.

## What changed from R1

1. **Narrative band** (between header and bento) — a single Fraunces 25 px italic-friendly editorial sentence ("Eight stations live …") plus a tight tabular pulse strip (Stations · Watch · Elev/Crit · Models active). Matches the 2026 Tableau-Pulse / Hex-Magic "narrative summary on the canvas" pattern.
2. **Fan chart as visual hero** — dedicated title row above the tab bar carrying Fraunces 34 px `aare-bern` + italic subtitle + right-aligned coords; panel border darkened to `--ink` so it reads as the primary surface.
3. **Map: real rivers** — Aare (Brienzersee → Thun → Bern → Hagneck) and Rhine (Bodensee → Basel → Rheinfelden) drawn as flowing blue paths above the basemap; canton hints as soft dashed traces; north arrow added. The map is no longer a featureless blob.
4. **Watch state surfaced in map** — `rhine-rheinfelden` carries a pastel-yellow ring + "watch" label. That signal previously lived only in the ribbon.
5. **Stations rail: data-rich** — every station shows current value (tabular nums) + 24 h delta; the watching station has a yellow "+3.6 watch" indicator.
6. **Micro-typography** — `font-feature-settings: "ss01" 1, "cv11" 1` on Switzer body; `font-variation-settings: "opsz" 56` on Fraunces hero, "opsz" 24 on running italics. KPI font bumped to 26 px tabular.
7. **流 easter egg** — small Fraunces italic glyph appears near the Q95 fan ceiling close to the elevated threshold, opacity 0.42. Used at most once per page.

## UI_AUDIT compliance check

| Rule | R2 status |
|---|---|
| A. originality + bilingual | ✓ original surface; en (zh keying as future i18n) |
| B. OKLCH neutrals tinted to brand hue | ✓ canvas/warmer/deep all warm tints |
| B. UniBe red only on (a) brand, (b) status, (c) destructive | ✓ active station + threshold marker + 流 + watch (yellow not red) + critical sliver — 4 reds in viewport, one over budget |
| C. fonts Fraunces/Switzer/JBM only | ✓ |
| C. tabular numerals on metrics | ✓ KPI, stations rail, correlation cells |
| D. spacing varies for rhythm | ✓ map larger than KPIs |
| D. no nested cards | ✓ |
| D. hairline borders only | ✓ |
| E. transform + opacity only | ✓ (only one decorative anim left, on the chart marker; can be removed in R3) |
| F. side-stripe accent > 1 px | ✓ none |
| F. gradient text | ✓ none |
| F. glassmorphism | ✓ none |
| F. hero-metric template | ✓ KPI cards are 4-up, deltas inline; no big-number/ring-spark template |
| F. identical card grids | ✓ panels vary in size |
| F. modal as first thought | ✓ peek is the in-rail pattern |
| F. rounded-full on cards | ✓ none |
| F. emojis | ✓ none |
| F. AI-cliché copy | ✓ none |
| **F. em-dash in user copy** | **✓ FIXED** — replaced `elevated — but` with `elevated; but` after R2 self-audit |
| F. placeholder names | ✓ real Swiss-river codes |
| G. canvas / ink / hairline tokens load-bearing | ✓ |
| G. ≤ 2 reds per viewport on most pages | ⚠ 3 visible at this viewport; over budget by 1. R3 to trim. |
| H. distinctive moves | ✓ WONK-italic U, running header, editorial narrative band, Fraunces opsz hero, bento asymmetry, 流 easter egg (one) |

## Self-test (UI_AUDIT §I)

- **AI-slop** — Pass. The editorial narrative band reads like a paragraph in a research brief, not a SaaS dashboard. Mono captions, scientific notebook chat, Fraunces hero, Aare river path on the map — these aren't AI defaults.
- **Category-reflex** — Pass. Hydrology default = blue. We have warm-bone + UniBe red anchor, blue used sparingly only on the river paths and lakes themselves (where blue actually means water).
- **liulian-copy** — Pass. No bank UI residue.
- **gui-demo cross-check** — Pass. Warm-bone canvas, UniBe red as sole spot color (with one yellow watch ring as a separate severity signal), Fraunces / Switzer / JBM stack load-bearing.

## What R3 should attack (Bloomberg-Terminal density lens)

1. **Density** — R2 still breathes. R3 should target 1.5× more information per pixel: smaller font sizes (12 / 11 / 9), tighter spacing (10 px gap), more inline microcharts per row.
2. **Tables instead of cards where appropriate** — the stations rail becomes a denser tabular surface; the KPI strip becomes a single multi-metric table with sparkline columns.
3. **More panels visible at once** — show the multi-model overlay AS a real panel (not just a tab), put profile sparkbar mini-cards visible, surface scenario form as a tight sidecar.
4. **Trim red count** to ≤ 2 per viewport (no animated decorative red marker; the 流 easter egg becomes hover-only).
5. **Terminal-style keyboard cues** — every actionable surface shows its key (`b` `m` `c` `:`).

## File

- HTML `round-2.html` · PNG `round-2.png` (1440 × 980 viewport)
- Served via `http://localhost:8930/round-2.html`
