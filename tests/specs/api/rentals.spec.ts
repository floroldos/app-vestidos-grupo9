import { test, expect } from '../../fixtures/base';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('API - Gestión de Alquileres', () => {

    test('CT-RF007-03: Cancelar alquiler sin autenticación de admin', async ({ page }) => {
        // Paso 1: Intentar cancelar un alquiler sin estar autenticado como admin
        const rentalId = 1;

        const cancelResponse = await page.request.post(`/api/admin/rentals/${rentalId}/cancel`);

        // Resultado esperado: status 401 (Unauthorized)
        expect(cancelResponse.status()).toBe(401);
        
        const responseBody = await cancelResponse.json();
        expect(responseBody.error).toBeDefined();
        expect(responseBody.error).toMatch(/unauthorized/i);
    });

    test('CT-RF007-03b: Cancelar alquiler autenticado pero rental inexistente', async ({ page, users }) => {
        // Paso 1: Login como admin
        await page.goto('/admin/login');
        
        await page.waitForFunction(() => {
            const csrf = document.querySelector<HTMLInputElement>('[name="csrf"]');
            return csrf && csrf.value !== '';
        });

        await page.locator('[name="username"]').fill(users.admin.user);
        await page.locator('[name="password"]').fill(users.admin.pass);
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('/admin');

        // Paso 2: Intentar cancelar un rental que no existe
        const nonExistentRentalId = 99999;

        const cancelResponse = await page.request.post(`/api/admin/rentals/${nonExistentRentalId}/cancel`);

        // Resultado esperado: status 404 (Not Found)
        expect(cancelResponse.status()).toBe(404);
        
        const responseBody = await cancelResponse.json();
        expect(responseBody.error).toBeDefined();
    });
});
