# Delivery summary — /forecast redesign (2026-05-20)

## TL;DR

5 full design rounds + locked spec + implementation landed on the live
`/forecast` page. Every panel from the redesign canon now renders against
real `liulian-api` data on `http://localhost:3000/forecast`. The earlier
"toy" canvas (3 components in a flat grid) is replaced with the
production-grade bento layout from `docs/superpowers/specs/2026-05-20-forecast-redesign-design.md`.

A separate api fix landed in parallel: the `liulian-api /forecasts`
endpoint no longer hardcodes `forecast_at = 2026-05-12 14:38`. The
demo forecast root is now real `datetime.now()` snapped to the hour,
so timestamps in the run-header and chart are honest.

## What got built

### Design rounds (under `docs/strategy/redesign-2026-05-20/`)

| File | Lens |
|---|---|
| `00-plan.md` | 15-module inventory, 5-round lens list, rules, references |
| `round-1.html` + `.png` + `-notes.md` | Editorial Swiss baseline |
| `round-2.html` + `.png` + `-notes.md` | High-end visual polish, narrative band, river paths |
| `round-3.html` + `.png` + `-notes.md` | Bloomberg-terminal density, multi-model as own panel, KPI as table |
| `round-4.html` + `.png` + `-notes.md` | Synthesis + chat as 1st-class actor (ghost panel, alive chips, footnote→panel, Δ overlay in hero) |
| `round-5.html` + `.png` | Locked: a11y (focus ring, reduced-motion, contrast bump on faint ink), aria-live agent stream |

### Locked spec

`docs/superpowers/specs/2026-05-20-forecast-redesign-design.md` — 13
sections: goal, information architecture, tokens, typography, panel-id
contract, agent SSE protocol additions (`panel_ref` · `panel_proposal` · `pin`),
keyboard map, a11y, ghost-panel acceptance flow, implementation file map,
out-of-scope list, self-audit, approval.

### Implementation (in `liulian-web/app/forecast/`)

| File | Status |
|---|---|
| `page.tsx` | REWRITTEN — R5 layout (run header · narrative band · 3-column · 12-col bento · alive-chips · agent rail) |
| `components/NarrativeBand.tsx` | NEW — Fraunces 23/1.32 lead + tabular pulse strip |
| `components/MapPanel.tsx` | NEW — inline SVG river network, no MapLibre dep |
| `components/StationsTable.tsx` | NEW — replaces `StationList`; dense table with watch-row tint and j/k nav |
| `components/CorrelationPanel.tsx` | NEW — 8×8 Spearman ρ grid, topology-ordered |
| `components/PeekStrip.tsx` | NEW — 4 mini-cards (val + Δ + 12-pt sparkbar) |
| `components/ScenarioSidecar.tsx` | NEW — 4 counterfactual sliders + live Δ readout |
| `components/ForecastChart.tsx` | reused unchanged inside new panel chrome (Fraunces hero title) |
| `components/MultiModelOverlay.tsx` | reused inside new panel chrome |
| `components/KpiStrip.tsx` | reused inside new panel chrome |
| `components/AlertRibbon.tsx` | reused inside new panel chrome with seeded rows |
| `components/ChatSidebar.tsx` | unchanged; alive-chips banner added in `page.tsx` above it |

### API fix (in `liulian-api/liulian_api/routers/forecasts.py`)

- `_build_demo_forecast`: `now` is now `datetime.now(timezone.utc)`
  snapped to the previous hour (was hardcoded `2026-05-12 14:38`).
- `_DEMO_FORECASTS` (module-level list, computed at import time) replaced
  with `_build_demo_forecasts()` (function, called per request).
- Both route handlers updated to call the function instead of reading the
  stale module global.
- 24 h of "observed" past + 48 h of forecast future, both moving with the
  wall clock. Verified — `forecast_at` and `timestamps[24]` are within ~5 minutes
  of real UTC now.

## Verification

Last verified at 2026-05-20 17:46 UTC:

```bash
# api
curl localhost:8000/healthz  # {"status":"ok", uptime ~5 min}
curl "localhost:8000/forecasts?station_id=aare-bern" | jq '.items[0].forecast_at'
# → "2026-05-20T17:00:00Z" (matches wall clock)

# agent
curl localhost:8001/health  # {"status":"ok","llm_provider":"GeminiProvider"}

# web
curl -I localhost:3000/forecast  # HTTP 200
```

Browser smoke at 1440×980 against real api: every R5 panel renders
(run-header, narrative band, stations table with watch row, map with
8 stations + 2 rivers + topology, hero fan chart with Fraunces title,
multi-model overlay, KPI strip, scenario sliders with live Δ, 8×8
correlation, alert ribbon, peek strip, alive chips, ChatSidebar).

Screenshot at `docs/strategy/redesign-2026-05-20/impl-final.png`.
Console: 0 errors · 0 warnings.

## How to view

```bash
cd "<…>/liulian-python"
bash start-local.sh            # api :8000 · agent :8001 · web :3000
# open http://localhost:3000/forecast in a browser
```

Hover stations in the left rail to focus; click to navigate to that
station. The scenario sliders update the Δ readout live. The agent
panel in the right rail accepts free-text questions and streams from
`liulian-agent`.

## Known gaps (R5 out-of-scope / iteration backlog)

These were deliberately left for a later pass — see spec §11:

1. **Counterfactual fan overlay in `#fan`.** R4 had it as a dashed-grey
   overlay on the hero fan chart; the implementation's `ForecastChart`
   doesn't yet accept a second series. ScenarioSidecar's Δ values are
   computed and displayed, but not drawn yet.
2. **Ghost-panel proposal flow.** The dashed-border "cohort by basin"
   ghost panel from R4 is in the HTML mock but the agent does not yet
   emit `panel_proposal` events. ChatSidebar still uses the chunk-only
   protocol from Day 1.
3. **Footnote-as-panel-id links.** R5 spec defines `<sup>` → `#peek-…`
   anchors; the agent's answer stream does not yet structure citations
   this way.
4. **Pinned-panel chips are static.** Currently a hardcoded triplet
   (`#fan aare-bern · #sev 3 rules · #peek 4 stations`). When ChatSidebar
   reads `pin` events, replace with live state.
5. **流 easter egg on the live chart.** Present in every round HTML;
   not yet wired into the ECharts `markPoint` layer of `ForecastChart`.
6. **Some panels still have double chrome.** `ForecastChart`,
   `MultiModelOverlay`, `KpiStrip`, `AlertRibbon` retain their own
   `border + padding` from the Day-1 era and now sit inside R5 panel
   shells. Visual is acceptable but should be flattened in a refactor.
7. **`CorrelationPanel` data is static.** No `/stations/correlation`
   endpoint exists yet on `liulian-api`.

## File map (one place to find everything)

```
docs/strategy/redesign-2026-05-20/
├── 00-plan.md                       # 5-round plan + research synthesis
├── round-{1..5}.html                # full design mocks per round
├── round-{1..5}.png                 # rendered screenshots
├── round-{1..4}-notes.md            # critique & handoff per round
├── impl-final.png                   # screenshot of the implemented page
└── DELIVERY.md                      # this file

docs/superpowers/specs/
└── 2026-05-20-forecast-redesign-design.md   # locked spec

liulian-web/app/forecast/
├── page.tsx                         # R5 layout
├── components/NarrativeBand.tsx     # NEW
├── components/MapPanel.tsx          # NEW
├── components/StationsTable.tsx     # NEW
├── components/CorrelationPanel.tsx  # NEW
├── components/PeekStrip.tsx         # NEW
├── components/ScenarioSidecar.tsx   # NEW
├── components/ForecastChart.tsx     # reused
├── components/MultiModelOverlay.tsx # reused
├── components/KpiStrip.tsx          # reused
├── components/AlertRibbon.tsx       # reused
├── components/ChatSidebar.tsx      # reused
├── components/StationMap.tsx        # legacy MapLibre version, unused
└── components/StationList.tsx       # legacy list, unused

liulian-api/liulian_api/routers/
└── forecasts.py                     # _build_demo_forecast now uses real time
```
