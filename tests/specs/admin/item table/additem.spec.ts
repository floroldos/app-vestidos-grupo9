import { test, expect } from '../../../fixtures/base';
import { LoginPage } from '../../../pages/LoginPage';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Add item', () => {

    /**
     * CT-RF005-01: Agregar artículo
     * Objetivo: Validar que el admin pueda agregar un item al inventario
     * y que el item efectivamente aparece en la tabla.
     * Prioridad: Alta
     */
    test('Add new inventory item', async ({ page, users }) => {
        
        const loginPage = new LoginPage(page);
        const adminPage = new AdminDashboardPage(page); 

        await loginPage.goto();
        await page.waitForLoadState('networkidle');
        await loginPage.login(users.admin.user, users.admin.pass);

        await page.waitForLoadState('networkidle');

        // Agregar item
        await adminPage.addInventoryItem();

        await expect(page.getByRole('heading', { name: /Add new item/i })).toHaveCount(0, { timeout: 20000 });

        // Validar que el item aparece en la tabla
        await adminPage.assertItemWasAdded();

    });

});
