# Round 8 — Synthesis + lock

Date: 2026-05-21 · file: `round-8.html` · screenshot: `round-8.png`

R8 keeps everything in R7 and locks the design baseline. No new structural
ideas — only the finishing touches before implementation.

## What changed from R7

1. **Save / load badge in run-header.** Second green-bordered pill:
   `dashboard v3 · saved 2 min ago`. `s` keyboard hint added.
2. **Annotation chip clipped to chart area.** R7's chip sat at top-30 %
   which collided with the spec drawer on narrower viewports. R8 moves
   it inside the chart bounds at 38 %/42 %, with `max-width: 90%` and
   `chart-area { overflow: hidden }` so it can never bleed into the
   drawer.
3. **A11y on the spec drawer.** `<aside role="region"
   aria-labelledby="drawer-title">` + `role="tablist"` on the tabs +
   `aria-selected` on each tab + `aria-label="Close spec drawer"` on
   the × button.
4. **A11y on the drawio modal.** `<div role="dialog"
   aria-labelledby="canvas-title" aria-modal="true">` + visible
   `<kbd>esc</kbd>` close hint in the header. Focus trap is implementation-only.
5. **`<nav aria-label>` on the keyboard cluster.** The kbd-strip in the
   run-header right edge is announced as "keyboard shortcuts".

## Self-test (UI_AUDIT compliance)

All R7 checks still pass. R8 adds:

| Item | Status |
|---|---|
| Focus ring on every interactive (`:focus-visible` 2 px UniBe red) | ✅ |
| Reduced-motion guard | ✅ (inherited from R5 lock CSS) |
| Dialog has `role="dialog"` + `aria-modal="true"` | ✅ |
| Drawer has `role="region"` + `aria-labelledby` | ✅ |
| Tabs have `role="tablist"` + `aria-selected` | ✅ |
| Icon-only buttons have `aria-label` | ✅ |
| Esc-close hint visible inside the modal | ✅ |

## Four tests

| Test | Pass | Note |
|---|---|---|
| AI-slop | ✅ | "dashboard v3 · saved 2 min ago" + drawio canvas + spec drawer + chart picker + editable table is a specific combination — no SaaS template ships all five together |
| Category-reflex | ✅ | Warm canvas + UniBe red + Fraunces + WONK-U + 流 are still uniquely this brand; the new edit affordances don't pull the design toward any well-known editor |
| liulian-copy | ✅ | LiulianChartSpec schema, agent's "I won't recolor #fan, that would break the brand contract" pushback, single 流 easter egg → identifiably ours |
| cross-check vs R5/R6/R7 | ✅ | Every module preserved; new pieces additive |

## What R8 leaves to implementation

R8 is the spec-lock round. The accompanying spec doc
`docs/superpowers/specs/2026-05-21-forecast-dashboard-design.md` is the
authoritative reference for the implementation phase — it lists
every panel, every endpoint, every event, every key, the LiulianChartSpec
schema, the drawio postMessage protocol, the a11y requirements, and the
implementation file map (new components: `DataTablePanel`, `ChartPicker`,
`SpecDrawer`, `VectorCanvas`, plus `chartSpec.ts` type).

Implementation lands after the spec doc is approved.
