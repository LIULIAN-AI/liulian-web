# Redesign plan — R6 / R7 / R8 (2026-05-21)

3 full redesign rounds + spec lock + implementation. Applies the
[Multi-round redesign protocol](../../../../.. /home/linlin/.claude/CLAUDE.md)
(also at `~/.claude/CLAUDE.md`).

## Why this round

R5 (2026-05-20) shipped the BI canvas (bento, hero fan, multi-model,
severity, peek strip, agent rail). User feedback after looking at it:

1. **Layout looks centered / off in the screenshot** — verified as fullPage
   screenshot artifact + duplicate inner-chart header inside the hero
   fan panel. R6 fixes the duplicate; the screenshot artifact is benign.
2. **The data isn't real** — the page reads synthetic fans, not the
   actual swiss-river-1990 CSV. R6 wires the real loader (already done
   pre-R6 in the API; web defaults to a real station).
3. **No dashboard / data-operation layer** — only "pretty charts", no
   way to view raw rows, add, edit, delete, or table-format the data.
   R6 adds: data table panel + CRUD on a sandboxed dataset copy.
4. **Vis is too complex / fake** — user wants a chart picker (Power BI
   style), one-click chart-type swaps, chat-driven re-colour and
   re-style. R6 introduces the picker; R7 adds the editing layers.
5. **Twin-track chart editing** — per chart: (A) code/Python/API script
   visible at any time; click to edit + persist. (B) drawio-style
   vector canvas to nudge the rendered SVG. R7 adds both.

## Round map

| # | Lens | Focus |
|---|---|---|
| R6 | "real-data dashboard" | Data table panel (read + edit) · chart picker · live-binding table→chart |
| R7 | "twin-track chart editing" | Code drawer (Python+JSON+API) · drawio canvas embed · chat re-style ops |
| R8 | "synthesis + lock" | Best of R6/R7 · a11y · save-load · spec doc |

Each round = a full self-contained HTML mock (every panel, never partial)
rendered at 1440×980 via playwright. Notes file per round with critique +
UI_AUDIT compliance + handoff.

## Module inventory (target for R8)

Inherits all 15 modules from `redesign-2026-05-20/00-plan.md` and adds:

16. **Data table panel** — rows + columns of the active dataset, editable,
    with type indicator per column.
17. **Chart picker** — tile grid of available chart types (standard
    + liulian-specific). Click to swap the current panel's chart type.
18. **Spec drawer** — slides over the chart on `code`/`<` key; shows JSON
    spec + auto-generated Python snippet + the API URL that returns the
    chart's underlying data.
19. **Vector canvas** (drawio iframe) — opens on `canvas` action; nudges
    the SVG; saves an annotation overlay back onto the chart spec.
20. **Chat-driven re-style** — agent rail accepts `re-colour to {palette}`,
    `change type to {bar}`, `add annotation at X`, `swap axes`.

Reused unchanged from R5: run-header, narrative band, stations table,
map, hero fan, multi-model overlay, KPI table, scenario sidecar,
correlation, severity ribbon, peek strip, agent rail with alive chips,
add-panel.

## Pre-R6 work landed today (2026-05-21)

- API `liulian-api/.../data/swiss_river.py` — real CSV loader (stdlib
  csv, cached). 28 stations × 10108 daily observations of `_wt` /
  `_at`. `forecast_at` and `timestamps` follow real CSV dates.
- API `routers/datasets.py` — added `/datasets/swiss-river-1990/stations`
  and `/datasets/swiss-river-1990/timeseries?station_id=X&days=N`.
- API `routers/forecasts.py` — `/forecasts?station_id=X` now prefers
  real CSV data (28 obs + 14 step extrapolation). Returns
  `real_data: true`, `units: '°C'`.
- Web `ForecastChart` — adds `withChrome` prop; page.tsx passes `false`
  so the inner mono header doesn't duplicate the outer panel chrome.

## Round 6 — Data dashboard layer

### What's new this round
- Replace the hardcoded `StationsTable` rows with a fetched list from
  `/datasets/swiss-river-1990/stations`.
- Default active station = `'2091'` (the benchmark canonical).
- Add **#table** panel: rows of the active station's timeseries, last
  ~60 days. Each cell editable in place; edits commit to a *sandbox
  draft* (no API write yet).
- Add **#picker** affordance: above the chart, a row of chart-type
  tiles (line · area · bar · scatter · table). Click → re-render.
- Live binding: edits to **#table** immediately re-render **#fan**.
- KPI panel re-computes from real observed values.

### Validation
- UI_AUDIT compliance table at the end of round-6.html
- Live render against real api at 1440×980 → round-6.png
- Smoke: edit a cell in #table → chart updates within 200 ms

## Round 7 — Twin-track chart editing

### What's new this round (on top of R6)
- **Spec drawer**: every chart has a `</>` icon on its header. Click →
  slide-over drawer showing 3 tabs:
    1. **JSON spec** (editable in monaco-lite textarea)
    2. **Python snippet** (read-only; auto-generated)
    3. **API URL** (read-only; `curl` example + JSON sample)
- **Vector canvas**: every chart has a `⌗` icon. Click → opens an
  iframe to `https://embed.diagrams.net/?embed=1&...` with the chart's
  SVG XML loaded. User can nudge nodes / colours / add annotations.
  Save round-trips back into the chart spec's `annotations` list.
- **Chat re-style ops**: agent rail recognises commands like
  `re-colour #fan to ocean palette`, `change #fan type to bar`,
  `annotate #fan at 2020-12-15 "cold snap"`, `swap x and y on #scn`.

### Validation
- UI_AUDIT table at the end
- 4-test self-audit + drawio embed test
- Render at 1440×980 → round-7.png

## Round 8 — Synthesis + spec lock

### What's new
- Merge best of R6/R7. Trim asymmetric density loss from added panels.
- Save / Load dashboards: `POST /dashboards`, `GET /dashboards/{id}`.
- A11y pass — focus rings, aria-live for chart re-renders, reduced-motion.
- Empty states + error states for every new panel.
- Spec lock: `docs/superpowers/specs/2026-05-21-forecast-dashboard-design.md`
  with: information architecture, panel-id contract (updated with new
  ids), agent re-style command grammar, drawio embed message protocol,
  LiulianChartSpec schema, keyboard map, save-load endpoints.

### Validation
- Full UI_AUDIT 46-item table
- a11y compliance table (focus / contrast / aria-live / reduced-motion)
- All four self-tests pass

## Implementation phase (post-R8)

- Land R8 in real Next.js code under `liulian-web/app/forecast/`
- New components: DataTablePanel, ChartPicker, SpecDrawer, VectorCanvas, ChartPanel (generic wrapper that holds the spec + render)
- Wire to real api endpoints (existing /datasets/swiss-river-1990/* + new /charts/* sketched)
- Smoke test 1440×980 with 0 console errors
- DELIVERY.md with file map + how to view

## Validation gates per round

Each round must show:
- Live HTML mock at `redesign-2026-05-21/round-N.html`
- Playwright PNG at `redesign-2026-05-21/round-N.png`
- Notes at `redesign-2026-05-21/round-N-notes.md` with:
  - What changed from N-1 (5-7 numbered items)
  - UI_AUDIT compliance check
  - 4-test self-audit (AI-slop / category-reflex / liulian-copy / cross-check)
  - Handoff items to round N+1

## References

- `redesign-2026-05-21/00-research.md` — chart picker / drawio / power BI patterns
- `redesign-2026-05-20/round-5.html` — R5 baseline
- `docs/superpowers/specs/2026-05-20-forecast-redesign-design.md` — R5 spec
- `~/.claude/CLAUDE.md` §"Multi-round redesign protocol" — the rule
- `conventions/UI_AUDIT_CHECKLIST.md` — bans + 4 tests
- `dataset/swiss_river/swiss-1990_{train,test}.csv` — the real data
