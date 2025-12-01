import { test, expect } from '../../fixtures/base';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('API - Login Admin', () => {
    
    test('CT-RF005-05: Login con credenciales incorrectas', async ({ page, users }) => {
        // Paso 1: Obtener token CSRF del endpoint
        const csrfResponse = await page.request.get('/api/csrf');
        expect(csrfResponse.ok()).toBeTruthy();
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrf;

        // Paso 2: Intentar login con credenciales incorrectas usando FormData
        const loginResponse = await page.request.post('/api/admin/login', {
            form: {
                username: users.admin.user,
                password: 'wrong123',
                csrf: csrfToken
            }
        });

        // Resultado esperado: status 401
        expect(loginResponse.status()).toBe(401);

        // Verificar el mensaje de error
        const responseBody = await loginResponse.json();
        expect(responseBody.error).toMatch(/invalid credentials/i);
    });

    test('CT-RF005-06: Acceso a API admin sin autenticación', async ({ page }) => {
        // Paso 1: Intentar acceder a endpoint admin sin autenticación
        const itemsResponse = await page.request.get('/api/admin/items');

        // Resultado esperado: Error 401 Unauthorized
        expect(itemsResponse.status()).toBe(401);
        const responseBody = await itemsResponse.json();
        expect(responseBody.error).toBeDefined();
    });

    test('CT-RF005-07: Logout exitoso via API', async ({ page, users }) => {
        // Paso 1: Login via API
        const csrfResponse = await page.request.get('/api/csrf');
        expect(csrfResponse.ok()).toBeTruthy();
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

        // Paso 2: Verificar que puede acceder a endpoints admin
        const itemsResponse = await page.request.get('/api/admin/items');
        expect(itemsResponse.status()).toBe(200);

        // Paso 3: Hacer logout via API
        const logoutResponse = await page.request.post('/api/admin/logout');
        expect(logoutResponse.status()).toBe(200);

        // Paso 4: Verificar que ya no puede acceder a endpoints admin
        const itemsResponse2 = await page.request.get('/api/admin/items');
        expect(itemsResponse2.status()).toBe(401);
    });
});
