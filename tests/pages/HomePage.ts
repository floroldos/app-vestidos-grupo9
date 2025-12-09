import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
    constructor(private page: Page) { }

    private header = this.page.locator('header, nav, [data-testid="navbar"]').first();
    private browse =
        this.page.getByRole('link', { name: /browse|explorar/i })
            .or(this.page.getByRole('button', { name: /browse|explorar/i }))
            .or(this.page.getByText(/browse|explorar/i));

    private firstProductLink = this.page.locator('a[href^="/items/"], button[data-testid="view-details"]').first();

    async goto() {
        await this.page.goto('/');
    }

    async assertBasicUI() {
        await expect(this.header).toBeVisible();
    }

    async goToCatalog() {
        // Buscar el link "Browse" que apunta a /search
        const browseLink = this.page.locator('a[href="/search"]').first();
        if (await browseLink.isVisible({ timeout: 5000 }).catch(() => false)) {
            await browseLink.click();
            await this.page.waitForURL(/.*search/);
        } else {
            // Fallback: navegar directo a /search
            await this.page.goto('/search');
        }
    }

    async openFirstProductIfVisible(): Promise<boolean> {
        if (await this.firstProductLink.isVisible().catch(() => false)) {
            await Promise.all([
                this.page.waitForURL(/.*items\/[a-zA-Z0-9-]+/, { timeout: 10000 }),
                this.firstProductLink.click()
            ]);
            return true;
        }
        return false;
    }

}
