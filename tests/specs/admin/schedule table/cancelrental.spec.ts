import { test, expect } from '../../../fixtures/base';
import { CatalogPage } from '../../../pages/CatalogPage';
import { LoginPage } from '../../../pages/LoginPage';
import { AdminDashboardPage } from '../../../pages/AdminDashboardPage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe.serial('Cancel rental', () => {

    /**
     * CT-RF007-01 y CT-RF007-02: Cancelacion de alquiler
     * Objetivo: Validar que al cancelar una reserva se libere la fecha en calendario en la pagina 
     * de admin y se actualice el estado a canceled apenas tocar el boton
     * Prioridad: Alta
     */
    test('CT-RF007-01: Cancel rental in admin', async ({ page }) => {

        test.setTimeout(90000);

        const catalogPage = new CatalogPage(page);
        const loginPage = new LoginPage(page);
        const adminPage = new AdminDashboardPage(page);
        
        // Paso 1: Ir al catalogo y reservar un producto
        await catalogPage.goto();
        await catalogPage.assertCatalogLoaded();
        await catalogPage.openFirstProduct();
        
        // Esperar a que cargue la pagina de detalle
        await expect(page).toHaveURL(/.*items\/\d+/);
        
        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle');    

        // Esperar formulario de reserva con campos de fecha
        await expect(page.locator('[name="start"]')).toBeVisible();
        await expect(page.locator('[name="end"]')).toBeVisible();
        await expect(page.locator('[name="name"]')).toBeVisible();
        await expect(page.locator('[name="email"]')).toBeVisible();
        await expect(page.locator('[name="phone"]')).toBeVisible();

        // Llenar el formulario
        await page.locator('[name="start"]').fill('2025-12-20');
        await page.locator('[name="end"]').fill('2025-12-25');
        await page.locator('[name="name"]').fill('Test User');
        await page.locator('[name="email"]').fill('test@example.com');
        await page.locator('[name="phone"]').fill('099555555');
        
        const size = page.locator('[name="size"]').first();
        await size.check();

        // Enviar el formulario
        const submitButton = page.getByRole('button', { name: /request rental/i });
        await submitButton.waitFor({ state: 'visible', timeout: 10000 });
        await submitButton.click();
        await page.waitForURL(/.*success/); 

        // Paso 2: Loguearse en el panel de Admin
        await loginPage.goto();
        await loginPage.login('admin', 'admin123');

        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle'); 

        // Paso 3: Verificar que la reserva aparece activa
        await adminPage.assertHasActiveReservations();

        // Paso 4: Cancelar la reserva
        await adminPage.cancelFirstReservation();  

        // Paso 5: Verificar que la reserva cancelada
        await adminPage.assertFirstReservationWasCancelled();

    });

});
