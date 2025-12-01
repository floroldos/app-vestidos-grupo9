import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {

    private lastCancelledId: string | null = null;
    private lastDeletedInventoryId: string | null = null;
    private lastEditedInventoryId: string | null = null;
    private editPrice: string | null = null;
    private lastAddInventoryName: string | null = null;

    constructor(private page: Page) { }

    private layout = this.page.locator('[data-testid="admin-dashboard"], main, #admin');

    // Metodos Item Table

    private async inventoryTable(): Promise<Locator> {
        await this.page.waitForSelector('h2', { timeout: 3000 }).catch(() => null);

        await this.page.waitForSelector('h2:has-text("Inventory")', { timeout: 20000 });

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

    async addInventoryItem() {
        const addButton = this.page.getByRole('button', { name: /\+?\s*add item/i });

        await expect(addButton).toBeVisible({ timeout: 25000 });
        await addButton.click();

        // Abrir modal
        const modal = this.page
            .getByRole('heading', { name: /Add new item/i })
            .locator('..')
            .locator('..');

        await expect(modal).toBeVisible({ timeout: 15000 });

        // Datos para el item
        const testDate = Date.now();
        const itemName = `Test Item ${testDate}`;

        // Llenar formulario
        await modal.locator('label:has-text("Name") + input').fill(itemName);
        await modal.locator('label:has-text("Category") + select').selectOption('dress');
        await modal.locator('label:has-text("Price/day") + input').fill("85");
        await modal.locator('label:has-text("Color") + input').fill("Red");
        await modal.locator('label:has-text("Style") + input').fill("Casual");
        await modal.locator('label:has-text("Sizes") + input').fill("S, M, L");
        await modal.locator('label:has-text("Description") + textarea').fill("This is a test description for Playwright that exceeds the 50 characters requirement.");
        const fileInput = modal.locator('input[type="file"]');
        await fileInput.setInputFiles([
            './public/images/dresses/black-tie-dress.jpg',
            './public/images/dresses/black-tie-dress-2.jpg',
            './public/images/dresses/black-tie-dress-3.jpg'
        ]);

        // Guardar
        const saveButton = modal.getByRole('button', { name: /save changes/i });
        await expect(saveButton).toBeVisible({ timeout: 15000 });
        await saveButton.click();

        // Guardar name para validación
        this.lastAddInventoryName = itemName;
    }

    async assertItemWasAdded() {
        if (!this.lastAddInventoryName) {
            throw new Error("No item name stored to assert addition.");
        }

        const table = await this.inventoryTable();

        const row = table.locator(
            `tbody tr:has(td:has-text("${this.lastAddInventoryName}"))`
        );

        await expect(row).toHaveCount(1, { timeout: 15000 });
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
            `tbody tr:has(td:has-text("${this.lastEditedInventoryId}"))`
        );

        // Validar precio nuevo
        const priceText = await rowWithId.locator('td').nth(4).innerText();
        const cleanedPrice = priceText.replace('$', '').trim();
        expect(Number(cleanedPrice)).toBe(Number(this.editPrice));
    }


    //Metodos Schedule Table

    private async scheduledRentalsTable(): Promise<Locator> {
        await this.page.waitForSelector('h2', { timeout: 15000 }).catch(() => null);

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
        const rentalId = (await firstActive.locator('td').nth(0).innerText()).trim();

        // Guardar el id para futuras verificaciones
        this.lastCancelledId = rentalId;

        // Boton cancel
        const cancelButton = firstActive.getByRole('button', { name: /cancel/i });

        // Esperar a que esté visible
        await expect(cancelButton).toBeVisible({ timeout: 15000 });

        await cancelButton.click();
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
