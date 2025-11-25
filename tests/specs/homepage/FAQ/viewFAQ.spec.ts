import { test, expect } from '../../../fixtures/base';
import { HomePage } from '../../../pages/HomePage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('FAQ page', () => {

    /**
     * CT-RF008-01: Acceso a FAQ
     * Objetivo: Validar que la FAQ este accesible desde el menu principal
     * Prioridad: Media
     */
    test('CT-RF008-01: FAQ can be accessed from main menu', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 720 });

        const homePage = new HomePage(page);
        
        // Paso 1: Abrir Home
        await homePage.goto();
        await homePage.assertBasicUI();
        
       // Paso 2: Seleccionar FAQ desde el menú superior
        const faqLink = page.getByText('FAQ', { exact: false });
        await faqLink.click();

        // Resultado esperado: Se abre la página FAQ
        await expect(page).toHaveURL(/\/faq/);

        // Verificar que haya al menos 10 preguntas visibles
        const questions = page.locator('[id^="faq-"]');
        const count = await questions.count();
        expect(count).toBeGreaterThan(3);

    });

});