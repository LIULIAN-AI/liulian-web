# LIULIAN Web — Master Roadmap

> **What this is.** The standing plan for the LIULIAN **web frontend** (`liulian-web`),
> authored to drive a *daily autonomous design/build run*. It pairs a long-term
> phase plan with a self-driving execution loop. One run = pick the next backlog
> card → build/fix it → verify → log → open a PR.
>
> **Author/owner:** the web design+deploy engineer agent. **Started:** 2026-06-24.

This folder is a closed loop of four files:

| File | Role | Who reads / writes it |
|---|---|---|
| [`README.md`](README.md) (this) | Vision · current state · phases · guardrails | Read first, every run |
| [`PROTOCOL.md`](PROTOCOL.md) | The daily-run SOP (pick → build → verify → log → PR) | Read second, every run |
| [`BACKLOG.md`](BACKLOG.md) | Prioritized, ~1-day-sized task cards with IDs | Pick the top unblocked card |
| [`LEDGER.md`](LEDGER.md) | Append-only daily progress log | Read the tail; append one entry per run |

**Daily loop in one line:** `README → PROTOCOL → BACKLOG (pick top unblocked) → build → verify → LEDGER (append) → PR`.

---

## 1 · North star

LIULIAN is an **open-source production stack for spatio-temporal AI** — a TS/ST-native
BI canvas with forecasting overlays and prediction intervals, an agent that "holds the
chalk," and sovereign (single-tenant, local-LLM-capable) deployment. The web app is the
**flagship surface**: the thing a first-time visitor, a domain analyst, an advisor, or a
hiring manager actually sees.

The web frontend's job, in priority order:

1. **Make the flagship `/forecast` canvas real** — not a mock. Live data, real model
   inference, save/share, the spec drawer, the agent rail.
2. **Ship the six user-story flows** (Doorway · Annotated Drop · First Light · Pencil ·
   Graft · Easel) in **Fused mode (C)** — the headline interaction grammar.
3. **Be visually unmistakable** — editorial-Swiss, UniBe red, Fraunces/Switzer/JetBrains
   Mono. A reviewer should say "I want to meet whoever built this."
4. **Deploy reliably** — a local dev path that boots, CI green, a public demo URL.

---

## 2 · Current state snapshot (2026-06-24)

**What's shipping**

- **Static web-demo** (`docs/web-demo.html` + `docs/{app,data,tweaks-panel}.jsx` +
  `docs/pages/*.jsx` + `docs/components/*.jsx`): a fully-clickable React-via-Babel mock of
  **12 pages** (Doorway · Today · Forecast · Data · Visualize · Train · Inference ·
  Reports · Models · Library · Agent · Settings). Served on GitHub Pages at
  `https://liulian-ai.github.io/liulian-web/web-demo.html`. English-only; a dismissible
  `PROTOTYPE` banner states it is a mock with synthetic data and the production system runs
  locally + is under active development. **This is the reliable deploy today.**
- **Real Next.js 14 app** (`app/`): `/forecast` (R5+R8 design implemented against real
  `liulian-api` swiss-river-1990 CSV), `/studio/{data,train,inference,insight}`,
  `(marketing)` landing. `packages/design-tokens/**`.

**What's mock or unbuilt** (the work) — see [`BACKLOG.md`](BACKLOG.md). The demo's actions
toast `(mock)`; the real `/forecast` has a known-gaps list (SpecDrawer, real ChartPicker
swap, counterfactual overlay, live `#corr`, save/load, per-cell re-derive, real
inference); `/studio` sub-pages are not yet redesigned to spec; the six user-story surfaces
are largely spec'd-but-unbuilt.

**Deploy reality (verified 2026-06-24)** — load-bearing constraint:

- The repo lives on an **NTFS mount** (`fuseblk /dev/sdb2 → /media/linlin/New Volume1`).
- `node_modules/` (1.7 GB) was installed under Windows; `node_modules/next` is a dead
  **Windows junction** (`unsupported reparse tag 0xa000000c`). From Linux, the `next`
  binary is unresolvable → **`pnpm dev` does not boot on this mount.**
- ✅ The **static web-demo deploys fine** (zero deps; HTTP 200 locally and on Pages).
- ❌ The **real Next.js app cannot run locally on the NTFS mount** until the dev
  environment is repaired. Escape hatches: (a) `.devcontainer/Dockerfile` (Linux fs — but
  it pins `node:18`; verify required version), (b) a Linux-native `node_modules` on the
  ext4 root (`/`, ~33 GB free) via a bind/symlink, (c) keep iterating on the static demo
  for surfaces that don't need the API. **`W0-01` makes this decision.**

---

## 3 · How swiss-river informs this roadmap

The **Swiss River Network Benchmark** (`github.com/jajupmochi/swiss-river-network-benchmark`,
ICPR 2026, MIT) is a **separate product** — it shares an author and a portfolio shelf with
LIULIAN, not code or branding. But it is the **single best design reference** we have,
because its Hugging Face Gradio "workbench" already ships the exact science surfaces
LIULIAN's `/forecast` and `/visualize` aim at, and **`swiss-river-1990` is already
LIULIAN's flagship demo dataset**. Borrow the *design ideas*, not the code:

- **Forecast outlook** modeled on [drought.ch](https://drought.ch): day-of-year climatology
  **p10–p90 band + median**, **ecological threshold lines at 18 / 21 / 25 °C**, 1–8 week
  horizon. → LIULIAN `W4` forecast-outlook card.
- **Station map + river-network topology overlay**, stations colour-coded by water
  temperature; **folium/leaflet over GeoLibre** (GeoLibre is not Gradio-embeddable). → our
  `#map` panel (MapLibre GL) + topology overlay (currently deferred).
- **3D river network** (three.js, sandboxed iframe; stations by lon/lat, orbit controls). →
  optional `W4` "network 3D" view.
- **Coverage heatmap, per-station error, window-length sweep, seasonality** → `/visualize`
  quicklook gallery cards.
- **4-language docs** (EN/ZH/DE/FR) → our i18n target (`W5`).

> Guard: swiss-river is MIT and lives in a different repo. We **reference its design**, we
> do not import its code, and we keep LIULIAN's own editorial-Swiss identity. Do not blur
> the two brands in LIULIAN surfaces.

---

## 4 · Long-term phases (web-scoped, mapped to platform M1–M6)

Each phase is a theme, not a date. A phase is "done" when its backlog cards are merged and
verified. Phases overlap; `W0` unblocks everything else.

| Phase | Theme | Maps to | Definition of done |
|---|---|---|---|
| **W0** | **Foundation & deploy reliability** | M1/M2 | `pnpm dev` boots locally (or via container); CI green; design-tokens consumed by app; a playwright visual-regression harness exists; the daily loop is proven once end-to-end. |
| **W1** | **Forecast canvas to spec** | M2 | The R5/R8 known-gaps on `/forecast` are closed: SpecDrawer, real ChartPicker swap via `LiulianChartSpec` + generic `<ChartPanel>`, counterfactual fan overlay, live `#corr`, footnote→panel anchors, save/load dashboards, per-cell edit re-derive, real model inference via API. |
| **W2** | **Data & Visualize surfaces** | M2 | User stories 2/4/5/6 ship: `/datasets/new` 3-tab import + schema editor (Annotated Drop), cell-edit diff strip (Pencil), extend-dataset + graft-alignment canvas (Graft), Visualize studio Code/Canvas/Sketch → `LiulianChartSpec` (Easel). |
| **W3** | **Agent fused-mode (the headline)** | M2/M5 | F1–F6 implemented on real surfaces: anchored bubbles, prefetch, visible-reasoning footnotes, reversible diffs, shared-cursor pencil, ghost-panel proposal flow; SSE event extensions; BI write-tools (`add_panel`/`set_filter`). |
| **W4** | **Public & science surfaces** | M2/M3 | swiss-river-informed: forecast outlook w/ ecological thresholds, station map + topology overlay, coverage heatmap, per-station error, window sweep; public read-only reports (`/forecast/r/{slug}`); save & share. |
| **W5** | **Polish · a11y · perf · i18n** | M3 | Motion discipline (transform/opacity only), WCAG AA, perf budgets, `next-intl` (EN/ZH/DE/FR), the four self-tests automated in CI. |
| **W6** | **Studio & multi-tenant prep** | M3 | `/studio` Linear-meets-Bloomberg surface (cmdk, dense tables), Clerk auth wiring, dashboards persistence contract with `liulian-api`. |

---

## 5 · Guardrails (hard rules for every run)

1. **`liulian-python` is READ-ONLY.** Never edit it. If a web task genuinely needs a
   Python change (new API field, endpoint, schema), **STOP and surface it** as an
   `INTERVENTION NEEDED` line in the LEDGER + the turn report. Do not execute the change.
2. **Design bans (auto-block).** No `#000`/pure-white body; ≤ 2 UniBe reds per viewport
   (≤ 3 on an alert ribbon); red never as button fill or background; 1 px hairlines only;
   motion = `transform`+`opacity`, ease-out-quart, no bounce. **Never:** gradient text,
   glassmorphism, side-stripe borders > 1 px, the big-number+label+sparkline hero template,
   identical card grids, modal-as-first-thought, `rounded-full` on cards/primary buttons,
   emoji in copy, em-dashes in user copy, AI-cliché copy (Elevate/Seamless/Unleash/Next-Gen/
   Game-changer/Delve), placeholder names (use real Swiss-river station codes).
3. **Fonts:** Fraunces (display) · Switzer (body) · JetBrains Mono (numbers/code). Never
   Inter/Roboto/Open Sans.
4. **Stay in scope.** Web work only. Adjacent improvements get logged as new backlog cards,
   not done inline.
5. **Verify before claiming.** A card is "done" only after a real run + a playwright
   screenshot vs the reference + 0 app console errors. See [`PROTOCOL.md`](PROTOCOL.md) §4.
6. **Branch + PR.** Each run works on `feat/web-<cardid>-<date>`; opens a PR; never pushes
   straight to `main`.

---

## 6 · Cross-references

- Web design specs: `docs/specs/2026-05-20-forecast-redesign-design.md` (R5),
  `docs/specs/2026-05-21-forecast-dashboard-design.md` (R8). Round notes:
  `docs/redesign-2026-05-2{0,1}/`.
- F1–F6 defined in `docs/data.jsx:199–206`; demo pages `docs/pages/*.jsx`; tokens
  `packages/design-tokens/**`; implementation `app/forecast/**`.
- Platform vision / ADRs / user-stories: `liulian-docs/docs/strategy/` + `docs/user-stories/`.
- Federation task ledger: `liulian-docs/docs/tasks/liulian-web/<YYYY-MM>.md` (keep in sync
  when a phase completes).
- swiss-river reference: `github.com/jajupmochi/swiss-river-network-benchmark`,
  `huggingface.co/spaces/jajupmochi/swiss-river-network-benchmark`.
