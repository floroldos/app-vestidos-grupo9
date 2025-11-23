import { Page, Locator, expect } from '@playwright/test';

export class CatalogPage {
    constructor(private page: Page) { }

    get Page() {
        return this.page;
    }

    private firstViewDetails = this.page.locator('a[href^="/items/"]').first();
    private searchInput = this.page.getByPlaceholder('Search…');
    private categorySelect = this.page.getByRole('combobox', { name: 'category' });
    private styleInput = this.page.getByPlaceholder('e.g. elegant');
    private searchButton = this.page.getByRole('button', { name: 'Search' });
    private noItemsMessage = this.page.getByText('No dresses found');

    async goto() {
        await this.page.goto('/search');
    }

    async assertCatalogLoaded() {
        await expect(this.page.getByRole('heading', { name: 'Browse catalog' })).toBeVisible();
        await this.page.waitForSelector('.grid.grid-cols-1');
    }

    async openFirstProduct() {
        await this.firstViewDetails.click();
        await this.page.waitForURL(/.*items\/.+/);
    }

    async searchByQuery(query: string) {
        await this.searchInput.fill(query);
        await this.searchButton.click();
    }

    async filterByCategory(category: string) {
        await this.categorySelect.selectOption({ value: category });
        await this.searchButton.click();
    }

    async applyComplexFilter(data: { query?: string; category?: string; style?: string }) {
        if (data.query) await this.searchInput.fill(data.query);
        if (data.category) await this.categorySelect.selectOption({ value: data.category });
        if (data.style) await this.styleInput.fill(data.style);
        await this.searchButton.click();
    }

    async assertResultsAreVisible() {
        await this.firstViewDetails.waitFor({ state: 'visible' });
        await expect(this.firstViewDetails).toBeVisible();
        await expect(this.noItemsMessage).not.toBeVisible();
    }

    async assertNoResults() {
        await expect(this.noItemsMessage).toBeVisible();
        await expect(this.firstViewDetails).toHaveCount(0);
    }
}
