# /forecast canvas redesign — design spec

- **Date:** 2026-05-20
- **Status:** locked (R5)
- **Source rounds:** `docs/strategy/redesign-2026-05-20/round-{1..5}.{html,png}`
- **Implementation surface:** `liulian-web/app/forecast/**` + `liulian-web/packages/design-tokens/**`
- **Predecessors:** [`docs/strategy/PLATFORM_DESIGN.md`](../../strategy/PLATFORM_DESIGN.md) §4 (bento canvas) · [`conventions/UI_AUDIT_CHECKLIST.md`](../../strategy/conventions/UI_AUDIT_CHECKLIST.md) · [`REFERENCE_DESIGNS.md`](../../strategy/REFERENCE_DESIGNS.md)

## 1 · Goal

Replace the current toy-grade `/forecast` (3 stubbed components in a tabletop
grid) with a production-grade BI canvas that:

1. Renders the full **information architecture** in one screen: map, hero fan,
   multi-model overlay, KPI table, scenario sidecar, correlation, severity
   ribbon, station profile peek, agent rail.
2. Makes the **chat agent a first-class actor** on the canvas — it pins
   panels, proposes new panels as *ghost previews*, and its footnotes link
   to panel ids.
3. Stays inside the **editorial-Swiss + UniBe-red** brand anchor from
   `feat/gui-demo` (warm canvas, Fraunces / Switzer / JetBrains Mono,
   single accent, 1 px hairlines, WONK-italic U brand, 流 easter egg max once).
4. Passes every item in `UI_AUDIT_CHECKLIST.md` and survives the four tests
   (AI-slop / category-reflex / liulian-copy / gui-demo cross-check).

## 2 · Information architecture

```
┌──────────────────────────────────────────────────────────────────────────┐
│ run-header   2026-05-20·17:00·UTC · aare-bern/patchtst/ent=none/seed=42  │
├──────────────────────────────────────────────────────────────────────────┤
│ narrative band                                                            │
├──────────┬───────────────────────────────────────────────┬───────────────┤
│ stations │  #map        cols 1-7 rows 1-6                │  AGENT RAIL   │
│ (table)  │  #fan hero   cols 8-12 rows 1-6               │  · alive chips│
│          │  #mm  multi  cols 1-7 rows 7-11               │  · prompt     │
│ topology │  #kpi tbl    cols 8-12 rows 7-9               │  · user msg   │
│ filters  │  #scn        cols 8-12 rows 10-11             │  · trace      │
│          │  #corr       cols 1-5 rows 12-16              │    (collapsed)│
│          │  #sev        cols 6-12 rows 12-16             │  · answer     │
│          │  #peek strip cols 1-12 rows 17-18             │    sup→panel  │
│          │  #cohort GHOST (when agent proposes)          │  · proposal   │
│          │  + add panel                                  │  · refs       │
│          │                                               │  · suggest    │
│          │                                               │  · ask form   │
└──────────┴───────────────────────────────────────────────┴───────────────┘
```

Layout: `grid-template-columns: 268px minmax(0,1fr) 376px`. Bento middle is
12-col × 52-px rows with 12-px gap. Right rail is sticky, 376 px including
its own internal padding.

## 3 · Tokens

Pulled from `liulian-web/packages/design-tokens` `feat/gui-demo` baseline. R5
locks the values below; any drift is a token-package update, not a per-page override.

```css
/* canvas */
--canvas:        #FBFBFA;   /* warm bone, body bg */
--canvas-warmer: #F2F0EA;   /* secondary surfaces, code-bg */
--canvas-deep:   #EAE7DD;   /* tertiary, rare */
--surface:       #FFFFFF;   /* card surface */
--surface-shade: #FAFAF9;   /* card inner shade */

/* ink ramp — measured WCAG contrast on canvas */
--ink:        #131313;  /* 14.4 — headings, hero numbers */
--ink-soft:   #34373B;  /* 11.1 — body */
--ink-muted:  #5C6066;  /* 7.5  — secondary */
--ink-faint:  #767A7E;  /* 4.6  — meta, mono captions (AA) */
--ink-quiet:  #B6B9BD;  /* 3.1  — decorative ONLY (separators) */

/* hairlines */
--hairline:        #EAEAEA;
--hairline-strong: #DEDCD4;

/* accent — UniBe red, single spot color */
--bern:        #E20613;
--bern-tint:   #FDEBEC;  /* fan ribbon, active row */
--bern-tint-2: #FAD9DC;  /* elevated track */
--bern-deep:   #B00510;

/* secondary, used sparingly */
--ocean:       #0066B3;  /* chronos-2 marker line */
--ocean-tint:  #D6E9F7;
--green:       #509A39;  /* timesnet marker line, live dot */
--apricot:     #E6863A;  /* drift indicators */

/* watch state */
--y:           #FBF3DB;
--y-text:      #956400;

/* type */
--serif: 'Fraunces',Georgia,serif;
--sans:  'Switzer',system-ui,sans-serif;
--mono:  'JetBrains Mono',ui-monospace,monospace;
```

Reds-per-viewport budget: **≤ 2**. R5 uses `#bern` only on the active-row
tint and the fan-chart mean line. `#bern-tint`/`#bern-tint-2` count as
tinted surfaces, not "reds".

## 4 · Typography

| Slot | Family | Size / line | Variation axis | Notes |
|---|---|---|---|---|
| run-header | mono 600 | 10/1.5 | – | tracking 0.07em, uppercase |
| narrative band lead | serif 400 | 23/1.32 | `opsz 56, wght 400`; emphasis `wght 500, WONK 1` | tracking −0.014em |
| hero fan title (`aare-bern`) | serif 500 | 30/1 | `opsz 56, wght 500` | tracking −0.02em |
| hero fan subtitle | serif italic 400 | 14/1 | `opsz 20` | colour `--ink-muted` |
| panel-h title | mono 500 | 10/1 | – | tracking 0.10em, uppercase |
| panel-h sub | mono 400 | 10/1 | – | tracking 0.06em, uppercase, faint |
| body prose | sans 400 | 13/1.5 | `ss01 1, cv11 1` | ink-soft |
| numbers / mono cells | mono 400 | 11–14 | `tnum 1` | tabular-nums |
| `<kbd>` | mono 400 | 9 | – | 1 px hairline border |
| agent footnote `sup` | mono 500 | 9 | – | red, dotted-underline |

WONK axis is used **only** on:
1. brand `U` in the run-header (`opsz 24, wght 700`)
2. agent persona text (`opsz 20, wght 500`)
3. emphasised tokens inside the narrative band (`italic` + `WONK 1`)

流 easter egg appears **once and only once** — on the hero fan chart, top-right,
`Fraunces 20 italic` at `opacity 0.32` colour `--bern`.

## 5 · Panel id contract

Every panel header carries a `<span class="panel-id">#xxx</span>` on its right
edge. The agent uses these as anchors. R5 locks the set:

| id | Module | Data source |
|---|---|---|
| `#map` | River network | `GET /stations` (or static list seed) + topology config |
| `#fan` | Hero fan chart | `GET /forecasts?station_id=…&model_id=…` |
| `#mm` | Multi-model overlay | `GET /forecasts?station_id=…` × N models |
| `#kpi` | Forecast quality | `GET /forecasts/{id}/metrics` (currently inline `_synth_fan`) |
| `#scn` | Scenario / counterfactual | client-side overlay — Δ rendered into `#fan` |
| `#corr` | Cross-station correlation | `GET /stations/correlation?days=30` (TODO) |
| `#sev` | Alert severity ribbon | `GET /alerts/rules` + `GET /alerts/events` |
| `#peek` | Profile preview strip | `GET /forecasts?station_id=…` × 4 |
| `#cohort` | Ghost (agent proposal) | populated when agent suggests it |

New endpoints introduced by the redesign (mark as TODO in api):

- `GET /forecasts/{id}/metrics` — already partial (`MAE/RMSE/CRPS/cov@90`)
- `GET /stations/correlation?days=30` — return upper-triangle Spearman matrix
- `GET /alerts/severity-ribbon?window=24h` — bucket events into 12 time slots

## 6 · Agent SSE event protocol

The agent stream from `POST /agent/chat` (port 8001) already carries five
event types; R5 adds three for the first-class-actor behaviour:

```
event: trace            (existing) — intent, plan, tool, tool_result
event: chunk            (existing) — markdown answer body
event: references       (existing) — citations
event: suggestions      (existing) — follow-up prompts
event: done             (existing) — final usage block

event: panel_ref        NEW       — { "id": "#peek", "station_id": "rhine-rheinfelden" }
event: panel_proposal   NEW       — { "id": "#cohort", "kind": "cohort-by-basin",
                                       "title": "Cohort by basin",
                                       "preview": {...minimal data...} }
event: pin              NEW       — { "id": "#fan", "label": "aare-bern" }
```

Client behaviour:

- `panel_ref` → render the corresponding `sup` in the answer as a clickable
  panel-id link. The number is incremented in order of references.
- `panel_proposal` → render a *ghost panel* on the bento using the preview
  payload. The user accepts (`<Enter>` / "accept · pin") → the panel is
  promoted to a real panel and replaces the ghost; or dismisses (`Esc`).
- `pin` → push a chip into the "alive context" row at the top of the agent
  rail.

## 7 · Keyboard map

Single source of truth — copy this into the in-app `<kbd>?</kbd>` help dialog.

| Key | Effect |
|---|---|
| `⌘K` / `Ctrl+K` | command palette |
| `:` | mono-prefixed command palette (Linear-style) |
| `b` | toggle BI agent rail |
| `m` | fullscreen `#map` |
| `c` | open `#mm` compare overlay |
| `s` | focus `#scn` scenario sliders |
| `k` | focus `#kpi` metric table |
| `a` | focus `#sev` alert ribbon, ready to ack |
| `o` | open station profile (full `#peek`) |
| `j` / `k` | next / prev station in rail |
| `1`…`5` | switch hero fan tabs (forecast / compare / scenario / residual / seasonality) |
| `↵` (Enter) | accept ghost-panel proposal |
| `Esc` | dismiss ghost-panel proposal · close palette |
| `?` | help dialog |

Every panel header shows its key on the right edge in `<kbd>`. Every actionable
chip in the agent rail shows its key in `<kbd>`. The `:focus-visible` ring is
2 px UniBe red.

## 8 · A11y

| Concern | Decision |
|---|---|
| Colour contrast on prose | All body / meta text uses `--ink-soft` or darker, except meta-mono which uses `--ink-faint` (4.6 ratio, AA) |
| `--ink-quiet` | Decorative only — separators, dim chrome. Never used on text the user must read |
| Focus ring | `:focus-visible` → 2 px solid `--bern`, 2 px offset, 3 px radius |
| Reduced motion | `@media (prefers-reduced-motion: reduce)` disables animation/transition durations globally |
| Screen-reader streaming | Agent notebook has `role="log" aria-live="polite" aria-relevant="additions text"` |
| Icon-only keys | Each `<kbd>` carries `aria-label`; tooltip in `.sr-only` |
| Form labels | `<label class="sr-only">` precedes each `<input>` |
| Tables | Use real `<table>/<thead>/<tbody>` not divs, so screen readers narrate |
| Footnote sups | `<a href="#peek-rhine-rheinfelden">` so screen reader announces "footnote 1, links to peek panel" |
| Charts | Hidden `<figcaption>` summarises trend in prose (e.g. "PatchTST mean rises from 408 to 440 m³/s; Q95 stays below 475") |

## 9 · Ghost-panel acceptance flow

```
agent sends event: panel_proposal { id, kind, title, preview }
    │
    ▼
client mounts <GhostPanel/> at the next free slot in bento grid
    │
    ▼
agent rail prop card shows actions: accept · just-the-rule · edit · dismiss
    │  ┌──────────────────────────────────────────────────┐
    │  │ accept   → POST /canvas/pin { panel_id: id }      │
    │  │           ghost replaced with real <CohortPanel/> │
    │  │ rule     → POST /alerts/rules (no panel created)  │
    │  │ edit     → opens panel-config form inline         │
    │  │ dismiss  → ghost removed, no api call             │
    │  └──────────────────────────────────────────────────┘
    ▼
new alive-chip pushed to agent rail head: #cohort cohort-by-basin
```

Server-side panel state is per-canvas-session, stored on the user's profile
(stub now, real `POST /canvas/pin` later). Persistence is not in scope of R5.

## 10 · Implementation plan

R5 implementation lives in `liulian-web/app/forecast/`. The full delta:

| File | Change |
|---|---|
| `app/forecast/page.tsx` | Replace 3-column simple grid with `RunHeader` + `Narrative` + 3-column `Layout` (stations / bento / agent rail) |
| `app/forecast/lib/api.ts` | Add `getMultiModelForecasts(stationId)`, `getCorrelation(days=30)`, `getSeverityRibbon(window=24h)` |
| `app/forecast/components/RunHeader.tsx` | NEW — sticky, mono, WONK-italic-U, keyboard hint nav |
| `app/forecast/components/NarrativeBand.tsx` | NEW — Fraunces lead + tabular pulse strip |
| `app/forecast/components/StationsTable.tsx` | REPLACES `StationList` — value + Δ24h table, watch-row tint |
| `app/forecast/components/MapPanel.tsx` | NEW — SVG inline river network from R4 |
| `app/forecast/components/FanPanel.tsx` | UPGRADES `ForecastChart` — Fraunces hero title, tab bar, counterfactual Δ overlay |
| `app/forecast/components/MultiModelPanel.tsx` | NEW — 3-model overlay + leaderboard table |
| `app/forecast/components/KpiPanel.tsx` | REPLACES `KpiStrip` — table layout (metric / value / Δ / target / spark) |
| `app/forecast/components/ScenarioPanel.tsx` | NEW — 4 sliders + Δ diff readout, posts updates to `FanPanel` via context |
| `app/forecast/components/CorrelationPanel.tsx` | NEW — 8×8 grid |
| `app/forecast/components/SeverityRibbon.tsx` | NEW — 3 rules × 12 segments |
| `app/forecast/components/PeekStrip.tsx` | NEW — 4 mini-cards strip |
| `app/forecast/components/GhostPanel.tsx` | NEW — dashed-border placeholder + accept actions |
| `app/forecast/components/ChatSidebar.tsx` | UPGRADES — alive chips, collapsed trace, panel_proposal handler, footnote-as-anchor rendering |
| `packages/design-tokens/tokens.json` | Sync the locked ink ramp (`#767A7E` for `--ink-faint`) |

Each new component is a server component where the data is server-fetched;
`ChatSidebar`, `ScenarioPanel`, `GhostPanel` are client components.

## 11 · Out of scope for R5

- Cloud auth / multi-tenant. Demo-mode only.
- Real model inference. `api/_synth_fan` continues to produce the data.
- Persistence of pinned panels across sessions.
- Print-canvas / "morning briefing" PDF export (sketched verbally only).
- Internationalisation. Copy is English.

## 12 · Self-audit (UI_AUDIT 46-item gate)

R4/R5 self-checked against `conventions/UI_AUDIT_CHECKLIST.md`. The full result
table lives in `docs/strategy/redesign-2026-05-20/round-4-notes.md` §UI_AUDIT
compliance. R5 closes the two items that R4 left open:

1. `--ink-faint` was `#8E9296` (3.7 ratio, below AA on canvas) → now
   `#767A7E` (4.6, AA).
2. `<input>` in the ask-form had no associated label → R5 adds `<label
   class="sr-only" for="ask">`.

## 13 · Approval

Status: locked. Any further visual change to `/forecast` should land as
amendments to this spec, not as ad-hoc edits.
