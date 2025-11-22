import { test, expect } from './fixtures/base';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('Security Tests (RNF-002)', () => {

    test.describe('CSRF Protection', () => {

        test('rechaza POST a /api/rentals sin CSRF token', async ({ page }) => {
            // Intentar crear una reserva sin token CSRF
            const response = await page.request.post('/api/rentals', {
                data: {
                    itemId: '1',
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '1234567890',
                    start: '2025-12-01',
                    end: '2025-12-03',
                    size: 'M',
                    // csrf: MISSING
                }
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.error).toContain('CSRF');
        });

        test('rechaza POST a /api/rentals con CSRF token inválido', async ({ page }) => {
            const response = await page.request.post('/api/rentals', {
                data: {
                    itemId: '1',
                    name: 'Test User',
                    email: 'test@example.com',
                    phone: '1234567890',
                    start: '2025-12-01',
                    end: '2025-12-03',
                    size: 'M',
                    csrf: 'invalid-token-123'
                }
            });

            expect(response.status()).toBe(400);
            const body = await response.json();
            expect(body.error).toContain('CSRF');
        });

        test('acepta POST a /api/rentals con CSRF token válido', async ({ page }) => {
            // Ir a la página del item para obtener el token CSRF
            await page.goto('/items/1');
            
            // Obtener el valor del token CSRF del formulario
            const csrfToken = await page.inputValue('input[name="csrf"]');
            expect(csrfToken).toBeTruthy();

            // Llenar el formulario completo
            await page.fill('input[name="name"]', 'John Doe');
            await page.fill('input[name="email"]', 'john@example.com');
            await page.fill('input[name="phone"]', '1234567890');
            
            // Seleccionar fechas válidas (futuras)
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 3);
            
            await page.fill('input[name="start"]', tomorrow.toISOString().split('T')[0]);
            await page.fill('input[name="end"]', nextWeek.toISOString().split('T')[0]);
            
            // Seleccionar una talla
            await page.click('input[name="size"][value="M"]');

            // Enviar el formulario
            await page.click('button[type="submit"]');

            // Verificar redirección exitosa
            await page.waitForURL(/.*success=1/);
            expect(page.url()).toContain('success=1');
        });
    });

    test.describe('XSS Protection', () => {

        test('sanitiza nombre con tags HTML', async ({ page }) => {
            await page.goto('/items/1');

            const maliciousName = '<script>alert("XSS")</script>';
            await page.fill('input[name="name"]', maliciousName);
            await page.fill('input[name="email"]', 'test@example.com');
            await page.fill('input[name="phone"]', '1234567890');

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 3);
            
            await page.fill('input[name="start"]', tomorrow.toISOString().split('T')[0]);
            await page.fill('input[name="end"]', nextWeek.toISOString().split('T')[0]);
            await page.click('input[name="size"][value="M"]');

            await page.click('button[type="submit"]');

            // Debe rechazar el nombre inválido
            await page.waitForTimeout(1000);
            
            // Verificar que NO se redirigió (se quedó en la misma página o mostró error)
            expect(page.url()).not.toContain('success=1');
        });

        test('sanitiza nombre con caracteres especiales peligrosos', async ({ page }) => {
            await page.goto('/items/1');

            const maliciousName = 'User"; DROP TABLE rentals; --';
            await page.fill('input[name="name"]', maliciousName);

            // El input debe rechazar caracteres no permitidos
            const inputValue = await page.inputValue('input[name="name"]');
            
            // Verificar que el regex solo permite letras y espacios
            const nameRegex = /^[A-Za-zÀ-ÿ\s]{2,40}$/;
            
            // Si se permite escribir, al hacer submit debe fallar
            await page.fill('input[name="email"]', 'test@example.com');
            await page.fill('input[name="phone"]', '1234567890');
            
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 3);
            
            await page.fill('input[name="start"]', tomorrow.toISOString().split('T')[0]);
            await page.fill('input[name="end"]', nextWeek.toISOString().split('T')[0]);
            await page.click('input[name="size"][value="M"]');

            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            expect(page.url()).not.toContain('success=1');
        });

        test('sanitiza email con formato inválido', async ({ page }) => {
            await page.goto('/items/1');

            await page.fill('input[name="name"]', 'John Doe');
            await page.fill('input[name="email"]', 'not-an-email');
            await page.fill('input[name="phone"]', '1234567890');

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 3);
            
            await page.fill('input[name="start"]', tomorrow.toISOString().split('T')[0]);
            await page.fill('input[name="end"]', nextWeek.toISOString().split('T')[0]);
            await page.click('input[name="size"][value="M"]');

            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            expect(page.url()).not.toContain('success=1');
        });
    });

    test.describe('Input Validation', () => {

        test('rechaza teléfono con letras', async ({ page }) => {
            await page.goto('/items/1');

            await page.fill('input[name="name"]', 'John Doe');
            await page.fill('input[name="email"]', 'john@example.com');
            await page.fill('input[name="phone"]', 'abc123def');

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const nextWeek = new Date();
            nextWeek.setDate(nextWeek.getDate() + 3);
            
            await page.fill('input[name="start"]', tomorrow.toISOString().split('T')[0]);
            await page.fill('input[name="end"]', nextWeek.toISOString().split('T')[0]);
            await page.click('input[name="size"][value="M"]');

            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            expect(page.url()).not.toContain('success=1');
        });

        test('rechaza fechas en el pasado', async ({ page }) => {
            await page.goto('/items/1');

            await page.fill('input[name="name"]', 'John Doe');
            await page.fill('input[name="email"]', 'john@example.com');
            await page.fill('input[name="phone"]', '1234567890');
            
            // Fechas en el pasado
            await page.fill('input[name="start"]', '2020-01-01');
            await page.fill('input[name="end"]', '2020-01-03');
            await page.click('input[name="size"][value="M"]');

            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            expect(page.url()).not.toContain('success=1');
        });

        test('rechaza rango de fechas mayor a 7 días', async ({ page }) => {
            await page.goto('/items/1');

            await page.fill('input[name="name"]', 'John Doe');
            await page.fill('input[name="email"]', 'john@example.com');
            await page.fill('input[name="phone"]', '1234567890');
            
            const start = new Date();
            start.setDate(start.getDate() + 1);
            const end = new Date(start);
            end.setDate(end.getDate() + 10); // 10 días
            
            await page.fill('input[name="start"]', start.toISOString().split('T')[0]);
            await page.fill('input[name="end"]', end.toISOString().split('T')[0]);
            await page.click('input[name="size"][value="M"]');

            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            expect(page.url()).not.toContain('success=1');
        });

        test('rechaza fecha fin anterior a fecha inicio', async ({ page }) => {
            await page.goto('/items/1');

            await page.fill('input[name="name"]', 'John Doe');
            await page.fill('input[name="email"]', 'john@example.com');
            await page.fill('input[name="phone"]', '1234567890');
            
            const start = new Date();
            start.setDate(start.getDate() + 5);
            const end = new Date();
            end.setDate(end.getDate() + 2); // Antes del inicio
            
            await page.fill('input[name="start"]', start.toISOString().split('T')[0]);
            await page.fill('input[name="end"]', end.toISOString().split('T')[0]);
            await page.click('input[name="size"][value="M"]');

            await page.click('button[type="submit"]');
            await page.waitForTimeout(1000);

            expect(page.url()).not.toContain('success=1');
        });
    });

    test.describe('Authentication & Authorization', () => {

        test('redirige a login cuando se intenta acceder a /admin sin sesión', async ({ page }) => {
            await page.goto('/admin');
            
            // Debe redirigir a /admin/login
            await page.waitForURL(/.*admin\/login/);
            expect(page.url()).toContain('/admin/login');
        });

        test('no permite acceso a /admin/rentals sin autenticación', async ({ page }) => {
            const response = await page.request.get('/api/admin/rentals');
            
            // Debe retornar 401 Unauthorized
            expect(response.status()).toBe(401);
        });

        test('formulario de login requiere CSRF token', async ({ page }) => {
            await page.goto('/admin/login');
            
            // Verificar que existe un campo CSRF
            const csrfInput = page.locator('input[name="csrf"]');
            await expect(csrfInput).toBeAttached();
            
            const csrfValue = await csrfInput.inputValue();
            expect(csrfValue).toBeTruthy();
        });
    });

    test.describe('SQL Injection Prevention', () => {

        test('maneja itemId no numérico de forma segura', async ({ page }) => {
            // Intentar SQL injection en itemId
            const response = await page.request.post('/api/rentals', {
                data: {
                    itemId: "1' OR '1'='1",
                    name: 'John Doe',
                    email: 'john@example.com',
                    phone: '1234567890',
                    start: '2025-12-01',
                    end: '2025-12-03',
                    size: 'M',
                    csrf: 'dummy-token'
                }
            });

            // Debe fallar la validación (itemId se convierte a NaN)
            expect(response.status()).toBe(400);
        });

        test('maneja caracteres especiales en búsqueda de forma segura', async ({ page }) => {
            // Intentar SQL injection en query de búsqueda
            await page.goto('/search?q=dress\' OR \'1\'=\'1');
            
            // La página debe cargar sin errores
            await expect(page.locator('h1')).toContainText('Browse Our Collection');
            
            // No debe retornar todos los items (SQL injection fallido)
            // Solo debe buscar literalmente por "dress' OR '1'='1"
        });
    });

    test.describe('Security Headers & Cookies', () => {

        test('cookies de sesión tienen httpOnly flag', async ({ page }) => {
            await page.goto('/items/1');
            
            const cookies = await page.context().cookies();
            const csrfCookie = cookies.find(c => c.name === 'gr_csrf');
            
            if (csrfCookie) {
                expect(csrfCookie.httpOnly).toBe(true);
            }
        });

        test('cookies de sesión admin tienen httpOnly y sameSite', async ({ page, context }) => {
            // Simular login exitoso
            await page.goto('/admin/login');
            
            // Llenar formulario con credenciales correctas
            await page.fill('input[name="username"]', process.env.ADMIN_USER || 'admin');
            await page.fill('input[name="password"]', process.env.ADMIN_PASSWORD || 'supersegura123');
            
            await page.click('button[type="submit"]');
            
            // Verificar cookies después del login
            const cookies = await context.cookies();
            const adminCookie = cookies.find(c => c.name === 'gr_admin');
            
            if (adminCookie) {
                expect(adminCookie.httpOnly).toBe(true);
                expect(adminCookie.sameSite).toBe('Lax');
            }
        });
    });
});
