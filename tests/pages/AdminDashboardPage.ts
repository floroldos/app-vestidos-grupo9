import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {

    private lastCancelledId: string | null = null;
    private lastDeletedInventoryId: string | null = null;

    constructor(private page: Page) { }

    private layout = this.page.locator('[data-testid="admin-dashboard"], main, #admin');

    // Metodos Item Table

    private async inventoryTable(): Promise<Locator> {
        await this.page.waitForSelector('h2', { timeout: 3000 }).catch(() => null);

        await this.page.waitForSelector('h2:has-text("Inventory")', { timeout: 15000 });

        // Posibles ubicaciones de la tabla
        const candidates = [
            'section:has(h2:has-text("Inventory")) table',
            'h2:has-text("Inventory") + div table',
            'h2:has-text("Inventory") ~ div table',
            'main table:has(th:has-text("Name"))',
            'main table:has(td:has-text("$"))',
            'main table'
        ];

        for (const sel of candidates) {
            const loc = this.page.locator(sel).first();
            if (await loc.count() > 0) return loc;
        }

        return this.layout.locator('table').first();
    }

    async deleteFirstInventoryItem() {

        const table = await this.inventoryTable();

        // Obtener la última fila
        const firstRow = table.locator('tbody tr').first();
        const itemId = await firstRow.locator('td').nth(0).innerText();

        // Botón delete
        const deleteButton = firstRow.getByRole('button', { name: /delete/i });              

        // Esperar a que el botón exista y esté visible
        await expect(deleteButton).toBeVisible({ timeout: 15000 });

        // Antes de hacer click, estar listo para capturar el alert
        this.page.once('dialog', async dialog => {
            await dialog.accept();  // confirme
        });

        await deleteButton.click();

        // Guardar el ID para futuras verificaciones
        this.lastDeletedInventoryId = itemId;
    }

    async assertItemWasDeleted() {
        if (!this.lastDeletedInventoryId) {
            throw new Error("No reservation ID stored to assert delete.");
        }

        const table = await this.inventoryTable();

        const rowWithId = table.locator(
            `tbody tr:has(td:text-is("${this.lastDeletedInventoryId}"))`
        );

        // Verificar que la fila ya no existe
        await expect(rowWithId).toHaveCount(0, { timeout: 15000 });
    }

    //Metodos Schedule Table

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

        await this.page.waitForFunction(() => {
            const rows = Array.from(document.querySelectorAll('tbody tr'));
            return rows.length > 0;
        }, { timeout: 20000 });

        const activeRows = await this.activeRows();
        await expect(activeRows.first()).toBeVisible();
    }

    async cancelFirstReservation() {
        const rows = await this.activeRows();
        const count = await rows.count();

        if (count === 0) {
            throw new Error('No active reservations found to cancel.');
        }

        const firstRow = rows.first();
        const rentalId = await firstRow.locator('td').nth(0).innerText();

        const table = await this.scheduledRentalsTable();
        const rowWithId = table.locator(
            `tbody tr:has(td:text-is("${rentalId}"))`
        );

        const cancelButton = rowWithId.getByRole('button', { name: /cancel/i });

        // Esperar a que el botón exista y esté visible
        await expect(cancelButton).toBeVisible({ timeout: 15000 });

        await cancelButton.click();

        await expect(rowWithId.locator('td').nth(4)).toContainText(/canceled/i, { timeout: 15000 });

        // Guardar el ID para validación
        this.lastCancelledId = rentalId;
    }

    async assertFirstReservationWasCancelled() {
        if (!this.lastCancelledId) {
            throw new Error("No reservation ID stored to assert cancellation.");
        }

        const table = await this.scheduledRentalsTable();

        const rowWithId = table.locator(
            `tbody tr:has(td:text-is("${this.lastCancelledId}"))`
        );

        await expect(rowWithId).toHaveCount(1);

        const state = rowWithId.locator('td').nth(4);
        await expect(state).toContainText(/canceled/i, { timeout: 5000 });
    }

}
