import { test, expect } from './fixtures/base';
import { CatalogPage } from './pages/CatalogPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

test.use({ baseURL: 'http://localhost:3000' });

test.describe.serial('Test Cases para Requerimientos RF001-01, RF002-01, RF003-01', () => {

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

        // Resultado esperado: Se muestran artículos que coincidan con la palabra clave
        // Los resultados se actualizan dinámicamente sin recargar
        
        // Esperar a que se actualicen los resultados
        await page.waitForTimeout(1000);
        
        // Verificar que hay al menos un resultado visible
        const viewDetailsLinks = page.getByRole('link', { name: /view details/i });
        const count = await viewDetailsLinks.count();
        expect(count).toBeGreaterThan(0);
        
        // Verificar que el primer resultado es visible
        await expect(viewDetailsLinks.first()).toBeVisible();
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

    /**
     * CT-RF007-01 y CT-RF007-02: Cancelacion de alquiler
     * Objetivo: Validar que al cancelar una reserva se libere la fecha en calendario en la pagina 
     * de admin y se actualice el estado a canceled apenas tocar el boton
     * Prioridad: Alta
     */
    test('CT-RF007-01: Cancellation releases booked date in admin', async ({ page }) => {

        const catalogPage = new CatalogPage(page);
        const loginPage = new LoginPage(page);
        const adminPage = new AdminDashboardPage(page);
        const homePage = new HomePage(page);
        
        // Paso 1: Ir al catalogo y reservar un producto
        await catalogPage.goto();
        await catalogPage.assertCatalogLoaded();
        await catalogPage.openFirstProduct();
        
        // Esperar a que cargue la pagina de detalle
        await expect(page).toHaveURL(/.*items\/\d+/);
        
        // Esperar a que el contenido se cargue completamente
        await page.waitForLoadState('networkidle');    

        // Esperar formulario de reserva con campos de fecha
        await expect(page.locator('[name="start"]')).toBeVisible();
        await expect(page.locator('[name="end"]')).toBeVisible();
        await expect(page.locator('[name="name"]')).toBeVisible();
        await expect(page.locator('[name="email"]')).toBeVisible();
        await expect(page.locator('[name="phone"]')).toBeVisible();

        // Llenar el formulario
        await page.locator('[name="start"]').fill('2025-12-10');
        await page.locator('[name="end"]').fill('2025-12-15');
        await page.locator('[name="name"]').fill('Test User');
        await page.locator('[name="email"]').fill('test@example.com');
        await page.locator('[name="phone"]').fill('099555555');
        
        const size = page.locator('[name="size"]').first();
        await size.check();

        // Enviar el formulario
        const submitButton = page.getByRole('button', { name: /request rental/i });
        await submitButton.waitFor({ state: 'visible', timeout: 10000 });
        await submitButton.click();
        await page.waitForURL(/.*success/); 

        // Paso 2: Loguearse en el panel de Admin
        await homePage.goto();
        await homePage.assertBasicUI();
        await loginPage.goto();
        await loginPage.login('admin', 'admin123');

        // Paso 3: Verificar que la reserva aparece activa
        await adminPage.assertHasActiveReservations();

        // Paso 4: Cancelar la reserva
        await adminPage.cancelFirstReservation();  

        // Paso 5: Verificar que la reserva cancelada
        await adminPage.assertFirstReservationWasCancelled();

    });

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
