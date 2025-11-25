import { test, expect } from '../../../fixtures/base';
import { LoginPage } from '../../../pages/LoginPage';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe.serial('Delete item', () => {

    /**
     * CT-RF005-04: Eliminar articulo
     * Objetivo: Validar que el admin puede eliminar un articulo del inventario.
     * Prioridad: Alta
     */
    test('CT-RF005-04: Delete first item from inventory', async ({ page }) => {

        test.setTimeout(90000);

        const loginPage = new LoginPage(page);
        const admin = new AdminDashboardPage(page);

        // Paso 1: Loguearse en el panel de Admin
        await loginPage.goto();
        await loginPage.login();

        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle');    

        // Paso 2: Eliminar el primer articulo del inventario
        await admin.deleteFirstInventoryItem();

        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle'); 

        // Paso 3: Verificar que el articulo fue eliminado
        await admin.assertItemWasDeleted();

    });

});