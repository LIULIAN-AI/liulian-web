import { test, expect } from '@playwright/test';
import { pathToFileURL } from 'node:url';
import path from 'node:path';

/**
 * Visual-regression lock for the static demo surfaces (card W0-02).
 *
 * Each demo page is a self-contained HTML file under `docs/` (no fetch / XHR),
 * so it is loaded directly via `file://` — no server, deterministic, CI-safe.
 * A baseline PNG per page is committed under `verify/baseline/`; future runs
 * fail if a page drifts beyond the tolerance set in `playwright.visual.config.ts`.
 *
 * Scope (this increment): the 6 top-level demo surfaces. The in-SPA popups of
 * `web-demo.html` (Agent drawer / Command palette / Guides / Project picker)
 * are a follow-up increment — they need per-popup open steps and are tracked
 * back on the W0-02 card.
 *
 * Determinism caveat: the demo pages reference webfonts from a CDN. Under
 * `file://` Chromium can still fetch them, so baselines are *network-dependent*
 * and *platform-dependent* (font AA differs per OS) — hence the platform-scoped
 * `snapshotPathTemplate` in the config and the `document.fonts.ready` wait below.
 * Re-baseline (`--update-snapshots`) on the same platform the check runs on.
 * A future increment can self-host the fonts to drop the network dependency.
 */

const DOCS_DIR = path.resolve(__dirname, '..', 'docs');

const PAGES: Array<{ name: string; file: string }> = [
  { name: 'index', file: 'index.html' },
  { name: 'web-demo', file: 'web-demo.html' },
  { name: 'standalone-landing', file: 'standalone-landing.html' },
  { name: 'standalone-forecast', file: 'standalone-forecast.html' },
  { name: 'standalone-studio', file: 'standalone-studio.html' },
  { name: 'mobile-preview', file: 'mobile-preview.html' },
];

for (const { name, file } of PAGES) {
  test(`demo surface: ${name}`, async ({ page }) => {
    const url = pathToFileURL(path.join(DOCS_DIR, file)).href;
    await page.goto(url, { waitUntil: 'networkidle' });
    // Let webfonts settle so glyph metrics are stable across runs.
    await page.evaluate(() => (document as any).fonts?.ready);
    await expect(page).toHaveScreenshot(`${name}.png`, { fullPage: true });
  });
}
