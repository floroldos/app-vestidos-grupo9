import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {

    private lastCancelledId: string | null = null;
    private lastDeletedInventoryId: string | null = null;
    private lastEditedInventoryId: string | null = null;
    private editPrice: string | null = null;

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

    async editFirstInventoryItem() {

        const table = await this.inventoryTable();

        // Obtener la primer fila
        const firstRow = table.locator('tbody tr').first();
        
        // Guardar el id para validar luego
        const itemId = await firstRow.locator('td').nth(0).innerText();
        this.lastEditedInventoryId = itemId;

        // Obtener precio antiguo
        const priceText = await firstRow.locator('td').nth(4).innerText();
        const oldPrice = parseFloat(priceText.replace('$', '').trim());

        // Botón edit
        const editButton = firstRow.getByRole('button', { name: /edit/i });              

        // Esperar a que el botón exista y esté visible
        await expect(editButton).toBeVisible({ timeout: 15000 });
        await editButton.click();

        // Esperar a que aparezca el modal
        const modal = this.page.locator('form:has-text("Edit item")');
        await expect(modal).toBeVisible({ timeout: 15000 });

        // Nuevo precio
        const newPrice = (oldPrice + 1).toFixed(2);
        const priceInput = modal.locator('label:has-text("Price") + input');
        await priceInput.fill(newPrice);

        // Guardar nuevo precio para validar luego
        this.editPrice = newPrice;

        // Botón Save
        const saveButton = modal.getByRole('button', { name: /save/i });

        // Esperar a que el botón exista y esté visible
        await expect(editButton).toBeVisible({ timeout: 15000 });
        await saveButton.click();
    }

    async assertItemWasEdited() {
        if (!this.lastEditedInventoryId) {
            throw new Error("No item ID stored to assert edited.");
        }

        if (!this.editPrice) {
            throw new Error("No edited price stored for validation.");
        }

        const table = await this.inventoryTable();

        const rowWithId = table.locator(
            `tbody tr:has(td:text-is("${this.lastEditedInventoryId}"))`
        );

        await expect(rowWithId).toHaveCount(1);

        // Validar precio nuevo
        const priceText = await rowWithId.locator('td').nth(4).innerText();
        const cleanedPrice = priceText.replace('$', '').trim();
        await expect(cleanedPrice).toBe(this.editPrice);
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
