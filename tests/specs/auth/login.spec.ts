import { test, expect } from '../../fixtures/base';

test.describe('Login (opcional)', () => {
    test('Existe la página de login de admin si está implementada', async ({ login }) => {
        await login.goto();
        const visible = await login.formIsVisible();
        await expect(visible, 'Formulario de login no disponible en este build').toBeTruthy();
    });
});
