import { test, expect } from './fixtures/base';
import { CatalogPage } from './pages/CatalogPage';
import { HomePage } from './pages/HomePage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Test Cases from Requirements (Formato 1)', () => {

    /**
     * CT-RF001-01: Búsqueda por palabra clave válida
     * Objetivo: Validar que la búsqueda devuelva artículos relacionados sin necesidad de recargar la página
     * Prioridad: Alta
     */
    test('CT-RF001-01: Search by valid keyword returns related items dynamically', async ({ page }) => {
        const catalogPage = new CatalogPage(page);
        
        // Paso 1: Ir al catálogo
        await catalogPage.goto();
        await catalogPage.assertCatalogLoaded();

        // Paso 2 y 3: Buscar por palabra clave "dress" (vestido en inglés)
        await catalogPage.searchByQuery('dress');

        // Resultado esperado: Se muestran artículos que coincidan con la palabra clave
        // Los resultados se actualizan dinámicamente
        await catalogPage.assertResultsAreVisible();
        
        // Verificar que hay al menos un resultado
        const firstProduct = page.getByRole('link', { name: /view details/i }).first();
        await expect(firstProduct).toBeVisible();
    });

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
        
        // Resultado esperado: Se muestra una página de detalle con información obligatoria
        
        // 1. Título del artículo
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        
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
     * CT-RF004-01: Programación de alquiler válida
     * Objetivo: Validar que se pueda crear una solicitud con datos correctos
     * Prioridad: Alta
     */
    test('CT-RF004-01: Valid rental request submission with correct data', async ({ page }) => {
        const catalogPage = new CatalogPage(page);
        
        // Navegar al catálogo y abrir un producto
        await catalogPage.goto();
        await catalogPage.assertCatalogLoaded();
        await catalogPage.openFirstProduct();
        
        await expect(page).toHaveURL(/.*items\/\d+/);
        
        // Paso 1: Completar formulario de reserva con datos válidos
        
        // Nombre
        await page.locator('[name="name"]').fill('Ana Pérez');
        
        // Email válido
        await page.locator('[name="email"]').fill('ana.perez@example.com');
        
        // Teléfono (formato válido: 7-15 dígitos)
        await page.locator('[name="phone"]').fill('099123456');
        
        // Seleccionar fechas futuras
        const today = new Date();
        const startDate = new Date(today);
        startDate.setDate(today.getDate() + 5);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 2);
        
        await page.locator('[name="start"]').fill(startDate.toISOString().split('T')[0]);
        await page.locator('[name="end"]').fill(endDate.toISOString().split('T')[0]);
        
        // Seleccionar primera talla disponible
        const firstSizeRadio = page.locator('[name="size"]').first();
        await firstSizeRadio.check();
        
        // Paso 3: Enviar formulario
        const submitButton = page.getByRole('button', { name: /request rental/i });
        await submitButton.click();
        
        // Resultado esperado: Confirmación visible o URL cambia con success=1
        // Esperar por el mensaje de éxito o el parámetro de query
        await page.waitForURL(/.*success=1/, { timeout: 10000 });
        
        // Verificar que aparece el mensaje de confirmación
        await expect(page.getByText(/reservation completed|completed/i)).toBeVisible();
    });

});
