import { test, expect } from '../../../fixtures/base';
import { LoginPage } from '../../../pages/LoginPage';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Cancel rental', () => {

    /**
     * CT-RF007-01 y CT-RF007-02: Cancelacion de alquiler
     * Objetivo: Validar que al cancelar una reserva se libere la fecha en calendario en la pagina 
     * de admin y se actualice el estado a canceled apenas tocar el boton
     */
    test('CT-RF007-01: Cancel rental in admin', async ({ page, users }) => {

        const loginPage = new LoginPage(page);
        const adminPage = new AdminDashboardPage(page); 

        // Paso 1: Loguearse en el panel de Admin
        await loginPage.goto();
        await page.waitForLoadState('networkidle'); 
        await loginPage.login(users.admin.user, users.admin.pass);
        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle'); 
        // Paso 4: Cancelar la reserva
        await adminPage.cancelFirstReservation();  
        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle'); 
        // Paso 3: Verificar que la reserva cancelada
        await adminPage.assertFirstReservationWasCancelled();
    });

});