
import { test, expect } from '../../fixtures/base';
import { CatalogPage } from '../../pages/CatalogPage';
import { HomePage } from '../../pages/HomePage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Test Cases para Requerimientos RF001-01, RF002-01, RF003-01', () => {
    /**
     * CT-RF002-01: Página de detalle del artículo
     * Objetivo: Validar que el sistema muestre información completa en la página de detalle
     * Prioridad: Alta
     */
    test('CT-RF002-01: Product detail page shows all required information', async ({ page }) => {
        const catalogPage = new CatalogPage(page);

        // Paso 1: Ir al catálogo
        await catalogPage.goto();
        await catalogPage.assertCatalogLoaded();

        // Paso 2: Abrir primer artículo
        await catalogPage.openFirstProduct();

        // Esperar a que cargue la página de detalle
        await expect(page).toHaveURL(/.*items\/\d+/);

        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle');

        // Resultado esperado: Se muestra una página de detalle con información obligatoria

        // 1. Título del artículo
        const h1 = page.getByRole('heading', { level: 1 });
        await h1.waitFor({ state: 'visible', timeout: 10000 });
        await expect(h1).toBeVisible();

        // 2. Imágenes: al menos 1 imagen principal visible
        const mainImage = page.locator('img').first();
        await expect(mainImage).toBeVisible();

        // 3. Descripción: debe haber texto descriptivo
        await expect(page.locator('p').first()).toBeVisible();

        // 4. Información de tallas disponibles
        const sizeOptions = page.locator('[name="size"]');
        await expect(sizeOptions.first()).toBeVisible();

        // 5. Precio de alquiler (formato $XX)
        const priceText = page.getByText(/\$\d+/);
        await expect(priceText.first()).toBeVisible();

        // 6. Formulario de reserva con campos de fecha
        await expect(page.locator('[name="start"]')).toBeVisible();
        await expect(page.locator('[name="end"]')).toBeVisible();
        await expect(page.locator('[name="name"]')).toBeVisible();
        await expect(page.locator('[name="email"]')).toBeVisible();
        await expect(page.locator('[name="phone"]')).toBeVisible();
    });

    /**
     * CT-RF003-01: Validación de campos obligatorios del formulario
     * Objetivo: Validar que el sistema requiera todos los campos obligatorios antes de enviar
     * Prioridad: Alta
     */
    test('CT-RF003-01: Form validation requires all mandatory fields', async ({ page }) => {
        const catalogPage = new CatalogPage(page);

        // Paso 1: Navegar al catálogo y abrir un producto
        await catalogPage.goto();
        await catalogPage.assertCatalogLoaded();
        await catalogPage.openFirstProduct();

        await expect(page).toHaveURL(/.*items\/\d+/);

        // Esperar a que el contenido se cargue
        await page.waitForLoadState('networkidle');

        // Paso 2: Intentar enviar formulario vacío
        const submitButton = page.getByRole('button', { name: /request rental/i });
        await submitButton.waitFor({ state: 'visible', timeout: 10000 });
        await submitButton.click();

        // Resultado esperado: El formulario no se envía y los campos requeridos están marcados

        // Verificar que los campos tienen el atributo required
        await expect(page.locator('[name="name"]')).toHaveAttribute('required', '');
        await expect(page.locator('[name="email"]')).toHaveAttribute('required', '');
        await expect(page.locator('[name="phone"]')).toHaveAttribute('required', '');
        await expect(page.locator('[name="start"]')).toHaveAttribute('required', '');
        await expect(page.locator('[name="end"]')).toHaveAttribute('required', '');

        // Verificar que al menos un radio de size tiene required
        const sizeRadios = page.locator('[name="size"]');
        await expect(sizeRadios.first()).toHaveAttribute('required', '');

        // Verificar que la URL no cambió (no hubo envío)
        await expect(page).toHaveURL(/.*items\/\d+$/);
        await expect(page).not.toHaveURL(/.*success=1/);
    });
})
