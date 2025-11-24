import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
    constructor(private page: Page) { }

    private layout = this.page.locator('[data-testid="admin-dashboard"], main, #admin');
    
    private async scheduledRentalsTable(): Promise<Locator> {
        await this.page.waitForSelector('h2', { timeout: 3000 }).catch(() => null);

        await this.page.waitForSelector('h2:has-text("Scheduled rentals")', { timeout: 15000 });

        const candidates = [
            'section:has(h2:has-text("Scheduled rentals")) table',
            'section:has(h2:has-text("Scheduled Rentals")) table',
            'h2:has-text("Scheduled rentals") + div table',
            'h2:has-text("Scheduled rentals") ~ div table',
            'main table:has(td:has-text("Rental ID"))',
            'main table:has(td:has-text("active"))',
            'main table'
        ];

        for (const sel of candidates) {
            const loc = this.page.locator(sel).first();
            if (await loc.count() > 0) return loc;
        }

        return this.layout.locator('table').first();
    }

    private async activeRows() {
        const table = await this.scheduledRentalsTable();
        const active = table.locator('tbody tr', { hasText: /active/i });
        if (await active.count() > 0) return active;
        return table.locator('tbody tr');
    };
    
    async goto() {
        await this.page.goto('/admin');
    }

    async assertHasActiveReservations() {
        // Esperar a que aparezca la sección de reservas
        await this.page.waitForSelector('h2:has-text("Scheduled rentals")', { timeout: 15000 });

        const activeRows = await this.activeRows();

        await expect(activeRows.count()).resolves.toBeGreaterThan(0);
        await expect(activeRows.first()).toBeVisible();
    }

    async cancelFirstReservation() {
        const rows = await this.activeRows();
        const count = await rows.count();

        if (count === 0) {
            throw new Error('No active reservations found to cancel.');
        }

        const firstRow = rows.first();
        const cancelButton = firstRow.getByRole('button', { name: /cancel/i });

        // Esperar a que el botón exista y esté visible
        await expect(cancelButton).toBeVisible({ timeout: 5000 });

        await cancelButton.click();

        await expect(firstRow.locator('td').nth(4)).toContainText(/canceled/i, { timeout: 15000 });
    }

    async assertFirstReservationWasCancelled() {
        const table = await this.scheduledRentalsTable();
        const firstRow = table.locator('tbody tr').first();

        if (await firstRow.count() === 0) {
            throw new Error('No reservation rows found to assert cancellation.');
        }

        const state = firstRow.locator('td').nth(4);
        await expect(state).toContainText(/canceled/i, { timeout: 5000 });
    }

}
