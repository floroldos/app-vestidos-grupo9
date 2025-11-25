import { Page, Locator, expect } from '@playwright/test';

export class HomePage {
    constructor(private page: Page) { }

    private header = this.page.locator('header, nav, [data-testid="navbar"]').first();
    private browse =
        this.page.getByRole('link', { name: /browse|explorar/i })
            .or(this.page.getByRole('button', { name: /browse|explorar/i }))
            .or(this.page.getByText(/browse|explorar/i));

    private firstViewDetails = this.page.getByRole('button', { name: /view details|ver detalles/i }).first();

    async goto() {
        await this.page.goto('http://localhost:3000/');
    }

    async assertBasicUI() {
        await expect(this.header).toBeVisible();
    }

    async goToCatalog() {
        if (await this.browse.first().isVisible().catch(() => false)) {
            await this.browse.first().click();
        } else {
            await this.page.goto('/browse');
        }
    }

    async openFirstProductIfVisible(): Promise<boolean> {
        if (await this.firstViewDetails.isVisible().catch(() => false)) {
            await this.firstViewDetails.click();
            return true;
        }
        return false;
    }

}
