import { defineConfig, devices } from '@playwright/test';

/**
 * Dedicated visual-regression config (card W0-02). Isolated from the main
 * `playwright.config.ts` so it does NOT spin up the Next.js dev server — the
 * static demo surfaces (`docs/*.html`) are self-contained and loaded via
 * `file://`, so the harness has zero runtime dependencies and is CI-portable.
 *
 * Baselines are committed under `verify/baseline/`; on a diff, Playwright's
 * tolerant pixel comparator writes the actual + diff PNGs under `test-results/`
 * and the run exits non-zero.
 *
 *   pnpm test:visual                 # check against committed baselines
 *   pnpm test:visual --update-snapshots   # re-baseline (after an intended UI change)
 */
export default defineConfig({
  testDir: './e2e',
  testMatch: 'visual-regression.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: [['list']],
  // Baselines are platform-scoped: verify/baseline/<platform>/<name>.png. Font
  // anti-aliasing differs across OSes, so a baseline made on one platform must
  // not be compared against another's — {platform} keeps them separate.
  snapshotPathTemplate: 'verify/baseline/{platform}/{arg}{ext}',
  use: {
    ...devices['Desktop Chrome'],
    viewport: { width: 1440, height: 980 },
    // Freeze anything non-deterministic so byte-stable baselines are possible.
    deviceScaleFactor: 1,
  },
  expect: {
    toHaveScreenshot: {
      // Small tolerance absorbs sub-pixel font AA across runs; a real change
      // (moved element, new copy, colour shift) still trips it.
      maxDiffPixelRatio: 0.01,
      animations: 'disabled',
      caret: 'hide',
    },
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
