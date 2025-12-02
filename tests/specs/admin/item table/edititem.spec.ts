import { test, expect } from '../../../fixtures/base';
import { LoginPage } from '../../../pages/LoginPage';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Edit item', () => {

    /**
     * CT-RF005-03: Editar artículo
     * Objetivo: Validar que el admin pueda editar un item del inventario
     * cambiando el precio, y confirmar que el precio realmente cambio
     */
    test('Edit first item from inventory', async ({ page, users }) => {
        
        const loginPage = new LoginPage(page);
        const adminPage = new AdminDashboardPage(page); 

        await loginPage.goto();
        await page.waitForLoadState('networkidle');
        await loginPage.login(users.admin.user, users.admin.pass);

        await page.waitForLoadState('networkidle');

        // Editar item
        await adminPage.editFirstInventoryItem();

        // Esperar a que el modal cierre
        await expect(
            page.getByRole('heading', { name: /Edit item/i })
                .locator('..')
                .locator('..')
        ).toBeHidden({ timeout: 15000 });

        // Validar edición
        await adminPage.assertItemWasEdited();
    });

});