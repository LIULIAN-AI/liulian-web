# LIULIAN Web — Daily Progress Ledger

> Append-only. One entry per autonomous run. **Read the last 3 entries at pre-flight**
> ([`PROTOCOL.md`](PROTOCOL.md) §0); **append a new entry at step 5**. Newest at the
> bottom. Never rewrite history — correct via a new entry.

### Entry template (copy this)

```
## <YYYY-MM-DD> · <cardid(s)> · <one-line title>
- **Picked:** <cardid + why it was top of the queue>
- **Did:** <files touched, one line each: path — change>
- **Verify:** <ran X → result; screenshot verify/<cardid>-*.png; console N errors; self-tests>
- **Status:** <cardid → in_review/done>
- **Next up:** <the cardid the next run should pick, per BACKLOG ordering>
- **Blockers / INTERVENTION NEEDED:** <none | the specific liulian-python/API need, NOT executed>
- **PR:** <url or "not opened (reason)">
```

---

## Entries

## 2026-06-24 · Day 0 · Roadmap bootstrap + deploy verification
- **Picked:** Standing-up run. Goal: read all design docs, mine the swiss-river open-source
  session, verify local deployment, and author a roadmap usable for daily autonomous runs.
- **Did:**
  - Read (via 3 parallel agents) the full design corpus: `liulian-web/docs/specs/{R5,R8}` +
    redesign rounds; `liulian-docs/docs/strategy/{PLATFORM_BLUEPRINT, ONE_WEEK_SPRINT,
    NEOBANKER_REUSE_MAP}` + 11 ADRs + 6 user-stories; mined the swiss-river-network-benchmark
    Claude sessions + portfolio site for its open-source/web design.
  - `docs/roadmap/README.md` — master roadmap: north star, current-state snapshot, deploy
    reality, swiss-river design-reference section, 7 web phases (W0–W6), guardrails.
  - `docs/roadmap/PROTOCOL.md` — the daily-run SOP (pre-flight → select → plan → build →
    verify → log → ship), hard stops, run-quality skills.
  - `docs/roadmap/BACKLOG.md` — ~40 cards across W0–W6, each with accept/files/verify/deps;
    API-dependent cards flagged `⚠ API` with stub fallbacks.
  - `docs/roadmap/LEDGER.md` — this file.
- **Verify:**
  - **web-demo (static):** served `docs/` on a local port → `web-demo.html` HTTP 200; the
    GitHub Pages copy also serves (verified in the prior session). Reliable deploy path. ✓
  - **Next.js app:** `pnpm dev` **FAILS** — `Cannot find module .../node_modules/next/dist/
    bin/next`. Root cause: NTFS mount (`fuseblk /dev/sdb2`), `node_modules/next` is a dead
    Windows junction (`reparse tag 0xa000000c`) from a cross-OS install. Documented in
    README §2; becomes card **W0-01**. ✗ (expected; not a regression)
  - Tooling present: pnpm 9.15.9, node v22, node_modules 1.7 GB (but symlink-broken on this
    mount). ext4 root `/` has ~33 GB free (a viable relocation target for W0-01).
  - **Dev-env repair done today:** git showed **all 730 tracked files as modified** — pure
    filemode churn (`100644 → 100755`; NTFS/fuseblk reports every file executable). Fixed
    locally with `git config core.fileMode false` (reversible, untracked). `git status` now
    clean. Fold the canonical fix into W0-01.
- **Status:** roadmap authored (4 files). Tasks P0–P5 of the bootstrap complete.
- **Next up:** **W0-01** (repair local dev path) — it is the top P0 and gates all `app/**`
  cards. If a run wants a `docs/`-only win first, **W0-02** (visual-regression harness) is
  unblocked and safe.
- **Blockers / INTERVENTION NEEDED:** none yet. Note for future cards: `W1-05/07/09`,
  `W3-06/07/08`, `W4-05`, `W6-02/03` may need `liulian-api`/`liulian-agent` contracts —
  those are **separate repos** (not `liulian-python`, which is read-only); still, surface any
  backend need in the entry and build the web side against a stub first.
- **PR:** to be opened for the roadmap docs (`feat/web-roadmap-2026-06-24`).

## 2026-06-27 · W0-01 · Repair the local dev path so `pnpm dev` boots
- **Picked:** W0-01 — top P0 of W0, deps `—`, gates every `app/**` card. First true
  autonomous run (2026-06-24 was the install/bootstrap).
- **Did:**
  - `scripts/dev-linux.sh` (new) — idempotent boot for an NTFS/fuseblk working copy:
    clean `pnpm install --node-linker=hoisted --package-import-method=copy` with the store on
    ext4 (`~/.cache/liulian-web/pnpm-store`), then `next dev` with `WATCHPACK_POLLING=true`.
    Reinstalls only when `node_modules` is missing or has dead symlinks.
  - `README.md` — new subsection under "Develop the real Next.js app" documenting the
    NTFS path + the helper.
  - `docs/roadmap/BACKLOG.md` — W0-01 → `in_review` with the DONE note.
  - Reclaimed 1.7 GB: removed the dead Windows `node_modules` (regenerable, gitignored).
- **Verify:** `curl :3000/forecast → HTTP 200` and `curl :3000/ → 200` (real boot, Next.js
  14.2.35 compile logs); re-ran via `scripts/dev-linux.sh` on :3001 → `/forecast` 200;
  `node_modules` has **0 dead symlinks** (was 92); screenshot
  `verify/W0-01-forecast-2026-06-27.png` shows the full forecast canvas rendering.
- **Status:** W0-01 → `in_review` (acceptance met; PR not merged — autopilot does not auto-merge).
- **Next up:** **W0-02** (Playwright visual-regression harness; P0, deps `—`, now unblocked
  because the app boots) — or the F0 per-repo health sweep.
- **Blockers / INTERVENTION NEEDED:** none. No `liulian-python` change needed (pure
  dev-env / tooling fix). Note: HMR on fuseblk relies on polling (inotify unreliable) — a
  known trade-off, documented, not a blocker.
- **PR:** to be opened on `feat/web-w0-01-dev-path-2026-06-27` (no auto-merge).
