# Delivery summary — /forecast dashboard redesign (2026-05-21)

## TL;DR

Three full design rounds (R6 / R7 / R8) plus the locked spec doc plus
implementation against real `swiss-river-1990` CSV data, all landed
in `http://localhost:3000/forecast`. The header bug was a fullPage
screenshot artifact + a duplicate inner chrome inside the chart panel
(now fixed). The "Multi-round redesign protocol" is persisted in
`~/.claude/CLAUDE.md` so the iteration rule applies on future projects
without re-asking.

## What got built

### Iteration rule (persisted globally)
- Added "Multi-round redesign protocol" section to `~/.claude/CLAUDE.md`
  (outputs, round count, lens discipline, validation gates, implementation
  phase, bug-from-screenshot triage, trigger logic).

### Design rounds (under `docs/strategy/redesign-2026-05-21/`)
| File | Lens |
|---|---|
| `00-plan.md` | 3-round plan (R6/R7/R8), module inventory, references |
| `00-research.md` | Web research on Power BI / Tableau / Hex / Plotly editor / drawio embed |
| `round-6.html` + `.png` + `-notes.md` | Real-data dashboard layer — #table, #picker, live binding |
| `round-7.html` + `.png` + `-notes.md` | Twin-track chart editing — spec drawer + drawio canvas modal + chat re-style |
| `round-8.html` + `.png` + `-notes.md` | Synthesis + lock — save/load badge, a11y, annotation chip fix |

### Locked spec
`docs/superpowers/specs/2026-05-21-forecast-dashboard-design.md` — 14
sections: goal, information architecture, tokens, real data path, panel
contract, LiulianChartSpec schema, agent re-style grammar, drawio embed
protocol, keyboard map, a11y, save/load endpoints, implementation file
map, out-of-scope, approval.

### Real data path (landed in liulian-api)
- `liulian-api/liulian_api/data/swiss_river.py` — stdlib CSV loader,
  caches 28 stations × 10 108 daily observations.
- `liulian-api/liulian_api/routers/datasets.py` — added
  `/datasets/swiss-river-1990/stations` (28 station cards with
  latest_value, delta_7d, span) and
  `/datasets/swiss-river-1990/timeseries?station_id=X&field=wt&days=N`.
- `liulian-api/liulian_api/routers/forecasts.py` — `/forecasts?station_id=X`
  now prefers real CSV data (28 obs + 14-step extrapolation) and
  returns `real_data: true`, `units: '°C'`. Falls back to synthetic
  with `real_data: false` for legacy demo station ids.

### Implementation (in `liulian-web/app/forecast/`)
| File | Status | Purpose |
|---|---|---|
| `page.tsx` | REWRITE | R8 layout · real-data wiring · edit toolbars · save badge · keyboard hints |
| `types.ts` | UPDATE | added `StationCard`, `TimeseriesPoint`, `TimeseriesResponse` |
| `lib/api.ts` | UPDATE | added `api.datasets.stations()` and `api.datasets.timeseries()` |
| `components/DataTablePanel.tsx` | NEW | #table — editable rows, toolbar, schema strip, ⏎/esc cell edit |
| `components/ChartPicker.tsx` | NEW | #picker — tile strip (fan / line / area / bar / scatter / multi-model / heatmap) |
| `components/StationsTable.tsx` | UPDATE | accepts real station rows, real units, real data-source captions |
| `components/NarrativeBand.tsx` | UPDATE | reads real units + latest observed; copy now references "real observation" |
| `components/ForecastChart.tsx` | UPDATE | `withChrome={false}` prop so the inner mono header doesn't duplicate the outer panel chrome |

### Bug fix (real)
The "header in the middle" was a duplicated inner mono header inside
`ForecastChart` that visually competed with the outer panel chrome.
Fixed by `withChrome={false}` prop. The fullPage screenshot still
extends to the bottom of the canvas, so when you preview it as a
thumbnail the header looks small — that part was a screenshot artifact,
not a layout bug.

## Verification

Last verified 2026-05-21 ~01:05 UTC.

```bash
curl localhost:8000/healthz   # {"status":"ok"}

curl 'localhost:8000/datasets/swiss-river-1990/stations' | head -c 200
# 28 real station cards: 2009/4.00°C delta-2.10, 2016/6.47°C delta-1.75, ...

curl 'localhost:8000/forecasts?station_id=2091' | python3 -c "..."
# patchtst real=True units=°C obs=28
# chronos-2 real=True units=°C obs=28

curl -I http://localhost:3000/forecast?station=2091   # HTTP 200
# narrative band reads: "Station 2091 measures 6.65 °C at the latest real
#   observation, with a forecast Q95 ceiling near 8.3 °C across the next 14 d"
```

Browser smoke at 1440×980 against real api: every R8 panel renders
(run-header with "real CSV" + dashboard-version pills, narrative band
with real observation, stations table with real ids and ΔT, #table
editable rows, #picker tile strip, hero fan with Fraunces title + edit
toolbar, multi-model overlay, KPI table, map with active 2091, 8×8
correlation, alert ribbon, agent rail). Console: **0 errors · 0
warnings**.

Screenshot at `docs/strategy/redesign-2026-05-21/impl-final.png`.

## How to view

```bash
cd "<…>/liulian-python"
bash start-local.sh
# open http://localhost:3000/forecast in a browser
# (default station 2091; ?station=2009 etc to switch)
```

In the page:
- Stations rail (left) — click any station id, or `j` / `k` to navigate.
- `#table` (top-left bento) — double-click any wt °C cell to edit (`⏎`
  commit, `esc` cancel). Edits live in a sandbox draft.
- `#picker` (top-right bento) — click a chart-type tile (only `fan` is
  currently wired to the chart; tiles for other types prepared for
  later integration).
- Hero fan — edit toolbar `[</>] [⌗] [●●] [↓]` on the right. `</>`
  toggles the spec drawer (sketched in R7/R8 mock; not yet wired into
  the running app). `⌗` would open the drawio canvas (R7/R8 mock;
  iframe wiring still pending).
- Agent rail (right) — type a question; the BI agent streams.

## Known gaps (R8 left to a future pass)

These were called out in spec §13 (out of scope) and remain pending:

1. **Spec drawer (R7/R8 mock) not yet a live component.** The button
   exists on the hero chart's edit toolbar; clicking it doesn't yet
   slide a drawer over. To land: write `components/SpecDrawer.tsx`
   per the R7 mock + serialise a `LiulianChartSpec` from the active
   forecast.
2. **Drawio canvas modal (R7/R8 mock) not embedded.** The `⌗` button
   would open `https://embed.diagrams.net/?embed=1&proto=json` in an
   iframe per spec §8; the round-trip XML → spec.annotations is not
   wired yet.
3. **Chart picker only re-tints itself.** Picking `line` / `bar` / etc.
   doesn't yet re-render the hero panel. To land: pass `chart_type`
   from `ChartPicker` to a generic `<ChartPanel/>` that switches on
   the type. Requires the LiulianChartSpec layer per spec §6.
4. **Real Chronos-2 / model inference.** Forecast extrapolation is
   still a linear-fit + Q05/Q95 widening. Real model calls land when
   `liulian-core` adapter is wired.
5. **Save / load dashboards.** Header pill says `dashboard v1 ·
   unsaved`; no `/dashboards` endpoints yet. Per spec §11.
6. **Per-cell edit → forecast re-derive.** Edited cells in `#table`
   update local state; `dispatchEvent('liulian:table-edit')` is wired
   but no listener subscribes the chart yet.
7. **Correlation panel data still static.** No `/stations/correlation`
   endpoint yet; the panel renders the canon values from R5/R6 mocks.
8. **Agent's re-style commands** parse to spec patches per spec §7,
   but the current ChatSidebar still uses the chunk-only protocol from
   Day 1.

## File map

```
docs/strategy/redesign-2026-05-21/
├── 00-plan.md
├── 00-research.md
├── round-{6..8}.html
├── round-{6..8}.png
├── round-{6..8}-notes.md
├── debug-viewport.png             # diagnostic for the header-in-the-middle claim
├── impl-final.png                 # the implemented page at 1440×980
└── DELIVERY.md                    # this file

docs/superpowers/specs/
└── 2026-05-21-forecast-dashboard-design.md   # locked spec

~/.claude/CLAUDE.md                # multi-round redesign protocol (global rule)

liulian-api/liulian_api/
├── data/swiss_river.py            # NEW — stdlib CSV loader
└── routers/
    ├── datasets.py                # UPDATE — /stations + /timeseries
    └── forecasts.py               # UPDATE — real-data preference

liulian-web/app/forecast/
├── page.tsx                       # REWRITE — R8 layout
├── types.ts                       # UPDATE — StationCard, Timeseries types
├── lib/api.ts                     # UPDATE — datasets methods
└── components/
    ├── DataTablePanel.tsx         # NEW
    ├── ChartPicker.tsx            # NEW
    ├── StationsTable.tsx          # UPDATE (real data prop)
    ├── NarrativeBand.tsx          # UPDATE (units + real-obs copy)
    ├── ForecastChart.tsx          # UPDATE (withChrome prop)
    ├── MapPanel.tsx               # reused
    ├── CorrelationPanel.tsx       # reused (static for now)
    ├── KpiStrip.tsx               # reused
    ├── MultiModelOverlay.tsx      # reused
    ├── AlertRibbon.tsx            # reused
    └── ChatSidebar.tsx            # reused
```
