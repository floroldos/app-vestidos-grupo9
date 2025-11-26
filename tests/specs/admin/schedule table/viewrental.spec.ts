import { test, expect } from '../../../fixtures/base';
import { CatalogPage } from '../../../pages/CatalogPage';
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

        test.setTimeout(90000);

        const loginPage = new LoginPage(page);
        const adminPage = new AdminDashboardPage(page);

        // Paso 1: Loguearse en el panel de Admin
        await loginPage.goto();
        await loginPage.login(users.admin.user, users.admin.pass);
        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle'); 

        // Paso 2: Verificar que la reserva aparece activa
        await adminPage.assertHasActiveReservations();

        // Paso 3: Verificar que la reserva contiene los campos articulo, fechas, cliente, estado
        await adminPage.assertReservationDetails();

    });

});
