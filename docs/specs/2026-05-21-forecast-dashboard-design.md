# /forecast dashboard redesign — design spec

- **Date:** 2026-05-21
- **Status:** locked (R8)
- **Source rounds:** `docs/strategy/redesign-2026-05-21/round-{6..8}.{html,png}`
- **Predecessor spec:** `docs/superpowers/specs/2026-05-20-forecast-redesign-design.md` (R5)
- **Research:** `docs/strategy/redesign-2026-05-21/00-research.md`
- **Implementation surface:** `liulian-web/app/forecast/**` + `liulian-api/liulian_api/data/swiss_river.py` + `liulian-api/liulian_api/routers/{datasets,forecasts}.py`

## 1 · Goal

Turn `/forecast` from a "BI canvas with synthetic numbers" into a
**real-data dashboard** the user can operate on:

1. all numbers from `dataset/swiss_river/swiss-1990_*.csv` (28 stations,
   31 years, daily water-temperature `wt` and air-temperature `at`)
2. an editable **#table** of the active station's recent rows
3. a **#picker** strip to swap the visualisation type
4. live binding: edit a cell → chart re-renders
5. per-chart twin-track editing:
   - **code track**: spec drawer with JSON / Python / API URL tabs
   - **visual track**: drawio iframe canvas with postMessage round-trip
6. chat re-style commands that emit spec patches the user can
   inspect, accept or revert
7. save / load named dashboard layouts

## 2 · Information architecture (final)

```
┌────────────────────────────────────────────────────────────────────┐
│ run-header [LIULIAN] · Forecast · station 2091 · real CSV ·       │
│            dashboard v3 · ⌘K · b agent · t table · p picker · s save│
├────────────────────────────────────────────────────────────────────┤
│ narrative band   Station 2091 (Aare/Bern) closes at 5.83 °C…       │
├──────────┬──────────────────────────────────────┬──────────────────┤
│ stations │ #table cols 1-5 rows 1-7             │ AGENT RAIL       │
│ table    ├──────────────────────────────────────┤ · alive chips    │
│ (real    │ #picker strip   cols 6-12 row 1      │   #table 2091    │
│  ids,    │ #fan hero       cols 6-12 rows 2-7   │   #fan spec open │
│  green   │   + spec drawer (slide-over right)   │   #map canvas    │
│  badge)  │   + edit toolbar [</>] [⌗] [●●] [↓]  │ · re-style chat  │
│          │   + annotation chip                  │ · suggest        │
│          ├──────────────────────────────────────┤ · ask form       │
│          │ #kpi   cols 1-5 rows 8-11            │                  │
│          │ #mm    cols 6-12 rows 8-11           │                  │
│          ├──────────────────────────────────────┤                  │
│          │ #map  cols 1-6 rows 12-15            │                  │
│          │ #corr cols 7-12 rows 12-15           │                  │
│          ├──────────────────────────────────────┤                  │
│          │ #sev  cols 1-12 row 17               │                  │
│          ├──────────────────────────────────────┤                  │
│          │ #cohort (ghost when agent proposes)  │                  │
│          ├──────────────────────────────────────┤                  │
│          │ + add panel                          │                  │
└──────────┴──────────────────────────────────────┴──────────────────┘

DRAWIO MODAL (overlay, opened from any chart's [⌗] button)
┌──── vector canvas · #map · station-network · embed.diagrams.net ────┐
│ shapes / palette / align  │   <iframe>   │  selected inspector       │
│   …                       │              │  + postMessage round-trip │
└──────────────────────────────────────────────────────────────────────┘
```

## 3 · Tokens

Inherited from R5 spec; the only changes are units (`°C` instead of
`m³/s` everywhere the canon was river-discharge), and the addition of
`--ocean` as a secondary accent for the spec drawer's JSON key colour.

```css
--canvas:        #FBFBFA;
--canvas-warmer: #F2F0EA;
--surface:       #FFFFFF;
--ink:        #131313;  --ink-soft: #34373B;  --ink-muted: #5C6066;
--ink-faint:  #767A7E;  --ink-quiet: #B6B9BD;
--hairline:        #EAEAEA;
--hairline-strong: #DEDCD4;
--bern:        #E20613;  --bern-tint: #FDEBEC;  --bern-tint-2: #FAD9DC;
--ocean:       #0066B3;  --ocean-tint: #D6E9F7;
--green:       #509A39;  --apricot: #E6863A;
--y:           #FBF3DB;  --y-text: #956400;
```

Reds-per-viewport budget: still **≤ 2**. Drawio modal's selection
handles use ocean blue, not red.

## 4 · Real data path

**Source:** `dataset/swiss_river/swiss-1990_{train,test}.csv` in the
`liulian-python` checkout.

**Loader:** `liulian_api/data/swiss_river.py` — stdlib `csv`, cached
via `@lru_cache(maxsize=4)`. Functions:

- `load_csv(name) → {header, epoch_day, rows, stations}` — full merged frame
- `list_stations(name) → list[str]`
- `station_series(name, station_id, field='wt') → StationSeries`
- `synth_forecast(observed, horizon, noise_scale) → {mean, q05, q95}`

**HTTP endpoints:**

| Path | Returns |
|---|---|
| `GET /datasets/swiss-river-1990/stations` | 28 station cards (id, label, field, unit, latest_value, delta_7d, span, n_observations) |
| `GET /datasets/swiss-river-1990/timeseries?station_id=2091&field=wt&days=365` | raw points `[{t, v}, …]` for the dashboard's #table panel |
| `GET /forecasts?station_id=2091` | `ForecastSeries` with **`real_data: true`**, `units: '°C'`, 28 observed + 14 extrapolation steps, `forecast_at` aligned to last real CSV date |
| `GET /forecasts?station_id=<legacy>` | falls back to synthetic with `real_data: false`, `units: 'm³/s'` |

## 5 · Panel id contract (updated)

| id | Module | Data source |
|---|---|---|
| `#table` | Editable data rows for the active station | `/datasets/swiss-river-1990/timeseries?station_id=X` |
| `#picker` | Chart-type tile strip | client-side (changes the visual of the hero panel) |
| `#fan` | Hero fan chart Q05-Q95 | `/forecasts?station_id=X` |
| `#mm` | Multi-model overlay | `/forecasts?station_id=X` × N models |
| `#kpi` | Forecast quality table | `/forecasts/{id}/metrics` (sketched) |
| `#scn` | Scenario sidecar | client-side; Δ overlays into `#fan` |
| `#corr` | Cross-station correlation | `/stations/correlation?days=30` (TODO) |
| `#sev` | Alert severity ribbon | `/alerts/{rules,events}` |
| `#peek` | Station profile preview strip | `/forecasts?station_id=X` × 4 |
| `#map` | River-network station map | `/datasets/swiss-river-1990/stations` |
| `#cohort` | Ghost — agent proposal | inline, set by `panel_proposal` event |

## 6 · LiulianChartSpec — the source of truth for every chart

A chart on the canvas is the rendered output of a `LiulianChartSpec`,
never directly editable. The spec is JSON, serialisable, round-trippable.

```ts
type ChartType =
  | 'line' | 'area' | 'bar' | 'scatter' | 'table' | 'heatmap'
  | 'fan' | 'severity' | 'correlation' | 'multi-model' | 'map'

interface LiulianChartSpec {
  id: string                  // chart_2091_fan_main
  chart_type: ChartType
  dataset_ref: {
    dataset_id: string         // 'swiss-river-1990'
    station_ids: string[]      // ['2091']
    field: string              // 'wt' | 'at' | …
    t_range: [string, string]  // ISO 8601 dates
  }
  encoding: {
    x: string                  // 'date'
    y: string                  // 'value'
    band?: [string, string]    // ['q05', 'q95']
    color?: string             // 'model_id' for multi-model
  }
  style: {
    palette: 'unibe-red' | 'ocean' | 'green' | 'mono'
    mean_line?: 'solid' | 'dashed' | 'dotted'
    band_alpha?: number
    [k: string]: unknown
  }
  annotations?: Annotation[]
  forecast?: { model: string; horizon: number }
  updated_at: string
  version: number
}

interface Annotation {
  at: string                   // ISO date or x-axis value
  label: string                // free text
  source?: 'agent' | 'user' | 'canvas'
}
```

The Python snippet view auto-generates from this:

```py
from liulian.plot import fan
spec = LiulianChartSpec.from_json({...})
fig = fan(spec)
fig.show()
```

The API URL view shows the `curl` command that returns the **data**
backing the chart:

```bash
curl 'http://localhost:8000/datasets/swiss-river-1990/timeseries?station_id=2091&field=wt&days=60'
```

## 7 · Agent re-style command grammar

The chat agent parses commands and emits **spec patches**, not
free-text. Grammar (informal):

```
re-colour    <panel> to <palette>
change       <panel> type to <chart_type>
annotate     <panel> at <x_value> "<label>"
swap         <axis> on <panel>
filter       <panel> where <column> <op> <value>
focus        <panel> on station_ids=[<ids>]
```

Each command emits a `panel_proposal` SSE event carrying the patched
spec. User reviews the diff (Spec drawer highlights changed keys) and
accepts via the drawer's `apply` button.

## 8 · drawio embed protocol

iframe URL:

```
https://embed.diagrams.net/?embed=1&proto=json&libraries=1&configure=1
```

Message sequence:

```
embed → host  { event: 'init' }
host → embed  { action: 'configure', config: {…fonts, palette, custom shape lib} }
host → embed  { action: 'load', xml: '<mxGraphModel>…</mxGraphModel>' }
              (host serialises the chart's rendered SVG to mxGraph XML)
… user edits …
embed → host  { event: 'save', xml: '…' } | { event: 'exit' }
host          deserialises XML back into LiulianChartSpec.annotations
              and patches the chart spec.
```

Fallback when drawio fails to load (network / CSP): show the spec
drawer's "annotations" subsection instead, with a hint that the
canvas is unavailable.

## 9 · Keyboard map (updated)

| Key | Effect |
|---|---|
| `⌘K` / `Ctrl+K` | command palette |
| `:` | command palette (mono-prefixed) |
| `b` | toggle agent rail |
| `t` | focus `#table` (R8 new) |
| `p` | focus chart `#picker` strip (R8 new) |
| `s` | save dashboard (R8 new) |
| `m` | fullscreen `#map` |
| `c` | open `#mm` overlay |
| `k` | focus `#kpi` |
| `a` | focus `#sev` ribbon |
| `o` | open station profile |
| `j` / `k` | next / prev row in `#table` (and stations rail) |
| `1`…`5` | swap `#fan` tab (forecast / compare / scenario / residual / seasonality) |
| `↵` | accept ghost-panel proposal, commit `#table` edit, apply spec patch |
| `esc` | dismiss modal, close drawer, cancel cell edit |
| `?` | help dialog |

## 10 · A11y requirements

| Surface | Treatment |
|---|---|
| Spec drawer | `<aside role="region" aria-labelledby="drawer-title">`; tabs `role="tablist"` + `aria-selected`; close button `aria-label="Close spec drawer"` |
| Drawio modal | `<div role="dialog" aria-modal="true" aria-labelledby="canvas-title">`; focus trapped on open; `esc` close; visible esc hint in header |
| `#table` cell edits | `<input aria-label="Edit value for <date>">`; commit via `↵`, cancel via `esc` |
| Chart tiles | `<button aria-pressed="true|false">` to indicate active picker selection |
| Live re-render | `<aside role="log" aria-live="polite">` on the agent stream + a `<span aria-live="polite" class="sr-only">` next to each chart announcing "<chart name> re-rendered" |
| Reduced motion | `@media (prefers-reduced-motion: reduce) { animation-duration: 0; transition-duration: 0; }` |
| Focus ring | `:focus-visible { outline: 2px solid var(--bern); outline-offset: 2px; }` |
| Contrast | `--ink-faint = #767A7E` (4.6 AA on canvas); `--ink-quiet` for decoration only |

## 11 · Save / load dashboards

**Endpoints (sketched):**

| Path | Body | Returns |
|---|---|---|
| `POST /dashboards` | `{ name, panels: [{id, layout, chart_spec}…], default_station }` | `{ id, version, updated_at }` |
| `GET /dashboards/{id}` | – | full dashboard state |
| `PATCH /dashboards/{id}` | partial — `{ panels: […] }` | `{ id, version }` |
| `GET /dashboards` | – | list of saved dashboards for the user |

**UI:** run-header right shows `dashboard v3 · saved 2 min ago` (R8
header pill). `s` saves a snapshot; the version monotonically
increments.

## 12 · Implementation file map

In `liulian-web/app/forecast/`:

| File | Status | Purpose |
|---|---|---|
| `page.tsx` | UPDATE | add #table, #picker, save badge, edit toolbars |
| `lib/api.ts` | UPDATE | add `getStations()`, `getTimeseries()`, `saveDashboard()`, `loadDashboard()` |
| `lib/chartSpec.ts` | NEW | `LiulianChartSpec` types + spec→Python codegen helpers |
| `components/StationsTable.tsx` | UPDATE | fetch real /datasets/swiss-river-1990/stations |
| `components/DataTablePanel.tsx` | NEW | #table editable rows with toolbar + schema strip |
| `components/ChartPicker.tsx` | NEW | tile strip of chart types |
| `components/SpecDrawer.tsx` | NEW | JSON / Python / API tabs |
| `components/VectorCanvas.tsx` | NEW | drawio iframe + postMessage round-trip |
| `components/ChartPanel.tsx` | NEW | generic wrapper that holds a `LiulianChartSpec` + edit toolbar |
| `components/AgentRail.tsx` | UPGRADE existing ChatSidebar | parse re-style commands; show pinned chips for edit context |

In `liulian-api/`:

| File | Status |
|---|---|
| `liulian_api/data/swiss_river.py` | LANDED — stdlib CSV loader |
| `liulian_api/routers/datasets.py` | LANDED — `/stations` + `/timeseries` |
| `liulian_api/routers/forecasts.py` | LANDED — real-data preference + synthetic fallback |
| `liulian_api/routers/dashboards.py` | NEW — save / load endpoints |

## 13 · Out of scope (R8 doesn't cover)

- Real `liulian-core` model inference. The 14-step extrapolation in
  `synth_forecast()` is a deterministic linear-fit substitute.
- Multi-user persistence with auth. `POST /dashboards` is single-user demo.
- Embedded Plotly editor (react-chart-editor). The R6 picker is enough;
  the chart-config UI is the spec drawer.
- Real-time push notifications (websocket) on cell edit. Re-render is
  client-side from `chart_spec` + locally edited rows.

## 14 · Approval

Status: locked. Any visual or behavioural change to `/forecast`
beyond bug fixes should land as an amendment to this spec, not as
ad-hoc edits.
