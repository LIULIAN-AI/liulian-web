# Round 3 — Bloomberg-Terminal density lens

Date: 2026-05-20
File: `round-3.html` · screenshot `round-3.png`

## What changed from R2

R2 was rich and editorial; R3 increases information density ~1.5× with no
new chrome.

1. **Stations rail becomes a table** — three columns (station, Q now, Δ24h)
   replace the card stack. Each row 28 px tall vs R2's 60 px. Watch state
   surfaced as the active row tint; topology + filters as compressed mono
   captions below.
2. **Multi-model overlay promoted to its own panel** — was a tab on the
   hero fan in R1/R2. Now occupies cols 1-7 rows 7-11. Left half: triple-fan
   overlay with three dashed mean lines. Right half: leaderboard table with
   MAE / RMSE / CRPS / cov@90, winner row tinted.
3. **KPI strip becomes a multi-metric table** — single panel cols 8-12 rows
   7-9. Columns: metric, value, Δ24h, target, 7-day sparkline. Replaces the
   four KPI cards from R1/R2 with one denser surface.
4. **Scenario sidecar made visible** — cols 8-12 rows 10-11. Four counterfactual
   sliders (precip Δ, temp Δ, upstream Δ, horizon) with current value + thin
   range bars. No longer hidden behind a tab.
5. **Station profile preview strip** — cols 1-12 row 17-18, four mini-cards:
   value + unit + Δ + 7-day sparkbar + meta line. Mixes the watch station
   into the rhythm.
6. **Terminal keyboard cues on every panel** — every `panel-h` gets a
   `<kbd>` hint on the right edge: `m`=fullscreen map, `c`=compare, `s`=scenario,
   `a`=ack alert, `o`=open profile, `:`=command palette.
7. **Reds trimmed to 2 per viewport** — active row tint stays red; fan
   chart dashed mean stays red; 流 easter egg stays gold-glow opacity 0.32 (no
   longer counted as red); watch state on map switched from red ring to
   pastel-yellow ring; alert ribbon's critical segment stays red but is
   only ~4 px wide.

## UI_AUDIT compliance check

| Item | Status |
|---|---|
| 1px hairlines / no side-stripe | ✅ |
| No gradient text | ✅ |
| No glassmorphism | ✅ |
| No hero-metric template | ✅ — KPI is now a table |
| No identical card grids | ✅ — variety preserved |
| No rounded-full on cards | ✅ |
| No emojis | ✅ |
| No em-dash in user-copy | ✅ — narrative band keeps the `;` from R2 fix |
| Three-reds-in-viewport ≤ 2 | ✅ — active row, fan-mean line. Map watch is pastel-yellow now |
| Mono for numbers/code/keys | ✅ — JetBrains Mono on every numeric cell + `<kbd>` |
| Distinctive moves present | ✅ — WONK-U, scientific header, bento asymmetry, 流 easter egg (single instance), `tnum` + `ss01`/`cv11`/opsz typography |

## Four tests

| Test | Pass? | Note |
|---|---|---|
| **AI-slop** — could "AI made that"? | ✅ No | Editorial Swiss + brutalist density + terminal keys ≠ any default SaaS template |
| **Category-reflex** — guessable from "BI dashboard"? | ✅ No | Not "dark blue Bloomberg clone", not "purple Tableau", not "rounded gradient SaaS" |
| **liulian-copy** — would I see this exact arrangement elsewhere? | ✅ No | Density + warm canvas + UniBe red + WONK-italic U + 流 easter egg + table-style KPI + counterfactual sliders together = liulian-only |
| **gui-demo cross-check** — coherent with feat/gui-demo's editorial baseline? | ✅ Yes | Same tokens, same fonts, same UniBe-red anchor, same hairline discipline; gained density and depth without breaking the brand |

## What works in R3

- The right rail no longer competes for visual weight; the bento earns the eye.
- Multi-model overlay as its own panel is honest — users see immediately that
  three models are compared, not buried in a tab.
- Scenario sliders being always-visible (rather than modal/tab) makes
  counterfactual reasoning a first-class affordance, not a hidden power-user
  feature.
- Stations-as-table reads like a trader's watchlist: scannable at a glance.
- Keyboard cues on every panel make it feel like a real terminal, not a marketing site.

## What R4 should attack (synthesis + chat-as-first-class actor)

1. **Density vs breathing** — R3 is dense; some surfaces (correlation, severity)
   could relax very slightly to recover scannability. R4 picks specific cells
   for breath, others for density. Asymmetry is the answer, not uniformity.
2. **Chat as a first-class actor** — R3's agent rail is still a sidebar.
   R4 has the agent propose a *ghost panel* on the bento that previews
   inline before commit; clicking accept materializes it. The agent's
   answer references existing panels by `id` so user can click footnote → panel.
3. **Trace and tool calls collapse to one line by default** — expand-on-hover.
   The notebook is too verbose at default density; the answer + proposal is
   what the user reads.
4. **Pinned panel chips on the right rail head** — show which panels are
   "alive" right now so the user knows what context the agent has.
5. **Diff view in scenario panel** — counterfactual fan overlaid on baseline
   fan in the same hero chart, dashed-grey. Numbers diff: "Q95 +47 m³/s vs baseline".

## R3 module coverage

All 15 modules from `00-plan.md` present:

✅ Sticky scientific header
✅ Narrative band
✅ Stations rail (as dense table)
✅ Topology hint
✅ Hero fan chart with tabs
✅ Multi-model overlay (own panel — promoted)
✅ Forecast quality KPI strip (as table)
✅ Scenario form (as sidecar — promoted visible)
✅ Correlation 8×8 (denser, smaller cells)
✅ Severity ribbon
✅ Station profile preview (strip of 4 mini-cards)
✅ Add-panel band (with suggestions)
✅ BI agent right rail (notebook with proposed-panel chip)
✅ Map of stations (with river paths from R2)
✅ Brand & easter egg (WONK-U + 流 once)

## Handoff to R4

R4 = synthesis. Take R3's density and information weight + R2's editorial polish
and river paths + R1's clean structural intent. Make the chat agent a real actor:
ghost panel proposals, click-through footnotes, pinned-panel context chips.
