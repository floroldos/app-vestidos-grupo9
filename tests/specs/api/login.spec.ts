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
                username: users.admin.username,
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

    test('CT-RF005-06: Acceso a panel admin sin autenticación', async ({ page }) => {
        // Paso 1: Navegar directamente a /admin sin estar autenticado
        const response = await page.goto('/admin');

        // Resultado esperado: Redirección automática a /admin/login
        await page.waitForURL(/\/admin\/login/);
        expect(page.url()).toMatch(/\/admin\/login/);

        // Verificar que estamos en la página de login
        await expect(page.locator('form')).toBeVisible();
        await expect(page.locator('[name="username"]')).toBeVisible();
        await expect(page.locator('[name="password"]')).toBeVisible();
    });

    test('CT-RF005-07: Logout exitoso', async ({ page, users }) => {
        // Paso 1: Hacer login primero
        await page.goto('/admin/login');
        
        // Esperar token CSRF
        await page.waitForFunction(() => {
            const csrf = document.querySelector<HTMLInputElement>('[name="csrf"]');
            return csrf && csrf.value !== '';
        });

        // Login con credenciales correctas
        await page.locator('[name="username"]').fill(users.admin.username);
        await page.locator('[name="password"]').fill(users.admin.password);
        await page.getByRole('button', { name: /sign in/i }).click();
        
        // Esperar estar autenticado en /admin
        await page.waitForURL('/admin');
        expect(page.url()).toContain('/admin');

        // Paso 2: Hacer click en Sign out
        await page.getByRole('button', { name: /sign out/i }).click();

        // Paso 3: Verificar redirección a /admin/login
        await page.waitForURL(/\/admin\/login/);
        expect(page.url()).toMatch(/\/admin\/login/);

        // Paso 4: Intentar volver a /admin sin login
        await page.goto('/admin');
        
        // Resultado esperado: Redirección a /admin/login (no puede acceder sin login nuevamente)
        await page.waitForURL(/\/admin\/login/);
        expect(page.url()).toMatch(/\/admin\/login/);
    });
});
