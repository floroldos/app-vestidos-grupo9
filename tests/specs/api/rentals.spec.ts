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
        // Paso 1: Login como admin via API
        const csrfResponse = await page.request.get('/api/csrf');
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrf;

        const loginResponse = await page.request.post('/api/admin/login', {
            form: {
                username: users.admin.user,
                password: users.admin.pass,
                csrf: csrfToken
            }
        });
        expect(loginResponse.status()).toBe(200);

        // Paso 2: Intentar cancelar un rental que no existe
        const nonExistentRentalId = 99999;

        const cancelResponse = await page.request.post(`/api/admin/rentals/${nonExistentRentalId}/cancel`);

        // Resultado esperado: status 404 (Not Found)
        expect(cancelResponse.status()).toBe(404);
        
        const responseBody = await cancelResponse.json();
        expect(responseBody.error).toBeDefined();
    });
});
