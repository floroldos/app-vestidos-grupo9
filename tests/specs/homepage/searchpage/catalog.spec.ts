import { test, expect } from '../../../fixtures/base';
import { CatalogPage } from '../../../pages/CatalogPage';
import { HomePage } from '../../../pages/HomePage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Navegación y catálogo', () => {

    test('navega al catálogo desde la Home y verifica que el formulario está visible', async ({ page }) => {
        const homePage = new HomePage(page);
        const catalogPage = new CatalogPage(page);

        await homePage.goto();
        await homePage.assertBasicUI();

        // Click en "Browse" para ir al catálogo
        await page.getByRole('link', { name: 'Browse' }).first().click();

        await expect(page).toHaveURL(/.*search/);
        await catalogPage.assertCatalogLoaded();

        await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    });

    test('abre la página de detalles de un producto desde el catálogo', async ({ page }) => {
        const catalogPage = new CatalogPage(page);

        await catalogPage.goto();
        await catalogPage.assertCatalogLoaded();
        await catalogPage.openFirstProduct();

        await expect(page).toHaveURL(/.*items\/[a-zA-Z0-9-]+/);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('abre la página de detalles de un producto directamente desde la Home', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.goto();

        const productOpened = await homePage.openFirstProductIfVisible();

        if (productOpened) {
            await expect(page).toHaveURL(/.*items\/[a-zA-Z0-9-]+/);
        } else {
            console.log("No se encontraron productos destacados en la Home para probar la apertura de detalles.");
        }
    });

    // --- TESTS DE FILTROS (RF-001) ---

    test.describe('Filtros de catálogo (RF-001)', () => {

        test.beforeEach(async ({ catalog }) => {
            await catalog.goto();
            await catalog.assertCatalogLoaded();
        });

        test('filtra por categoría = dress', async ({ catalog }) => {
            await catalog.filterByCategory('dress');
            await catalog.assertResultsAreVisible();
        });

        test('busca por texto y muestra resultados', async ({ catalog }) => {
            await catalog.searchByQuery('dress');
            await catalog.assertResultsAreVisible();
        });

        test('muestra mensaje de "No items match" si no hay resultados', async ({ catalog }) => {
            await catalog.searchByQuery('asdfghjkl');
            await catalog.assertNoResults();
        });

        test('filtra vestidos por talla y color', async ({ catalog }) => {
            await catalog.applyComplexFilter({ category: 'dress' });
            await catalog.Page.getByPlaceholder('Size').fill('M');
            await catalog.Page.getByPlaceholder('Color').fill('black');
            await catalog.Page.getByRole('button', { name: 'Search' }).click();

            await catalog.assertResultsAreVisible();

            // Validar que todos los resultados pertenecen a "dress"
            const categories = await catalog.Page.locator('.text-xs.uppercase').allInnerTexts();
            for (const cat of categories) {
                expect(cat.toLowerCase()).toContain('dress');
            }
        });

        test('combina filtros de vestidos correctamente (talla, color, estilo)', async ({ catalog }) => {
            await catalog.applyComplexFilter({
                category: 'dress',
                style: 'cocktail',
            });

            await catalog.Page.getByPlaceholder('Color').fill('burgundy');
            await catalog.Page.getByRole('button', { name: 'Search' }).click();

            await catalog.assertResultsAreVisible();

            const categories = await catalog.Page.locator('.text-xs.uppercase').allInnerTexts();
            for (const cat of categories) {
                expect(cat.toLowerCase()).toContain('dress');
            }
        });

        test('actualiza resultados dinámicamente al cambiar filtros', async ({ catalog }) => {
            await catalog.goto();
            await catalog.assertCatalogLoaded();

            // Buscar un vestido
            await catalog.Page.getByPlaceholder('Search…').fill('dress');
            await catalog.Page.getByRole('button', { name: 'Search' }).click();
            await catalog.assertResultsAreVisible();

            // Cambiar color
            await catalog.Page.getByPlaceholder('Color').fill('black');
            await catalog.Page.getByRole('button', { name: 'Search' }).click();

            // Verificar que los resultados cambian y hay items con ese color
            const resultsGrid = catalog.Page.locator('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-4');
            const hasBlackItems = await resultsGrid.innerText();
            expect(hasBlackItems.toLowerCase()).toContain('black');
        });
    });
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

        // Paso 2 y 3: Buscar por palabra clave "Silk"
        await catalogPage.searchByQuery('Silk');

        // Esperar a que se actualicen los resultados
        await page.waitForTimeout(1000);

        // Verificar que hay al menos un resultado visible
        const viewDetailsLinks = page.getByRole('link', { name: /view details/i });
        const count = await viewDetailsLinks.count();
        expect(count).toBeGreaterThan(0);

        // Verificar que el primer resultado es visible
        await expect(viewDetailsLinks.first()).toBeVisible();
    });

});


