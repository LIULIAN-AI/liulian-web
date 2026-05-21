# Round 4 — Synthesis + chat-as-first-class actor

Date: 2026-05-20
File: `round-4.html` · screenshot `round-4.png`

R4 keeps R3's information density and R2's editorial polish, and promotes the
agent from "sidebar that streams text" to an actor that proposes structural
changes to the canvas.

## What changed from R3

1. **Ghost-panel proposal** — a new dashed-border panel rendered inline on the
   bento (cols 1-7 below the strip). It mocks "cohort by basin" with four
   horizontal bars (current / multi-year peak). The agent's answer proposes
   this panel; the user sees exactly where it would land before accepting.
2. **Pinned-panel chips** — agent rail head shows three chips: `#fan aare-bern`,
   `#sev 3 rules`, `#peek 4 stations`. This is the agent's "alive context" —
   what it actually has access to right now.
3. **Footnote click-through** — answer footnotes (¹²³⁴) link to panel ids
   (`#peek rhine-rheinfelden`, etc.). Each footnote becomes a navigation
   affordance, not just a citation.
4. **Trace collapsed to one line by default** — `intent → station_risk_query
   · 4 tool calls · 1.8 s` with "expand →" hint. The notebook used to consume
   half the rail with per-step tool calls; now they're hidden until needed.
5. **Counterfactual fan overlaid in hero** — scenario panel now publishes its
   Δ to `#fan`. The hero shows two fans (baseline tinted, Δ dashed grey) plus
   a dotted grey mean line. Legend adds two new swatches.
6. **Scenario diff readout** — sidecar gains a footer row: "Δ vs baseline:
   mean +19.4 m³/s @+72h · Q95 ceiling +47 m³/s · elev cross no". The
   counterfactual is no longer mute.
7. **Asymmetric density** — severity ribbon gains 2 px of breath; correlation
   stays dense; KPI table stays dense; profile cards stay generous. Density
   is now a property of each panel, not the canvas.
8. **Panel-id chips on every header right edge** — `#fan`, `#mm`, `#kpi`,
   `#scn`, `#corr`, `#sev`, `#peek`, `#cohort` are visible mono labels.
   This makes the agent's references legible and clickable.
9. **API fix landed in parallel** — `liulian-api/.../forecasts.py` no longer
   hardcodes `now = 2026-05-12 14:38`. `forecast_at` now follows real wall
   clock (snapped to the hour), so the canvas timestamp `2026-05-20·17:00 UTC`
   in the run-header is genuine, not a placeholder.

## UI_AUDIT compliance

| Item | Status |
|---|---|
| 1 px hairlines / no side-stripe | ✅ |
| No gradient text | ✅ |
| No glassmorphism | ✅ |
| No hero-metric template | ✅ KPI remains a table |
| No identical card grids | ✅ |
| No rounded-full on cards | ✅ |
| No emojis | ✅ |
| No em-dash in user copy | ✅ narrative band keeps `;` |
| ≤ 2 reds per viewport | ✅ active-row + fan-mean = 2 (ghost panel is hatched grey, scenario Δ is dotted grey, agent persona keeps a single small italic-red mark, watch state is yellow) |
| Mono for numbers/code/keys | ✅ |
| Distinctive moves present | ✅ WONK-U + 流 + ghost panel + alive chips |

## Four tests

| Test | Pass? | Note |
|---|---|---|
| AI-slop | ✅ No | Ghost-panel proposal + alive-pin chips + footnote-as-panel-id are not in any common SaaS template |
| Category-reflex | ✅ No | Warm canvas + UniBe red + 流 + editorial Fraunces ≠ "dark Bloomberg" / "purple Tableau" / "neon DataDog" |
| liulian-copy | ✅ No | The exact "agent proposes a panel as a ghost preview" interaction is liulian-specific so far |
| gui-demo cross-check | ✅ Yes | Same tokens, same hairlines, same UniBe red anchor; new ghost-panel idiom is additive, not a brand break |

## What R4 still leaves to R5

1. **A11y pass** — colour-contrast on `.delta` (currently #8E9296 on white,
   AA borderline), focus-ring states, `aria-live` for the agent stream,
   `aria-controls` for ghost-panel buttons, full keyboard nav, reduced-motion.
2. **Token sync** — pull every literal hex into the `--canvas/--ink/--bern`
   tokens already in `liulian-web/packages/design-tokens`. Make sure the
   tokens here match the ones in `feat/gui-demo`.
3. **Locked spec doc** — `docs/superpowers/specs/2026-05-20-forecast-redesign-design.md`
   with: information architecture, all panel ids and their data sources,
   keyboard map, the ghost-panel-accept flow, agent event protocol, exact
   colour/typography decisions.
4. **Print-canvas variant** — what does "Replay for morning briefing" mean
   structurally? A single-column A4 PDF view of the canvas state, with
   narrative band on top and panels stacked in reading order. R5 sketches it.

## R4 module coverage

All 15 modules from `00-plan.md` present, plus 2 new affordances:

✅ Sticky scientific header
✅ Narrative band
✅ Stations rail (as dense table)
✅ Topology hint
✅ Hero fan chart with tabs + counterfactual overlay (NEW)
✅ Multi-model overlay (own panel)
✅ Forecast quality KPI strip (as table)
✅ Scenario form (with diff readout — NEW)
✅ Correlation 8×8
✅ Severity ribbon (slightly relaxed)
✅ Station profile preview strip
✅ Add-panel band
✅ BI agent right rail with pinned-panel chips (NEW) + collapsed trace (NEW) + footnote-as-panel-id (NEW)
✅ Ghost-panel proposal (NEW — agent's spatial output)
✅ Map of stations with river paths
✅ Brand & easter egg (WONK-U + 流 once)

## Handoff to R5

R5 = final + a11y + design spec doc. R4 is the design baseline. R5 should
not introduce new structural ideas; it locks the colours, the typography
opt-sz axis values, the keyboard map, the ghost-panel acceptance protocol,
and the agent SSE event names, then writes them into a spec under
`docs/superpowers/specs/` so the implementation in `liulian-web` can be
done without re-deriving any choice.
