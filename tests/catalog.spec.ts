import { test, expect } from './fixtures/base';
import { CatalogPage } from './pages/CatalogPage';
import { HomePage } from './pages/HomePage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Navegación y Catálogo (Shop)', () => {
    
    test('Debe navegar al Catálogo desde la Home y verificar que el formulario está visible', async ({ page }) => {
        const homePage = new HomePage(page);
        const catalogPage = new CatalogPage(page);

        await homePage.goto();
        await homePage.assertBasicUI();
        await homePage.goToCatalog(); 
        
        await expect(page).toHaveURL(/.*search/);
        await catalogPage.assertCatalogLoaded();
        
        await expect(page.getByRole('button', { name: 'Search' })).toBeVisible();
    });

    test('Debe abrir la página de detalles de un producto desde el Catálogo', async ({ page }) => {
        const catalogPage = new CatalogPage(page);

        await catalogPage.goto(); 
        
        // 1. Asegurarse de que el catálogo está cargado (y hay resultados)
        await catalogPage.assertCatalogLoaded();

        await catalogPage.openFirstProduct();
        
        await expect(page).toHaveURL(/.*items\/[a-zA-Z0-9-]+/); 
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });
    
    test('Debe abrir la página de detalles de un producto directamente desde la Home (si hay productos destacados)', async ({ page }) => {
        const homePage = new HomePage(page);

        await homePage.goto();

        const productOpened = await homePage.openFirstProductIfVisible();

        if (productOpened) {
            await expect(page).toHaveURL(/.*items\/[a-zA-Z0-9-]+/); 
        } else {
            console.log("Advertencia: No se encontraron productos destacados en la Home para probar la apertura de detalles.");
        }
    });
});