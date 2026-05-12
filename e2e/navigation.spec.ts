import { test, expect } from '@playwright/test';

test.describe('navigation', () => {
  test('navigating between pages preserves layout', async ({ page }) => {
    await page.goto('/homepage');
    const navVisible = await page.locator('nav, header').first().isVisible();
    expect(navVisible).toBe(true);

    await page.goto('/bank-info/demo-bank/overview');
    const navStillVisible = await page.locator('nav, header').first().isVisible();
    expect(navStillVisible).toBe(true);
  });

  test('404 page does not crash', async ({ page }) => {
    const response = await page.goto('/nonexistent-route-xyz');
    expect(response).toBeTruthy();
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });
});
