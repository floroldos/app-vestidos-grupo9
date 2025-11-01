import { test, expect } from './fixtures/base';
import { CatalogPage } from './pages/CatalogPage';
import { HomePage } from './pages/HomePage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Navegación y catálogo', () => {

    test('navega al catálogo desde la Home y verifica que el formulario está visible', async ({ page }) => {
        const homePage = new HomePage(page);
        const catalogPage = new CatalogPage(page);

        await homePage.goto();
        await homePage.assertBasicUI();
        await homePage.goToCatalog();

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

    // 🧪 --- TESTS DE FILTROS DEL CATÁLOGO ---
    test.describe('Filtros de catálogo', () => {
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

        test('combina varios filtros (query, categoría, estilo)', async ({ catalog }) => {
            await catalog.applyComplexFilter({
                query: 'red',
                category: 'dress',
                style: 'cocktail',
            });
            await catalog.assertResultsAreVisible();
        });
    });
});
