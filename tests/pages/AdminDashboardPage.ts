import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {

    private lastCancelledId: string | null = null;
    private lastDeletedInventoryId: string | null = null;
    private lastEditedInventoryId: string | null = null;
    private editPrice: string | null = null;

    constructor(private page: Page) { }

    private layout = this.page.locator('[data-testid="admin-dashboard"], main, #admin');

    // Wait for dashboard to finish loading
    async waitForDashboardReady() {
        // Wait for loading spinner to disappear
        await this.page.waitForSelector('text=Loading dashboard...', { state: 'hidden', timeout: 30000 }).catch(() => null);
        
        // Wait for either Inventory or Scheduled Rentals section to appear
        await this.page.waitForSelector('h2:has-text("Inventory"), h2:has-text("Scheduled Rentals")', { timeout: 30000 });
    }

    // Metodos Item Table

    private async inventoryTable(): Promise<Locator> {
        await this.waitForDashboardReady();

        await this.page.waitForSelector('h2:has-text("Inventory")', { timeout: 5000 });

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

    async deleteLastInventoryItem() {

        const table = await this.inventoryTable();

        // Obtener la ultima fila
        const lastRow = table.locator('tbody tr').last();
        const itemId = await lastRow.locator('td').nth(0).innerText();

        // Botón delete
        const deleteButton = lastRow.getByRole('button', { name: /delete/i });              

        // Esperar a que el botón exista y esté visible
        await expect(deleteButton).toBeVisible({ timeout: 15000 });

        // Configurar listener para auto-aceptar el dialog cuando aparezca
        const dialogPromise = new Promise<void>((resolve) => {
            this.page.once('dialog', async (dialog) => {
                await dialog.accept();
                resolve();
            });
        });
        
        // Click en el botón (esto triggerea el dialog)
        await deleteButton.click();

        // Esperar a que el dialog se haya manejado
        await dialogPromise;

        // Guardar el ID para futuras verificaciones
        this.lastDeletedInventoryId = itemId;

        // Esperar a que la fila desaparezca de la tabla
        const rowWithId = table.locator(
            `tbody tr:has(td:text-is("${itemId}"))`
        );
        await expect(rowWithId).toHaveCount(0, { timeout: 15000 });
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
        const modal = this.page
            .getByRole('heading', { name: /Edit item/i })
            .locator('..')  // sube al header
            .locator('..'); // sube al contenedor completo
        await expect(modal).toBeVisible({ timeout: 15000 });

        // Nuevo precio
        const newPrice = (oldPrice + 1).toFixed(2);
        const priceInput = modal.locator('label:has-text("Price/day") + input');
        await priceInput.fill(newPrice);

        // Guardar nuevo precio para validar luego
        this.editPrice = newPrice;

        // Editar tambien descripcion.
        const DescriptionInput = modal.locator('label:has-text("Description") + textarea');
        await DescriptionInput.fill("This is an extended test description that clearly exceeds the required fifty characters.");

        // Botón Save
        const saveButton = modal.getByRole('button', { name: /Save/i });

        // Esperar a que el botón exista y esté visible
        await expect(saveButton).toBeVisible({ timeout: 15000 });
        await saveButton.click();

        // Esperar a que el modal desaparezca
        await expect(modal).not.toBeVisible({ timeout: 15000 });
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
        expect(Number(cleanedPrice)).toBe(Number(this.editPrice));
    }


    //Metodos Schedule Table

    private async scheduledRentalsTable(): Promise<Locator> {
        await this.waitForDashboardReady();

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

        // Verificar que existe al menos una fila activa
        const count = await firstActive.count();
        if (count === 0) {
            throw new Error('No active rentals found to cancel');
        }

        // Obtener id (texto completo del code tag)
        const rentalIdCode = await firstActive.locator('td').nth(0).locator('code').innerText();
        const rentalId = rentalIdCode.trim();

        // Guardar el id para futuras verificaciones
        this.lastCancelledId = rentalId;

        // Boton cancel
        const cancelButton = firstActive.getByRole('button', { name: /cancel/i });

        // Esperar a que esté visible
        await expect(cancelButton).toBeVisible({ timeout: 15000 });

        await cancelButton.click();

        // Esperar a que el status cambie a "canceled" (la fila puede recargarse, así que buscamos de nuevo)
        // Usar el page locator en lugar de table para que pueda encontrar la fila después del reload
        await this.page.waitForFunction(
            (searchId) => {
                const rows = Array.from(document.querySelectorAll('tbody tr'));
                return rows.some(row => {
                    const code = row.querySelector('code');
                    const status = row.querySelectorAll('td')[4]?.textContent || '';
                    return code && code.textContent === searchId && /canceled/i.test(status);
                });
            },
            rentalId,
            { timeout: 20000 }
        );
    }

    async assertFirstReservationWasCancelled() {
        if (!this.lastCancelledId) {
            throw new Error("No reservation ID stored to assert cancellation.");
        }

        const table = await this.scheduledRentalsTable();

        const rowWithId = table.locator(`tbody tr:has(td:has-text("${this.lastCancelledId}"))`);

        await expect(rowWithId).toHaveCount(1, { timeout: 20000 });

        const state = rowWithId.locator('td').nth(4);
        await expect(state).toContainText(/canceled/i, { timeout: 20000 })
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
