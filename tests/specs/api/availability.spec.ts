
import { test, expect } from '../../fixtures/api-fixture';

// Helpers generales para clean code
async function loginAsAdmin(page: any, users: any) {
    await page.goto('/admin/login');
    await page.locator('[name="username"]').fill(users.admin.username);
    await page.locator('[name="password"]').fill(users.admin.password);
    await page.getByRole('button', { name: /sign in/i }).click();
    await page.waitForURL('/admin');
}

async function getCsrf(page: any) {
    const csrfResp = await page.request.get('/api/csrf');
    return (await csrfResp.json()).csrf;
}

async function createItem(page: any, csrf: any, name: string = `Item-${Date.now()}`) {
    const itemPayload = {
        name,
        category: 'dress',
        sizes: ['M'],
        pricePerDay: 10,
        description: 'x'.repeat(60),
            images: ['/images/placeholder.jpg'],
        alt: 'test',
        csrf,
    };
    const createRes = await page.request.post('/api/admin/items', { data: itemPayload });
    return (await createRes.json()).item;
}

function fmt(date: any): string {
    return date.toISOString().split('T')[0];
}

function addDays(date: any, days: any): Date {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
}


test.use({ baseURL: 'http://localhost:3000' });

test.describe('RF003 - Disponibilidad y calendario (CT-RF003)', () => {
    // CT-RF003-01: Búsqueda por fecha inválida
    // Este caso se valida en el frontend (datepicker/rango permitido).
    // No se automatiza en la API porque el backend no filtra fechas fuera de rango.

    test('CT-RF003-02: Calendario muestra disponibilidad', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF003-02-Item-${Date.now()}`);
        const itemId = item.id;
        const today = new Date();
        const start = fmt(addDays(today, 2));
        const end = fmt(addDays(today, 3));
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '12345678',
            size: 'M',
            start,
            end,
            csrf,
        };
        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });
        expect(rentRes.status()).toBe(201);
        const availRes = await page.request.get(`/api/items/${itemId}/availability`);
        expect(availRes.status()).toBe(200);
        const availBody = await availRes.json();
        const reserved = availBody.rentals.some((r: any) => r.start === start && r.end === end);
        expect(reserved).toBeTruthy();
    });

    test('CT-RF003-03: Selección de fecha ocupada', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF003-03-Item-${Date.now()}`);
        const itemId = item.id;
        const today = new Date();
        const start = fmt(addDays(today, 5));
        const end = fmt(addDays(today, 6));
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '12345678',
            size: 'M',
            start,
            end,
            csrf,
        };
        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });
        expect(rentRes.status()).toBe(201);
        const rentRes2 = await page.request.post('/api/rentals', { form: rentalForm });
        expect(rentRes2.status()).toBe(409);
        const body2 = await rentRes2.json();
        expect(body2.error).toMatch(/not available/i);
    });

    test('CT-RF003-04: Actualización en tiempo real', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF003-04-Item-${Date.now()}`);
        const itemId = item.id;
        const availResBefore = await page.request.get(`/api/items/${itemId}/availability`);
        const availBodyBefore = await availResBefore.json();
        const today = new Date();
        const start = fmt(addDays(today, 7));
        const end = fmt(addDays(today, 8));
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '12345678',
            size: 'M',
            start,
            end,
            csrf,
        };
        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });
        expect(rentRes.status()).toBe(201);
        const availResAfter = await page.request.get(`/api/items/${itemId}/availability`);
        const availBodyAfter = await availResAfter.json();
        const reservedBefore = availBodyBefore.rentals.some((r: any) => r.start === start && r.end === end);
        const reservedAfter = availBodyAfter.rentals.some((r: any) => r.start === start && r.end === end);
        expect(reservedBefore).toBeFalsy();
        expect(reservedAfter).toBeTruthy();
    });

    test('CT-RF003-05: Disponibilidad con múltiples unidades', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        // Crear dos items con mismo nombre para simular 2 unidades
        const name = `RF003-05-Item-Multi-${Date.now()}`;
        const item1 = await createItem(page, csrf, name);
        const item2 = await createItem(page, csrf, name);
        const today = new Date();
        const start = fmt(addDays(today, 10));
        const end = fmt(addDays(today, 11));
        const rentalForm1 = {
            itemId: String(item1.id),
            name: 'Test User',
            email: 'test@example.com',
            phone: '12345678',
            size: 'M',
            start,
            end,
            csrf,
        };
        const rentRes1 = await page.request.post('/api/rentals', { form: rentalForm1 });
        expect(rentRes1.status()).toBe(201);
        const rentalForm2 = { ...rentalForm1, itemId: String(item2.id) };
        const rentRes2 = await page.request.post('/api/rentals', { form: rentalForm2 });
        expect(rentRes2.status()).toBe(201);
        const availRes1 = await page.request.get(`/api/items/${item1.id}/availability`);
        const availRes2 = await page.request.get(`/api/items/${item2.id}/availability`);
        const availBody1 = await availRes1.json();
        const availBody2 = await availRes2.json();
        const reserved1 = availBody1.rentals.some((r: any) => r.start === start && r.end === end);
        const reserved2 = availBody2.rentals.some((r: any) => r.start === start && r.end === end);
        expect(reserved1).toBeTruthy();
        expect(reserved2).toBeTruthy();
    });

    test('CT-RF003-06: Alquiler de 1 día (start = end)', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF003-06-Item-${Date.now()}`);
        const itemId = item.id;
        const oneDay = '2025-12-01';
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '12345678',
            size: 'M',
            start: oneDay,
            end: oneDay,
            csrf,
        };
        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });
        if (rentRes.status() === 201) {
            const body = await rentRes.json();
            expect(body.rental).toBeDefined();
        } else {
            expect(rentRes.status()).toBe(400);
            const body = await rentRes.json();
            expect(body.error).toMatch(/(invalid|same day|date)/i);
        }
    });

    test('CT-RF003-07: Fecha de inicio en el pasado', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF003-07-Item-${Date.now()}`);
        const itemId = item.id;
        const pastDay = '2024-01-01';
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '12345678',
            size: 'M',
            start: pastDay,
            end: '2025-12-02',
            csrf,
        };
        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });
        expect(rentRes.status()).toBe(400);
        const body = await rentRes.json();
        expect(body.error).toBe('Dates cannot be in the past');
    });

    test('CT-RF003-08: Fecha de fin anterior a inicio', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF003-08-Item-${Date.now()}`);
        const itemId = item.id;
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '12345678',
            size: 'M',
            start: '2025-12-10',
            end: '2025-12-05',
            csrf,
        };
        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });
        expect(rentRes.status()).toBe(400);
        const body = await rentRes.json();
        expect(body.error).toBe('End date must be after start date');
    });

});
