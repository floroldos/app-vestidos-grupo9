import { test, expect } from '../../fixtures/base';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Login (opcional)', () => {
    test('Existe la página de login de admin si está implementada', async ({ page }) => {
        // Navigate to login page and check if it exists
        const response = await page.goto('/admin/login');

        if (!response || response.status() === 404) {
            test.skip(true, 'Admin login page not implemented in this build');
            return;
        }
        const form = page.locator('form');
        await expect(form).toBeVisible();

        // Cchequear que existen los campos usuario, contraseña y el boton de sign in
        await expect(page.locator('[name="username"]')).toBeVisible();
        await expect(page.locator('[name="password"]')).toBeVisible();
        await expect(page.getByRole('button', { name: /sign in/i })).toBeVisible();
    });
});