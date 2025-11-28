import { test, expect } from '../../../fixtures/base';
import { LoginPage } from '../../../pages/LoginPage';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('View rental', () => {
 /**
     * CT-RF0006-01: Visualizacion de alquileres en admin
     * Objetivo: Validar que el administrador pueda ver los alquileres confirmados
     * Prioridad: Alta
     */
    test('CT-RF006-01: View rental in admin', async ({ page, users }) => {

       const loginPage = new LoginPage(page);
        const adminPage = new AdminDashboardPage(page); 

        // Paso 1: Loguearse en el panel de Admin
        await loginPage.goto();
        await page.waitForLoadState('networkidle'); 
        await loginPage.login(users.admin.user, users.admin.pass);

        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle'); 
        await page.waitForLoadState('load');

        // Paso 2: Verificar que la primer reserva contiene los campos articulo, fechas, cliente, estado
        await adminPage.assertReservationDetails();

    });

});