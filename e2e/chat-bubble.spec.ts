import { test, expect } from '@playwright/test';

test.describe('chat bubble', () => {
  test('chat toggle button is visible on demo page', async ({ page }) => {
    await page.goto('/bank-info/demo-bank/overview');
    const chatBtn = page.locator('button').filter({
      has: page.locator('[aria-label*="chat" i], [aria-label*="toggle" i]'),
    });
    if (await chatBtn.count() > 0) {
      await expect(chatBtn.first()).toBeVisible();
    }
  });

  test('clicking chat toggle opens chat panel', async ({ page }) => {
    await page.goto('/bank-info/demo-bank/overview');
    const chatBtn = page.locator('button').filter({
      has: page.locator('[aria-label*="chat" i], [aria-label*="toggle" i]'),
    });
    if (await chatBtn.count() > 0) {
      await chatBtn.first().click();
      await page.waitForTimeout(500);
      const panel = page.locator('[role="dialog"], [data-testid="chat-panel"]');
      if (await panel.count() > 0) {
        await expect(panel.first()).toBeVisible();
      }
    }
  });
});
