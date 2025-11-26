import { test } from '../fixtures/base';
import { CatalogPage } from '../pages/CatalogPage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe.serial('Setup: create initial rentals', () => {

  test('Create rentals via UI', async ({ page }) => {
    
    test.setTimeout(90000);

    const catalog = new CatalogPage(page);

    const reservations = [
      { start: '2025-12-05', end: '2025-12-09' },
      { start: '2025-12-10', end: '2025-12-15' },
      { start: '2025-12-16', end: '2025-12-20' },
      { start: '2025-12-21', end: '2025-12-25' }
    ];

    for (const r of reservations) {
      await catalog.goto();
      await catalog.assertCatalogLoaded();
      await catalog.openFirstProduct();

      await page.waitForLoadState('networkidle');
      await page.waitForSelector('[name="start"]', { timeout: 60000 });

      await page.fill('[name="start"]', r.start);
      await page.fill('[name="end"]', r.end);
      await page.fill('[name="name"]', 'Test User');
      await page.fill('[name="email"]', 'test@example.com');
      await page.fill('[name="phone"]', '099555555');
      await page.locator('[name="size"]').first().check();

      await page.getByRole('button', { name: /request rental/i }).click();
      await page.waitForURL(/.*success/);
    }
  });

});
