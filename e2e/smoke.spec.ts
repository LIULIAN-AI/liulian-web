import { test, expect } from '@playwright/test';

test.describe('smoke tests', () => {
  test('homepage loads and contains page content', async ({ page }) => {
    await page.goto('/homepage');
    await expect(page).toHaveTitle(/.+/);
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('demo bank overview loads without backend', async ({ page }) => {
    await page.goto('/bank-info/demo-bank/overview');
    await expect(page.locator('body')).toBeVisible();
    const text = await page.textContent('body');
    expect(text?.length).toBeGreaterThan(0);
  });
});
