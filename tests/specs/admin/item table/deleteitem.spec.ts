import { test, expect } from '../../../fixtures/base';
import { LoginPage } from '../../../pages/LoginPage';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Delete item', () => {

    /**
     * CT-RF005-04: Eliminar artículo con confirmación
     * Objetivo: Validar que el admin pueda eliminar un item del inventario
     * Prioridad: Media
     */
    test('Delete first item from inventory', async ({ page, users }) => {
        
        const loginPage = new LoginPage(page);
        const adminPage = new AdminDashboardPage(page); 

        // Paso 1: Loguearse en el panel de Admin
        await loginPage.goto();
        await page.waitForLoadState('networkidle'); 
        await loginPage.login(users.admin.user, users.admin.pass);

        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle'); 

        // Paso 2: Eliminar un item del inventario
        await adminPage.deleteFirstInventoryItem();

        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle'); 

        // Paso 3: Verificar que el item fue eliminado
        await adminPage.assertItemWasDeleted();
    });

});
