import { test, expect } from '../../fixtures/api-fixture';
import { loginAsAdmin, getCsrf, createTestItem, createRental } from '../../utils/api-helpers';
import { formatDate, addDays } from '../../utils/date-helpers';

async function createItem(page: any, csrf: string, name: string = `TestItem-${Date.now()}`) {
    return await createTestItem(page, csrf, name);
}

test.use({ baseURL: 'http://localhost:3000' });

test.describe('API - Gestión de Alquileres', () => {

    test('CT-RF007-03: Cancelar alquiler sin autenticación de admin', async ({ page }) => {
        // Paso 1: Intentar cancelar un alquiler sin estar autenticado como admin
        const rentalId = 1;

        const cancelResponse = await page.request.post(`/api/admin/rentals/${rentalId}/cancel`);

        // Resultado esperado: status 401 (Unauthorized)
        expect(cancelResponse.status()).toBe(401);
        
        const responseBody = await cancelResponse.json();
        expect(responseBody.error).toBeDefined();
        expect(responseBody.error).toMatch(/unauthorized/i);
    });

    test('CT-RF007-03b: Cancelar alquiler autenticado pero rental inexistente', async ({ page, users }) => {
        // Paso 1: Login como admin via API
        await loginAsAdmin(page, users);

        // Paso 2: Intentar cancelar un rental que no existe
        const nonExistentRentalId = 99999;

        const cancelResponse = await page.request.post(`/api/admin/rentals/${nonExistentRentalId}/cancel`);

        // Resultado esperado: status 404 (Not Found)
        expect(cancelResponse.status()).toBe(404);
        
        const responseBody = await cancelResponse.json();
        expect(responseBody.error).toBeDefined();
    });

    test('CT-RF007-01: Cancelación de alquiler libera fecha en calendario', async ({ page, users }) => {
        // Paso 1: Login como admin y crear item
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF007-01-Item-${Date.now()}`);
        const itemId = item.id;

        // Paso 2: Crear una reserva
        const publicCsrf = await getCsrf(page);
        const today = new Date();
        const start = formatDate(addDays(today, 10));
        const end = formatDate(addDays(today, 12));

        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '099123123',
            size: 'M',
            start,
            end,
            csrf: publicCsrf,
        };

        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });
        expect(rentRes.status()).toBe(201);
        const rentBody = await rentRes.json();
        const rentalId = rentBody.rental.id;

        // Paso 3: Verificar que las fechas están ocupadas
        const availBefore = await page.request.get(`/api/items/${itemId}/availability`);
        expect(availBefore.status()).toBe(200);
        const availBodyBefore = await availBefore.json();
        const reservedBefore = availBodyBefore.rentals.some((r: any) => 
            r.start === start && r.end === end
        );
        expect(reservedBefore).toBeTruthy();

        // Paso 4: Cancelar la reserva
        const cancelResponse = await page.request.post(`/api/admin/rentals/${rentalId}/cancel`);
        expect(cancelResponse.status()).toBe(200);

        // Paso 5: Verificar que las fechas están disponibles nuevamente
        const availAfter = await page.request.get(`/api/items/${itemId}/availability`);
        expect(availAfter.status()).toBe(200);
        const availBodyAfter = await availAfter.json();
        const activeAfter = availBodyAfter.rentals.filter((r: any) => r.status === 'active');
        const reservedAfter = activeAfter.some((r: any) => 
            r.start === start && r.end === end
        );
        expect(reservedAfter).toBeFalsy();
    });

    test('CT-RF007-02: Cancelación actualiza estado inmediatamente', async ({ page, users }) => {
        // Paso 1: Login como admin y crear item
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF007-02-Item-${Date.now()}`);
        const itemId = item.id;

        // Paso 2: Crear una reserva
        const publicCsrf = await getCsrf(page);
        const today = new Date();
        const start = formatDate(addDays(today, 15));
        const end = formatDate(addDays(today, 17));

        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '099123123',
            size: 'M',
            start,
            end,
            csrf: publicCsrf,
        };

        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });
        expect(rentRes.status()).toBe(201);
        const rentBody = await rentRes.json();
        const rentalId = rentBody.rental.id;

        // Paso 3: Verificar estado inicial (active)
        const rentalsBeforeRes = await page.request.get('/api/admin/rentals');
        expect(rentalsBeforeRes.status()).toBe(200);
        const rentalsBeforeBody = await rentalsBeforeRes.json();
        const rentalBefore = rentalsBeforeBody.rentals.find((r: any) => r.id === rentalId);
        expect(rentalBefore).toBeDefined();
        expect(rentalBefore.status).toBe('active');

        // Paso 4: Cancelar la reserva
        const cancelResponse = await page.request.post(`/api/admin/rentals/${rentalId}/cancel`);
        expect(cancelResponse.status()).toBe(200);
        const cancelBody = await cancelResponse.json();
        expect(cancelBody.ok).toBe(true);

        // Paso 5: Verificar que el estado cambió a canceled inmediatamente
        const rentalsAfterRes = await page.request.get('/api/admin/rentals');
        expect(rentalsAfterRes.status()).toBe(200);
        const rentalsAfterBody = await rentalsAfterRes.json();
        const rentalAfter = rentalsAfterBody.rentals.find((r: any) => r.id === rentalId);
        expect(rentalAfter).toBeDefined();
        expect(rentalAfter.status).toBe('canceled');
    });

    test('CT-RF006-01: Visualización de alquileres en admin', async ({ page, users }) => {
        // Paso 1: Login como admin y crear item
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF006-01-Item-${Date.now()}`);
        const itemId = item.id;

        // Paso 2: Crear varias reservas
        const publicCsrf = await getCsrf(page);
        const today = new Date();

        const rental1Form = {
            itemId: String(itemId),
            name: 'Cliente Uno',
            email: 'cliente1@example.com',
            phone: '099111111',
            size: 'M',
            start: formatDate(addDays(today, 20)),
            end: formatDate(addDays(today, 22)),
            csrf: publicCsrf,
        };

        const rental2Form = {
            itemId: String(itemId),
            name: 'Cliente Dos',
            email: 'cliente2@example.com',
            phone: '099222222',
            size: 'M',
            start: formatDate(addDays(today, 25)),
            end: formatDate(addDays(today, 27)),
            csrf: publicCsrf,
        };

        await page.request.post('/api/rentals', { form: rental1Form });
        await page.request.post('/api/rentals', { form: rental2Form });

        // Paso 3: Obtener lista de alquileres desde el endpoint admin
        const rentalsResponse = await page.request.get('/api/admin/rentals');
        expect(rentalsResponse.status()).toBe(200);

        const rentalsBody = await rentalsResponse.json();
        expect(rentalsBody.rentals).toBeDefined();
        expect(Array.isArray(rentalsBody.rentals)).toBeTruthy();

        // Paso 4: Verificar que contiene las reservas creadas
        const rentalsList = rentalsBody.rentals;
        const rental1 = rentalsList.find((r: any) => 
            r.customer.name === 'Cliente Uno' && r.customer.email === 'cliente1@example.com'
        );
        const rental2 = rentalsList.find((r: any) => 
            r.customer.name === 'Cliente Dos' && r.customer.email === 'cliente2@example.com'
        );

        expect(rental1).toBeDefined();
        expect(rental1.itemId).toBe(itemId);
        expect(rental1.customer.phone).toBe('099111111');
        expect(rental1.start).toBe(formatDate(addDays(today, 20)));
        expect(rental1.end).toBe(formatDate(addDays(today, 22)));

        expect(rental2).toBeDefined();
        expect(rental2.itemId).toBe(itemId);
        expect(rental2.customer.phone).toBe('099222222');
        expect(rental2.start).toBe(formatDate(addDays(today, 25)));
        expect(rental2.end).toBe(formatDate(addDays(today, 27)));
    });
});
