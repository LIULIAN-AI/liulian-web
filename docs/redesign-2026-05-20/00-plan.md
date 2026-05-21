# LIULIAN BI canvas — full redesign plan
date: 2026-05-20 · branch: feat/redesign-2026-05-20

## Why redesign

The current `/forecast` ships **2 of 8 canonical panels** specified in
`docs/strategy/PLATFORM_DESIGN.md §4` (only the time-series chart and a KPI
strip; the river-network map, multi-model overlay, correlation matrix,
severity ribbon, scenario panel, station profile peek, and report builder
are all missing). The chat sidebar is bolted on, not integrated. The page
reads as a toy demo, not a production BI surface.

This plan rebuilds it in **five complete iterations**, each producing a
full top-to-bottom design (not partial deltas), then implements the final
in real Next.js code.

## Module inventory — what every iteration MUST contain

Sourced from `PLATFORM_DESIGN.md §4` plus 2026 BI references (Notion 3.4,
Deepnote AI sidebar, Hex Magic, Tableau Pulse pattern):

1. **Scientific running header** — JetBrains Mono, sticky, `LIULIAN · Forecast · ISO date · station / model / entity / seed`. (PD §3.2)
2. **Bento 12×8 grid** on desktop ≥ 1440 px. (PD §4.1)
3. **Station list** with sticky filter, j/k nav, leading UniBe-red dot on active row.
4. **Interactive river-network map** — basemap + topology overlay + station rings. (PD §4.2 Panel 1)
5. **Forecast time-series with Q05–Q95 fan** — observation solid charcoal, mean dashed red, fan tint, threshold markers, dataZoom slider. (Panel 2)
6. **Multi-model overlay** — up to 3 models, fan-color triplet (red / ocean / green), per-model KPI strip, Diff/Pairwise toggle. (Panel 3)
7. **Cross-station correlation matrix** — topology-ordered Spearman heatmap, cell click → scatter. (Panel 4)
8. **Anomaly / alert severity ribbon** — Datadog-lineage; Watch / Elevated / Critical bands across time. (Panel 5)
9. **Scenario / counterfactual panel** — precipitation, temperature, upstream-flow deltas; renders 3rd dashed-grey fan. (Panel 6)
10. **Station profile peek** — slides over chat rail; tabs Hydrograph / Seasonality / Latest forecast / Alert history / Lead-lag. (Panel 7)
11. **Report builder + "Add panel" affordance** — drag/drop; save → `/forecast/r/{slug}`. (Panel 8)
12. **BI agent — scientific notebook (right rail 360 px)** — SSE; trace + tool_call + tool_result inline as method-call typography; no avatar bubbles; suggestions chips; the agent **proposes panels** that user can accept into the canvas. (PD §4.3 + 2026 Deepnote / Notion AI pattern)
13. **Command palette (⌘K)** — primary nav; grouped results; per-row mono shortcut.
14. **Keyboard discipline** — j / k / o / e / ? / / / Esc / b / m / gg / G.
15. **Empty / loading / error states** for every panel — warm-bone shimmer, Fraunces italic empty line, hairline-bordered error card with mono error code.

## Design rules (hard constraints — must hold in every round)

From `PLATFORM_DESIGN.md §2`, `conventions/UI_AUDIT_CHECKLIST.md`:

- **Color strategy**: Committed. UniBe red `#E20613` is the sole spot
  color; max 2 visible per viewport on most pages, max 3 on the alert
  ribbon. Never as button fill. Never as background.
- **Typography**: Fraunces (display) · Switzer (body) · JetBrains Mono
  (numbers, code, running header). Tabular numerals on every metric.
  No Inter / Roboto / Open Sans.
- **Surface**: warm-bone `#FBFBFA` canvas, `#FFFFFF` only for functional
  card faces. Never `#000`, never `#fff` for body.
- **Borders**: 1 px hairline `#EAEAEA`; no resting drop shadows.
  Radius 10 px on cards, 4 px on inputs, 14 px on the canvas envelope.
- **Spacing** varies for rhythm (no monotone padding).
- **Motion**: `transform` + `opacity` only; ease-out-quart curves; no
  bounce.

**Absolute bans** (auto-block per UI_AUDIT §F):

- Side-stripe colored borders > 1 px
- Gradient text (`background-clip: text` over a gradient)
- Glassmorphism as decoration
- Big-number + label + sparkline hero-metric template
- Identical card grids (rows of same-size cards)
- Modal as first thought
- `rounded-full` on cards or primary buttons
- Emojis in markup or copy
- AI-cliché copy (*Elevate*, *Seamless*, *Unleash*, *Next-Gen*, *Game-changer*, *Delve*)
- Em-dashes in user-facing copy
- Placeholder names (John Doe, Acme); use real Swiss-river station codes.

**Distinctive moves** (≥ 1 per page per UI_AUDIT §H):

- Fraunces WONK-1 italic accent `U`
- Scientific running header
- Bento asymmetry (no two adjacent identical cards)
- Editorial 60 / 40 (or table / explainer) asymmetry on at least one band
- Domain-true Easter egg (`流` glyph at first threshold marker — max once)

**The four tests** (UI_AUDIT §I — every round self-runs):

1. AI-slop — would a viewer say "AI made this"? If yes → rework.
2. Category-reflex — could the palette be guessed from "hydrology"
   alone? If yes → rework.
3. liulian-copy — does it look like a liulian screen with text
   swapped? If yes → restyle.
4. gui-demo cross-check — warm-bone canvas + UniBe red as sole spot
   + editorial typography still load-bearing?

## Five rounds — what each lens contributes

Each round produces a **complete** HTML mockup covering all 15 modules. The
*lens* is what changes between rounds:

| Round | Lens / skill applied | What this round tries to maximise | Likely critique going in |
|---|---|---|---|
| **R1** | `minimalist-ui` + `impeccable` shared laws | Faithful execution of PD §4 — all 8 canonical panels + scientific notebook chat — in editorial-Swiss restraint. | "Did we cover the whole brief?" |
| **R2** | `high-end-visual-design` + `gpt-taste` over R1 + AI-slop test | Premium feel: micro-typography, optical-size Fraunces, hairline rhythm, tabular numerals everywhere. Reduce "AI-default" feel. | "Does it look like a $100k design firm shipped it?" |
| **R3** | `industrial-brutalist-ui` lens (Bloomberg Terminal density) | Maximum legible information density. Less whitespace, more sparklines, more inline microcharts, terminal-grade keyboard nav cues. | "If a quant ran this, would she stay 8 hours?" |
| **R4** | `frontend-design` + `research-critic` audit of R1–R3 | Synthesis. Chat as 1st-class actor — agent proposals become *ghost panels* (per 2026 Notion / Deepnote pattern) which users accept. Balance R1 breathing with R3 density. | "Is the agent integrated or bolted on?" |
| **R5** | `redesign-existing-projects` + final polish + accessibility | Production-ready. Resolves the four open Qs from PD §12. Includes a11y, reduced-motion, focus rings. | "Ship?" |

After R5: implement final design in the real `liulian-web/app/forecast/page.tsx`.

## Deliverable schema (each round)

```
docs/strategy/redesign-2026-05-20/
├── 00-plan.md                       (this file)
├── tokens.css                       (shared OKLCH tokens — written once, used by all rounds)
├── data.json                        (sample forecast/station/alert data — consistent across rounds)
├── round-1.html                     (complete mockup)
├── round-1.png                      (Playwright render)
├── round-1-notes.md                 (rationale + self-critique against the 4 tests)
├── round-2.{html,png,md}
├── round-3.{html,png,md}
├── round-4.{html,png,md}
├── round-5.{html,png,md}            (final)
└── SPEC.md                          (final design spec doc, per superpowers:brainstorming gate)
```

## Validation gates per round

Before declaring a round done:

- [ ] All 15 modules visible / covered in the layout
- [ ] Color strategy declared at top of HTML in a `<!--` comment
- [ ] UniBe red occurrence count ≤ 2 per viewport (≤ 3 on ribbon)
- [ ] Fraunces / Switzer / JetBrains Mono only (grep for Inter/Roboto)
- [ ] No banned patterns: no `rounded-full` on cards, no gradient-text,
      no glassmorphism, no emojis in copy, no em-dashes in user strings,
      no placeholder names
- [ ] ≥ 1 distinctive move declared in `round-N-notes.md` (which one)
- [ ] AI-slop self-test answered in writing (does this look AI-generic?)
- [ ] At least one explicit hand-off to the next round in `round-N-notes.md`
      (what R(N+1) should attack)

## Reference platforms re-affirmed for this redesign

From `REFERENCE_DESIGNS.md` (most relevant for the BI canvas):

- **FineBI** management cockpit layout (map+KPI+trend in one view) — informs the bento.
- **Power BI custom visual (lucazav)** — canonical forecast-with-intervals encoding.
- **Tremor** — KPI cards + Bar Lists + Tracker primitives (rebuilt with our tokens).
- **HydroForecast** — probabilistic, grounded-in-science register.
- **k-dense.ai** — three-verb hero rhythm; real scientific visualisations as proof.
- **Datadog** — severity-ribbon UX (only).
- **Linear** — command palette as primary nav.
- **Müller-Brockmann / Tufte** — grid + ink-data ratio.
- **gui-demo iteration 2** — the canonical realised LIULIAN brand.

From 2026 web research:

- **Notion 3.4 / Deepnote AI sidebar** — agent **explains its plan**, **proposes edits**, summarises output reviewably (not auto-applies). Agent as sibling-tab not modal-on-top.
- **Hex Magic / Tableau Pulse / Mode AI** — natural-language → SQL + chart + narrative + anomaly schedule.

## Out of scope (this redesign)

- Map tile attribution wiring (we mock the basemap as styled SVG).
- The full studio `/studio/{data,train,inference,insight}` redesign — `/forecast` only.
- Mobile (`liulian-mobile`) variants — separate redesign.
- Marketing landing.
- Dark mode (rejected per PD §12).

## Success criteria for the whole exercise

When R5 ships and is implemented:

1. A first-time viewer says "this looks like a real product, not a demo".
2. UI_AUDIT_CHECKLIST 46 items pass without exceptions.
3. The 4 tests (AI-slop / category-reflex / liulian-copy / gui-demo) all pass.
4. The BI agent IS the canvas, not a sidekick (it proposes, user accepts panels).
5. A quant would stay 8 hours on this page.

## Sources

- `docs/strategy/PLATFORM_DESIGN.md` (the spec — fully re-read 2026-05-20)
- `docs/strategy/PLATFORM_BLUEPRINT.md`
- `docs/strategy/REFERENCE_DESIGNS.md` (12-platform audit)
- `docs/strategy/NEOBANKER_REUSE_MAP.md` (chat = `@ant-design/x` + `react-markdown`)
- `docs/strategy/conventions/UI_AUDIT_CHECKLIST.md`
- `docs/strategy/adr/0001…0011.md`
- Web research 2026-05-20: [Notion 3.4 (Mar 26)](https://www.notion.com/releases/2026-03-26), [Deepnote AI tools 2026](https://deepnote.com/blog/ai-data-visualization-tools), [Databricks AI/BI](https://docs.databricks.com/aws/en/ai-bi/release-notes/2026), [Hex](https://hex.tech/), [Future AI dashboards 2026](https://futureagi.com/blog/ai-for-creating-dashboards/).
