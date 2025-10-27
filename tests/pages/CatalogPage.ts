import { Page, Locator, expect } from '@playwright/test';

export class CatalogPage {
    constructor(private page: Page) { }

    private firstViewDetails = this.page.getByRole('button', { name: /view details|ver detalles/i }).first();

    async goto() {
        await this.page.goto('/browse');
    }

    async assertCatalogLoaded() {
        await this.firstViewDetails.waitFor();
        await expect(this.firstViewDetails).toBeVisible();
    }

    async openFirstProduct() {
        await this.firstViewDetails.click();
    }
}
