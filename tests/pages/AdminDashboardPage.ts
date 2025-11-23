import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
    constructor(private page: Page) { }

    private layout = this.page.locator('[data-testid="admin-dashboard"], main, #admin');
    
    private async scheduledRentalsTable(): Promise<Locator> {
        const tableBySection = this.page.locator('section:has(h2:has-text("Scheduled rentals")) table').first();
        if (await tableBySection.count() > 0) return tableBySection;

        const byHeading = this.page.locator('h2:has-text("Scheduled rentals"), h2:has-text("Scheduled Rentals"), h2:has-text("Scheduled Reservations")')
            .locator('xpath=following-sibling::div[1]//table').first();
        if (await byHeading.count() > 0) return byHeading;

        const byRole = this.page.getByRole('table', { name: /scheduled|rentals|reservations/i }).first();
        if (await byRole.count() > 0) return byRole;

        return this.layout.locator('table').first();
    }

    private async activeRows() {
        const table = await this.scheduledRentalsTable();
        return table.locator('tbody tr', { hasText: /active/i });
    };
    
    async goto() {
        await this.page.goto('/admin');
    }

    async assertHasActiveReservations() {
        const table = await this.scheduledRentalsTable();
        await expect(table).toBeVisible({ timeout: 15000 });
        const rows = await this.activeRows();
        await expect(rows.first()).toBeVisible({ timeout: 15000 });
    }

    async cancelFirstReservation() {
        const rows = await this.activeRows();
        const cancelButton = rows.first().getByRole('button', { name: /cancel/i });
        await cancelButton.click();
        await this.page.waitForTimeout(1000);
    }

    async assertReservationWasCancelled() {
        const rows = await this.activeRows();
        await expect(rows).toHaveCount(0, { timeout: 15000 });
    }
}
