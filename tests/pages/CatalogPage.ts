import { Page, Locator, expect } from '@playwright/test';

export class CatalogPage {
    constructor(private page: Page) { }

    get Page() {
        return this.page;
    }

    private firstViewDetails = this.page.locator('a[href^="/items/"]').first();
    private searchInput = this.page.getByPlaceholder('Search…');
    private categorySelect = this.page.getByRole('combobox', { name: 'category' });
    private styleInput = this.page.getByPlaceholder('Style (e.g., cocktail)');
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
        await this.firstViewDetails.waitFor({ state: 'visible', timeout: 20000 });
        await this.firstViewDetails.click({ timeout: 20000 });
        await this.page.waitForURL(/.*items\/.+/, { timeout: 20000 });
    }

    async searchByQuery(query: string) {
        await this.searchInput.waitFor({ state: 'visible', timeout: 20000 });
        await this.searchInput.fill(query, { timeout: 20000 });
        await this.searchButton.waitFor({ state: 'visible', timeout: 20000 });
        await this.searchButton.click({ timeout: 20000 });
    }

    async filterByCategory(category: string) {
        await this.categorySelect.waitFor({ state: 'visible', timeout: 20000 });
        await this.categorySelect.selectOption({ value: category }, { timeout: 20000 });
        await this.searchButton.waitFor({ state: 'visible', timeout: 20000 });
        await this.searchButton.click({ timeout: 20000 });
    }

    async applyComplexFilter(data: { query?: string; category?: string; style?: string }) {
        if (data.query) {
            await this.searchInput.waitFor({ state: 'visible', timeout: 20000 });
            await this.searchInput.fill(data.query, { timeout: 20000 });
        }
        if (data.category) {
            await this.categorySelect.waitFor({ state: 'visible', timeout: 20000 });
            await this.categorySelect.selectOption({ value: data.category }, { timeout: 20000 });
        }
        if (data.style) {
            await this.styleInput.waitFor({ state: 'visible', timeout: 20000 });
            await this.styleInput.fill(data.style, { timeout: 20000 });
        }
        await this.searchButton.waitFor({ state: 'visible', timeout: 20000 });
        await this.searchButton.click({ timeout: 20000 });
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
