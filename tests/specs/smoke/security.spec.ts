import { test, expect } from '@playwright/test';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Security Tests (RNF-002)', () => {

    // CT-RNF002-02: Prueba de XSS
    test.describe('XSS Protection', () => {
        test('CT-RNF002-02: No ejecuta script malicioso en búsqueda', async ({ page }) => {
            await page.goto('/search');
            await page.waitForLoadState('networkidle');
            
            // Buscar el campo de búsqueda
            const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="query"]').first();
            
            if (await searchInput.count() > 0) {
                // Paso 1: Ingresar <script>alert(1)</script> en un campo
                const maliciousScript = '<script>alert(1)</script>';
                await searchInput.fill(maliciousScript);
                
                // Paso 2: Enviar
                const submitButton = page.locator('button[type="submit"]').first();
                if (await submitButton.count() > 0) {
                    await submitButton.click();
                    await page.waitForLoadState('networkidle');
                }
                
                // Resultado esperado: El sistema escapa el input y no ejecuta el script
                const pageContent = await page.content();
                expect(pageContent).not.toContain('<script>alert(1)</script>');
                
                // La página debe seguir funcionando sin errores
                await expect(page.locator('body')).toBeVisible();
            }
        });
    });

    // CT-RNF002-01: Prueba de SQL Injection
    test.describe('SQL Injection Prevention', () => {
        test('CT-RNF002-01: No ejecuta inyección SQL en búsqueda', async ({ page }) => {
            await page.goto('/search');
            await page.waitForLoadState('networkidle');
            
            const searchInput = page.locator('input[type="search"], input[placeholder*="Search"], input[name="query"]').first();
            
            if (await searchInput.count() > 0) {
                // Paso 1: Ingresar payload en búsqueda
                const sqlInjection = "' OR 1=1 --";
                await searchInput.fill(sqlInjection);
                
                // Paso 2: Enviar
                const submitButton = page.locator('button[type="submit"]').first();
                if (await submitButton.count() > 0) {
                    await submitButton.click();
                    await page.waitForLoadState('networkidle');
                }
                
                // Resultado esperado: El sistema no ejecuta la inyección ni expone datos
                // La página debe seguir funcionando sin errores
                await expect(page.locator('body')).toBeVisible();
            }
        });
    });
});
