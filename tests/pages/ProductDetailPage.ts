import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailPage {
    constructor(private page: Page) { }

    private anyImage: Locator = this.page.locator('img').first();
    private title: Locator = this.page.getByRole('heading').first().or(this.page.locator('h1,h2').first());
    private body: Locator = this.page.locator('main, article, section, body');

    async assertBasicDetail() {
        await expect(this.anyImage).toBeVisible();
        await expect(this.title).toBeVisible();
        await expect(this.body).toContainText(/(gown|dress|vestido|rentals|free cleaning|day)/i);
    }
}
