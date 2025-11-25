import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {

    constructor(private page: Page) {}

    private lastDeletedInventoryId: string | null = null;

    private layout = this.page.locator('[data-testid="admin-dashboard"], main, #admin');
    
    private async inventoryTable(): Promise<Locator> {

        // Esperar a que exista el título "Inventory"
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

    async goto() {
        await this.page.goto('/admin');
    }

    async deleteFirstInventoryItem() {

        const table = await this.inventoryTable();

        // Obtener la primera fila
        const firstRow = table.locator('tbody tr').first();
        await expect(firstRow).toBeVisible({ timeout: 5000 });

        // Guardar el ID de la primera columna
        const itemId = await firstRow.locator('td').nth(0).innerText();

        const rowWithId = table.locator(
            `tbody tr:has(td:text-is("${itemId}"))`
        );

        const deleteButton = rowWithId.getByRole('button', { name: /delete/i });

        await expect(deleteButton).toBeVisible({ timeout: 15000 });

        this.page.once('dialog', async dialog => {
            await dialog.accept();
        });

        await deleteButton.click();

        this.lastDeletedInventoryId = itemId;

        await expect(rowWithId).toHaveCount(0, { timeout: 15000 });
    }

    async assertItemWasDeleted() {

        if (!this.lastDeletedInventoryId) {
            throw new Error("No inventory item ID stored to assert deletion.");
        }

        const table = await this.inventoryTable();

        const rowWithId = table.locator(
            `tbody tr:has(td:text-is("${this.lastDeletedInventoryId}"))`
        );

        // Verificar que no existe
        await expect(rowWithId).toHaveCount(0);
    }


}
