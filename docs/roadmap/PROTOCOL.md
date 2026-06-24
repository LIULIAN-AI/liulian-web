# Daily Autonomous Run — Protocol (SOP)

> The standard operating procedure for one daily design/build run on `liulian-web`.
> Read [`README.md`](README.md) first. This file is the loop the run executes.
> Optimised so a future agent (or this one) can run it **start-to-finish without
> further instructions**.

```
0. PRE-FLIGHT   → 1. SELECT → 2. PLAN → 3. BUILD → 4. VERIFY → 5. LOG → 6. SHIP
        ↑___________________________ (next day) ______________________________|
```

---

## 0 · Pre-flight (always)

1. **Read state:** `README.md` §2 (current state) + the **last 3 entries** of
   [`LEDGER.md`](LEDGER.md). The ledger tail tells you what shipped, what's in-flight, and
   any blockers.
2. **Confirm repo + branch:** `cd liulian-web`; you are on `main` updated, or create the
   run branch in step 6. Never start from a stale branch.
3. **Confirm a working preview path** (see README §2 deploy reality):
   - Static-demo cards (most `docs/`-only UI work): `cd docs && python3 -m http.server 8950`
     → `http://127.0.0.1:8950/web-demo.html`. Always available (zero deps).
   - Real-app cards (`app/**`, needs API/data): requires `pnpm dev` to boot. If it does not
     (NTFS/junction issue), the **only** valid first card is `W0-01` (fix the dev path); do
     not attempt app-route cards until `W0-01` is merged.
4. **Reaffirm guardrails:** `liulian-python` is read-only; design bans; scope = web only.

## 1 · Select the card

- Open [`BACKLOG.md`](BACKLOG.md). Pick the **top card whose status is `todo` and whose
  `deps` are all `done`**, honoring priority order (P0 > P1 > P2) then phase order
  (W0 > W1 > …).
- If the top card is blocked by a needed `liulian-python` change → **skip it**, log the
  block, and take the next unblocked card. Surface the Python need (do not execute it).
- One card per run is the default. Only take a second card if the first was trivial
  (< 30 min) and fully verified.

## 2 · Plan (internal, ≤ 5 lines)

Restate the card's intent in one sentence. List the **exact files** you'll touch and the
**one** user-visible change. Trace callers (whole-project context): a change to a shared
component must keep every page that uses it working. Prefer the smallest modular change.
(In autorun this plan is internal — no approval pause.)

## 3 · Build

- **Match the surrounding code.** The demo is React-via-Babel single files in `docs/`; the
  real app is Next.js 14 + TypeScript in `app/`. Use the idiom of the file you're in.
- **Use design tokens, never hardcode brand values.** Pull from `packages/design-tokens`
  (app) or the `:root` vars in `docs/web-demo.html` (demo). Respect the bans (README §5).
- **Fused-mode discipline (F1–F6)** for any agent-touching surface:
  F1 anchor at the canvas · F2 prefetch on dwell · F3 spec↔control sync · F4 one-sentence
  why + footnote · F5 diff + undo · F6 shared-cursor pencil.
- **Charts render from `LiulianChartSpec`** — never hand-place pixels. New chart types go
  through the generic `<ChartPanel>` + spec layer.
- **Config-like data → config files**, not hardcoded in components (chart presets, panel
  registries, thresholds), so a non-coder can edit them.
- **Externalize, don't duplicate.** Reuse atoms/components; if you copy a block twice,
  extract it.

## 4 · Verify (no claim without evidence)

A card is **not done** until all of these pass — record each in the LEDGER entry:

1. **It runs.** Static card: served page renders. App card: route compiles and loads.
2. **Playwright screenshot vs reference.** Capture the changed surface at the canonical
   viewport (**1440 × 980**, `fullPage:false`); compare against the matching reference
   screenshot (`docs/screenshots/` or the handoff PNGs). Save the new shot under
   `verify/<cardid>-<surface>.png`.
3. **0 app console errors** (an unrelated `favicon.ico` 404 is acceptable; nothing else).
4. **The four self-tests** (from the redesign protocol):
   - *AI-slop* — would someone say "AI made that"? If yes, rework.
   - *category-reflex* — did you reach for the obvious dashboard cliché? Avoid.
   - *liulian-copy* — copy uses real station codes, no AI clichés, no em-dashes.
   - *gui-demo cross-check* — does it match the editorial-Swiss canon?
5. **Bans scan** — grep the diff for the absolute bans (gradient text, side-stripe > 1px,
   `rounded-full` on cards, emoji in copy, `#000`/`#fff`). Zero hits.
6. **(App cards) types + lint** if `pnpm` is available: `pnpm exec tsc --noEmit`,
   `pnpm lint`. If the dev path is unrepaired, note "types unverified — dev env blocked".

> Invoke the `code-verifier` discipline before writing "done": did the run really happen,
> is it genuine, does it exercise the claim?

## 5 · Log (append one LEDGER entry)

Append to [`LEDGER.md`](LEDGER.md) — newest at the **bottom of the in-progress section**,
using the template at the top of that file. Required fields: date, card id(s), what
changed (files + one-line each), verification result (with the screenshot path), next-up,
blockers / `INTERVENTION NEEDED`. Update the card's `status` in `BACKLOG.md`
(`todo → in_review → done`).

## 6 · Ship

- Branch: `feat/web-<cardid>-<YYYY-MM-DD>` (e.g. `feat/web-W1-03-2026-06-25`).
- Commit message: `<type>(web): <card title> [<cardid>]` + body (what/why/verify) +
  the standard co-author + session trailers.
- Open a PR to `main` with the verification screenshots attached. Do **not** auto-merge
  unless the run was explicitly told it may; leave for review by default.
- If CI is wired and green, the PR may be squash-merged on the next run's pre-flight after
  a human ack, or per the day's instruction.

---

## Hard stops (end the run, surface to the user)

- A card needs a `liulian-python` change → log `INTERVENTION NEEDED`, do not edit Python.
- An irreversible/high-blast-radius action (force-push, delete remote, drop data, send
  external messages) not pre-authorized.
- The dev environment can't be made to preview the card and it's not a `W0` card → take a
  `docs/`-only card instead, or stop and report.
- Three verification attempts fail on the same card → stop, log the failure mode, move on.

## Run-quality skills to invoke (cheap, use liberally)

- `code-verifier` — before any "done"/"works"/"passing" claim.
- `research-critic` — only if the card asserts a measured result (rare for web).
- `impeccable` / `minimalist-ui` compliance tables — for any net-new visual surface.
- `superpowers:verification-before-completion` — gate before the PR.
