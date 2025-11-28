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

        // Obtener la primer fila
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

        await this.page.waitForSelector('h2:has-text("Scheduled rentals")', { timeout: 20000 });

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

    
    async goto() {
        await this.page.goto('/admin');
    }

    async cancelFirstReservation() {
        const table = await this.scheduledRentalsTable();

        //Obtener la primer fila activa
        const firstActive = table.locator('tbody tr', { hasText: /active/i }).first();

        // Obtener id
        const rentalId = await firstActive.locator('td').nth(0).innerText();

        // Guardar el ID para futuras verificaciones
        this.lastCancelledId = rentalId;

        // Boton cancel
        const cancelButton = firstActive.getByRole('button', { name: /cancel/i });

        // Esperar a que esté visible y habilitado
        await expect(cancelButton).toBeVisible({ timeout: 15000 });
        await expect(cancelButton).toBeEnabled({ timeout: 15000 });

        await cancelButton.click();

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

    async assertReservationDetails() {
        const table = await this.scheduledRentalsTable();

        // Obtener la primer fila
        const firstRow = table.locator('tbody tr').first();

        // Verificar que al menos una fila exista
        await firstRow.waitFor({ state: 'visible', timeout: 20000 });

        // Verificar que la fila sea visible
        await expect(firstRow).toBeVisible({ timeout: 20000 });

        // Verificar que contenga datos visibles
        const cells = firstRow.locator('td');
        const cellCount = await cells.count();

        for (let i = 0; i < cellCount; i++) {
            const cell = cells.nth(i);
            await expect(cell).not.toBeEmpty();
        }
    }

}
