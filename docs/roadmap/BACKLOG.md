# LIULIAN Web — Backlog

> Prioritized, ~1-day-sized cards. The daily run picks the **top `todo` card whose `deps`
> are all `done`** (P0 > P1 > P2, then W0 > W1 > …). See [`PROTOCOL.md`](PROTOCOL.md) §1.
> Update a card's `status` as it moves: `todo → in_review → done` (or `blocked`).

**Legend** — Priority: `P0` critical path · `P1` high · `P2` nice-to-have.
Status: `todo` · `in_review` · `done` · `blocked`.
`⚠ API` = may need a `liulian-python`/`liulian-api` change → if so, **surface it, build the
web side against a stub/localStorage/mock, do not edit Python** (Guardrail 1).

Card shape: **ID · title** — *why* · **accept:** done-criteria · **files:** · **verify:** ·
`prio` `deps` `status`.

---

## Phase W0 · Foundation & deploy reliability  (unblocks everything)

- **W0-01 · Repair the local dev path so `pnpm dev` boots** — the NTFS mount has a dead
  Windows junction for `node_modules/next`; the real app can't run locally.
  **accept:** one documented, reproducible path where `/forecast` serves locally (HTTP 200)
  — either (a) run inside `.devcontainer` (bump base to the version in `package.json`
  engines / CI matrix), or (b) relocate `node_modules` to an ext4 path and bind-mount, or
  (c) a `pnpm` reinstall that survives the mount. Write the chosen path into `README.md` §2.
  **files:** `.devcontainer/Dockerfile`, `README.md`, maybe a `scripts/dev-linux.sh`.
  **verify:** `curl :3000/forecast → 200`; screenshot the live route. `P0` deps:— `in_review`
  **DONE 2026-06-27** (chose option **c**): `scripts/dev-linux.sh` does a clean
  `node-linker=hoisted` + `package-import-method=copy` install with the pnpm store on ext4
  (no symlinks → immune to the dead Windows junctions), then `next dev` with
  `WATCHPACK_POLLING=true` for fuseblk. Verified `/forecast` + `/` → HTTP 200; screenshot
  `verify/W0-01-forecast-2026-06-27.png`. README "Develop the real Next.js app" updated.
  PR open on `feat/web-w0-01-dev-path-2026-06-27` (no auto-merge).
- **W0-02 · Playwright visual-regression harness for the demo** — lock the 12 pages + 4
  popups so future runs catch regressions.
  **accept:** a script screenshots all pages + Agent drawer / Command palette / Guides /
  Project picker at 1440×980 and writes to `verify/`; a baseline set is committed; a diff
  mode flags changes. **files:** `scripts/visual-regression.mjs`, `verify/baseline/*`.
  **verify:** run it twice → 0 diffs on an unchanged demo. `P0` deps:— `in_review`
  **DONE (increment 1) 2026-06-27:** `e2e/visual-regression.spec.ts` +
  `playwright.visual.config.ts` (`pnpm test:visual`) screenshot the **6 top-level demo
  surfaces** (`docs/*.html`, full-page, 1440×980) via `file://` — no server, deterministic.
  Baselines committed to `verify/baseline/*.png`; tolerant diff (maxDiffPixelRatio 0.01),
  non-zero exit on change. **Verified:** generate → re-check = **6 passed, 0 diffs**; an
  injected probe correctly **failed** the run (proves it catches regressions).
  **Deferred (increment 2, still `todo` on this card):** the 4 in-SPA popups of
  `web-demo.html` (Agent drawer / Command palette / Guides / Project picker) need per-popup
  open steps — next visual-regression run.
- **W0-03 · CI green + IOU audit** — confirm `liulian-web` Actions are green; fix or
  ticket each failure. **accept:** latest run green, or each red documented in the federation
  ci-skips ledger with a fix card here. **files:** `.github/workflows/*`. **verify:**
  `gh run list` green. `P1` deps:— `todo`
- **W0-04 · Single source of truth for design tokens** — the demo's `:root` vars and the
  app's `packages/design-tokens` must not drift.
  **accept:** one canonical token file; demo + app both derive from it (build step or shared
  import); a token change shows in both. **files:** `packages/design-tokens/**`,
  `docs/web-demo.html`. **verify:** change `--bern`, see it in both surfaces. `P1` deps: W0-01 `todo`
- **W0-05 · Prove the daily loop once, end-to-end** — run PROTOCOL on the smallest real
  card (e.g. W1-10) to validate select→build→verify→log→PR. **accept:** one merged PR + one
  LEDGER entry produced strictly by the loop. `P1` deps: W0-02 `todo`

## Phase W1 · Forecast canvas to spec  (the flagship surface)

- **W1-01 · SpecDrawer** — wire the `</>` button to a drawer showing the active panel's
  `LiulianChartSpec` JSON (read-only v1). **accept:** click `</>` on `#fan` → drawer shows
  valid spec; Esc closes; matches R8 §6 fields. **files:** `app/forecast/**`,
  `docs/pages/forecast.jsx`. **verify:** screenshot drawer open. `P0` deps: W0-01 `todo`
- **W1-02 · Generic `<ChartPanel>` + spec render layer** — charts render from
  `LiulianChartSpec`, not bespoke code. **accept:** one `<ChartPanel spec=…>` renders
  `line|area|bar|fan` from spec; `#fan` migrated to it. **files:** `app/forecast/components/`.
  **verify:** spec→render round-trip; `#fan` visually unchanged. `P0` deps: W1-01 `todo`
- **W1-03 · ChartPicker real type-swap** — picker swaps chart type via `<ChartPanel>`, not
  just re-tinting. **accept:** pick bar/area/scatter → panel re-renders that type from spec.
  **files:** `app/forecast/**`. **verify:** screenshot each type. `P0` deps: W1-02 `todo`
- **W1-04 · Counterfactual fan overlay** — the Δ scenario band is computed but not drawn.
  **accept:** scenario toggle overlays a second translucent band + Δ legend on `#fan`.
  **files:** `app/forecast/**`. **verify:** screenshot overlay on/off. `P1` deps: W1-02 `todo`
- **W1-05 · Live `#corr` correlation panel** ⚠ API — currently static.
  **accept:** `#corr` renders from `/stations/correlation` (30-day window); if the endpoint
  is absent → build against a typed mock + log `INTERVENTION NEEDED: add /stations/correlation`.
  **files:** `app/forecast/**`, `lib/api`. **verify:** matrix renders, hover reads ρ. `P1`
  deps: W1-02 `todo`
- **W1-06 · Footnote → panel-id anchors** — agent footnotes scroll to + flash the source
  panel (F4). **accept:** clicking a `<sup>` footnote scrolls to its `#panel` and pulses the
  hairline. **files:** `app/forecast/**`. **verify:** screen-record/scroll proof. `P1`
  deps: W1-02 `todo`
- **W1-07 · Save/load dashboards** ⚠ API — header says "unsaved", no persistence.
  **accept:** "Save" stores the dashboard (panels + specs) and reloads it; v1 may use
  `localStorage` + a documented `/dashboards` contract for the backend; log the API need.
  **files:** `app/forecast/**`, `lib/dashboards.ts`. **verify:** save → reload → restored.
  `P0` deps: W1-02 `todo`
- **W1-08 · Per-cell edit → re-derive** — `liulian:table-edit` is dispatched but unheard.
  **accept:** editing a `#table` cell recomputes dependent panels < 200 ms with a diff badge.
  **files:** `app/forecast/**`. **verify:** edit a value, see fan update. `P1` deps: W1-02 `todo`
- **W1-09 · Real model inference** ⚠ API — replaces `_synth_fan`/linear-fit substitute.
  **accept:** `#fan` shows a real forecast from `liulian-api` for swiss-river-1990; if no
  inference endpoint → keep synth, log `INTERVENTION NEEDED: forecast inference endpoint`.
  **files:** `lib/api`, `app/forecast/**`. **verify:** values match an API call. `P2`
  deps: W1-02 `todo`
- **W1-10 · `流` easter egg in live ECharts** — present in mock, not in the real chart (max
  once per session). **accept:** a single subtle `流` mark appears once on the live fan.
  **files:** `app/forecast/**`. **verify:** screenshot. `P2` deps: W1-02 `todo`

## Phase W2 · Data & Visualize surfaces  (user stories 2/4/5/6)

- **W2-01 · `/datasets/new` 3-tab import + schema preview** (Annotated Drop) — file / URL /
  demo, show schema + sample + quality before commit. **accept:** drop CSV → schema + first
  rows + quality % render; commit is gated. **files:** `app/(workspace)/datasets/new/**`.
  **verify:** import the bundled swiss-river CSV. `P0` deps: W0-01 `todo`
- **W2-02 · Schema editor with anchored agent annotations** (F1/F4) — annotations sit on
  schema rows. **accept:** each inferred type/issue is anchored to its row with a one-line
  why + `[apply]`. **files:** `datasets/new/**`. **verify:** screenshot. `P1` deps: W2-01 `todo`
- **W2-03 · Cell-edit diff strip + undo** (Pencil, F5) — edit a cell, see diff + one-click
  undo. **accept:** edit → diff strip entry → undo restores. **files:** data table component.
  **verify:** edit/undo proof. `P1` deps: W2-01 `todo`
- **W2-04 · Intent-extend preview layer** (Pencil, F2/F3) — one edit → "23 similar"
  candidates as a preview layer. **accept:** after an outlier edit, agent offers N candidates
  in a dotted preview; accept/reject. **files:** data table + agent glue. **verify:**
  screenshot preview. `P2` deps: W2-03 `todo`
- **W2-05 · Extend-dataset modal + graft-alignment canvas** (Graft, F3) — append / derived /
  join, with a two-track drag-to-align canvas. **accept:** open extend → align two series by
  drag → correlation recomputes live. **files:** `datasets/**`. **verify:** screenshot align.
  `P2` deps: W2-01 `todo`
- **W2-06 · Visualize studio Code/Canvas/Sketch → `LiulianChartSpec`** (Easel) — three
  authoring tabs, all producing one spec. **accept:** each tab yields the same canonical
  spec for a line chart; Code edits JSON, Canvas builds it, Sketch stubs it. **files:**
  `app/(workspace)/visualize/**`. **verify:** spec parity across tabs. `P0` deps: W1-02 `todo`
- **W2-07 · Sketch-to-chart loop** (Easel, F6) — draw a curve, agent paints an interpretation
  stroke back, confirm → real chart. **accept:** sketch → ghost stroke → `[render]` → bound
  chart. **files:** `visualize/**`. **verify:** screen-record. `P2` deps: W2-06 `todo`

## Phase W3 · Agent fused-mode  (the headline — F1–F6 on real surfaces)

- **W3-01 · Anchored agent bubbles** (F1) — agent speaks AT a panel, not in a rail.
  **accept:** an agent message can anchor to `#fan`/a cell with a connector. **files:**
  `app/forecast/**`, agent components. **verify:** screenshot anchored bubble. `P0` deps: W1-02 `todo`
- **W3-02 · Predictive prefetch on dwell** (F2) — hover 1 s → preload drill-down; click is
  instant. **accept:** dwell triggers a cached fetch; click renders from cache. **files:**
  agent/data glue. **verify:** network trace shows prefetch. `P1` deps: W3-01 `todo`
- **W3-03 · Visible-reasoning footnote component** (F4) — every suggestion carries a why +
  footnote (reusable). **accept:** a `<Reasoned>` wrapper renders why + clickable footnote
  (ties to W1-06). **files:** agent components. **verify:** screenshot. `P0` deps: W1-06 `todo`
- **W3-04 · Reversible diff + undo standard** (F5) — every agent change shows a diff + undo.
  **accept:** a shared `AgentDiff` primitive used by ≥2 surfaces. **files:** agent components.
  **verify:** apply + undo. `P1` deps: W3-01 `todo`
- **W3-05 · Shared-cursor pencil** (F6) — agent marks cells/charts in a distinct colour
  alongside the user. **accept:** agent highlight uses a non-red distinct mark; coexists with
  user selection. **files:** canvas/table. **verify:** screenshot both cursors. `P1` deps: W3-01 `todo`
- **W3-06 · Ghost-panel proposal flow** ⚠ API — `panel_proposal` SSE → preview → accept.
  **accept:** agent proposes a panel as a dashed ghost; accept inserts it, dismiss removes;
  v1 may drive from a mock SSE; log the event-contract need. **files:** `app/forecast/**`,
  agent SSE client. **verify:** propose→accept screenshot. `P0` deps: W3-01 `todo`
- **W3-07 · SSE event-extension handler** ⚠ API — handle `navigate/prefetch/recommend/widget/
  annotation/pencil/panel_create/panel_callout/highlight/preview_layer/intent_classified`.
  **accept:** a typed client dispatches each event to the right surface; unknown events
  no-op safely; document the contract for `liulian-agent`. **files:** `lib/agent/sse.ts`.
  **verify:** replay a fixture stream. `P1` deps: W3-06 `todo`
- **W3-08 · BI write-tools** ⚠ API — `add_panel` / `set_filter` callable by the agent.
  **accept:** agent tool-call adds a panel / sets a cross-filter on the live canvas; v1 from
  a mock tool result. **files:** agent glue. **verify:** screenshot result. `P2` deps: W3-07 `todo`

## Phase W4 · Public & science surfaces  (swiss-river-informed)

- **W4-01 · Forecast outlook card** — climatology **p10–p90 band + median**, **ecological
  thresholds 18 / 21 / 25 °C**, 1–8 week horizon (drought.ch-modeled). **accept:** a card on
  `/forecast` shows the outlook with the three threshold lines + horizon control. **files:**
  `app/forecast/**`. **verify:** screenshot vs the swiss-river HF outlook tab. `P1` deps: W1-02 `todo`
- **W4-02 · Station map + river-network topology overlay** — MapLibre, 28 stations colour-
  coded by water temp, topology edges drawn. **accept:** `#map` shows stations + edges;
  click selects a station (cross-filter). **files:** `app/forecast/**` map component.
  **verify:** screenshot map w/ topology. `P1` deps: W1-02 `todo`
- **W4-03 · Visualize quicklook gallery** — coverage heatmap · per-station error · window-
  length sweep · seasonality cards. **accept:** four cards render from real data in
  `/visualize`. **files:** `visualize/**`. **verify:** screenshot gallery. `P2` deps: W2-06 `todo`
- **W4-04 · Public read-only report pages** `/forecast/r/{slug}` — a saved dashboard as a
  shareable read-only page. **accept:** a saved dashboard renders at a slug URL with no edit
  chrome. **files:** `app/forecast/r/[slug]/**`. **verify:** open a slug. `P1` deps: W1-07 `todo`
- **W4-05 · Save & share (public link)** ⚠ API — generate a public link for a dashboard.
  **accept:** "Share" yields a copyable `/r/{slug}`; v1 localStorage + documented contract.
  **files:** `lib/dashboards.ts`. **verify:** share→open. `P2` deps: W4-04 `todo`
- **W4-06 · 3D river-network view** (optional) — three.js in a sandboxed iframe, stations by
  lon/lat, orbit controls. **accept:** a toggle shows a 3D network that orbits; isolated in
  an iframe (no bundle bloat). **files:** `public/network3d.html`, `app/forecast/**`.
  **verify:** screenshot 3D. `P2` deps: W4-02 `todo`

## Phase W5 · Polish · a11y · perf · i18n

- **W5-01 · `next-intl` scaffolding (EN/ZH/DE/FR)** — mirror swiss-river's 4 languages.
  **accept:** locale switch swaps UI copy; English is canonical; no hardcoded strings on the
  done surfaces. **files:** `messages/**`, `i18n.ts`. **verify:** switch locale. `P1` deps:— `todo`
- **W5-02 · WCAG AA pass** — focus states, aria, keyboard traps, contrast (ramp already
  measured). **accept:** axe/lighthouse a11y ≥ 95 on `/forecast`; full keyboard nav.
  **files:** across components. **verify:** lighthouse report. `P1` deps:— `todo`
- **W5-03 · Perf budget + motion audit** — transform/opacity only, no layout-trigger
  animations; LCP/CLS budgets. **accept:** lighthouse perf ≥ 90 on `/forecast`; no
  layout-animating CSS. **files:** across. **verify:** lighthouse + grep. `P2` deps:— `todo`
- **W5-04 · Automate the four self-tests in CI** — AI-slop / category-reflex / liulian-copy /
  gui-demo cross-check as lint rules where possible (emoji, em-dash, banned fonts, gradient
  text, `rounded-full` on cards). **accept:** CI fails on a banned pattern. **files:**
  `.github/workflows/**`, an eslint/grep gate. **verify:** introduce a ban, CI red. `P2` deps: W0-03 `todo`

## Phase W6 · Studio & multi-tenant prep

- **W6-01 · `/studio` Linear-meets-Bloomberg surface** — cmdk nav + dense tables, editorial-
  Swiss (ADR 0007). **accept:** `/studio` matches the spec aesthetic; cmdk jumps; one dense
  table renders. **files:** `app/studio/**`. **verify:** screenshot. `P1` deps: W0-01 `todo`
- **W6-02 · Clerk auth wiring** ⚠ API — `NEXT_PUBLIC_CLERK_*` envs, sign-in gate on
  workspace routes. **accept:** unauthenticated → sign-in; authed → workspace. **files:**
  `app/**`, middleware. **verify:** auth flow. `P2` deps: W0-01 `todo`
- **W6-03 · Dashboards persistence contract** ⚠ API — replace localStorage with
  `/dashboards` CRUD. **accept:** save/load/share hit the API; web migrates off localStorage.
  **files:** `lib/dashboards.ts`. **verify:** round-trip via API. `P2` deps: W1-07, W4-05 `todo`

---

## Bugs lane (B-xx)

Discovered defects get a `B-xx` card here and jump the queue at their priority.

- *(none yet — seed defects as found during runs)*
