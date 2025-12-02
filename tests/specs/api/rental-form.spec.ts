import { test, expect } from '../../fixtures/api-fixture';
import { loginAsAdmin, getCsrf } from '../../helpers/api-helpers';

async function createItem(page: any, csrf: string, name: string = `TestItem-${Date.now()}`) {
    const itemPayload = {
        name,
        category: 'dress',
        sizes: ['S', 'M', 'L'],
        pricePerDay: 50,
        description: 'x'.repeat(60),
        images: ['/images/placeholder.jpg'],
        alt: 'test',
        csrf,
    };
    const createRes = await page.request.post('/api/admin/items', { data: itemPayload });
    const body = await createRes.json();
    return body.item;
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

function addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}

test.use({ baseURL: 'http://localhost:3000' });

test.describe('RF004 - Formulario de Alquiler (CT-RF004)', () => {

    test('CT-RF004-01: Programación de alquiler válida', async ({ page, users }) => {
        // Crear item como admin
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF004-01-Item-${Date.now()}`);
        const itemId = item.id;

        // Obtener nuevo CSRF token para el formulario público
        const publicCsrf = await getCsrf(page);

        // Crear solicitud de alquiler con datos válidos
        const today = new Date();
        const start = formatDate(addDays(today, 2));
        const end = formatDate(addDays(today, 5));

        const rentalForm = {
            itemId: String(itemId),
            name: 'Ana Pérez',
            email: 'ana.perez@example.com',
            phone: '099123123',
            size: 'M',
            start,
            end,
            csrf: publicCsrf,
        };

        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });

        // Resultado esperado: Solicitud creada exitosamente
        expect(rentRes.status()).toBe(201);
        const body = await rentRes.json();
        expect(body.rental).toBeDefined();
        expect(body.rental.customer.name).toBe('Ana Pérez');
        expect(body.rental.customer.email).toBe('ana.perez@example.com');
        expect(body.rental.customer.phone).toBe('099123123');
    });

    test('CT-RF004-02: Validaciones - email inválido retorna error API', async ({ page, users }) => {
        // Crear item
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF004-02-Item-${Date.now()}`);
        const itemId = item.id;

        const publicCsrf = await getCsrf(page);

        const today = new Date();
        const start = formatDate(addDays(today, 2));
        const end = formatDate(addDays(today, 5));

        // Intentar crear con email inválido a través de la API
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'ana@',
            phone: '099123123',
            size: 'M',
            start,
            end,
            csrf: publicCsrf,
        };

        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });

        // Resultado esperado: Error de validación desde la API
        expect(rentRes.status()).toBe(400);
        const body = await rentRes.json();
        expect(body.error).toMatch(/email|invalid/i);
    });

    test('CT-RF004-03: Email con formato inválido', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF004-03-Item-${Date.now()}`);
        const itemId = item.id;

        const publicCsrf = await getCsrf(page);

        const today = new Date();
        const start = formatDate(addDays(today, 2));
        const end = formatDate(addDays(today, 5));

        const invalidEmails = ['usuario@', 'usuario', '@domain.com', 'user@domain', 'user @domain.com'];

        for (const invalidEmail of invalidEmails) {
            const rentalForm = {
                itemId: String(itemId),
                name: 'Test User',
                email: invalidEmail,
                phone: '099123123',
                size: 'M',
                start,
                end,
                csrf: publicCsrf,
            };

            const rentRes = await page.request.post('/api/rentals', { form: rentalForm });

            // Resultado esperado: Mensaje de error indicando email inválido
            expect(rentRes.status()).toBe(400);
            const body = await rentRes.json();
            expect(body.error).toMatch(/email|invalid/i);
        }
    });

    test('CT-RF004-04: Teléfono con caracteres inválidos', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF004-04-Item-${Date.now()}`);
        const itemId = item.id;

        const publicCsrf = await getCsrf(page);

        const today = new Date();
        const start = formatDate(addDays(today, 2));
        const end = formatDate(addDays(today, 5));

        // Intentar con teléfono que contiene letras
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: 'abc123',
            size: 'M',
            start,
            end,
            csrf: publicCsrf,
        };

        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });

        // Resultado esperado: Mensaje de error (solo 7-15 dígitos)
        expect(rentRes.status()).toBe(400);
        const body = await rentRes.json();
        expect(body.error).toMatch(/phone|invalid|digit/i);
    });

    test('CT-RF004-05: Campos con solo espacios en blanco', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF004-05-Item-${Date.now()}`);
        const itemId = item.id;

        const publicCsrf = await getCsrf(page);

        const today = new Date();
        const start = formatDate(addDays(today, 2));
        const end = formatDate(addDays(today, 5));

        // Intentar con nombre solo con espacios
        const rentalForm = {
            itemId: String(itemId),
            name: '   ',
            email: 'test@example.com',
            phone: '099123123',
            size: 'M',
            start,
            end,
            csrf: publicCsrf,
        };

        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });

        // Resultado esperado: Formulario rechazado - campo requerido
        expect(rentRes.status()).toBe(400);
        const body = await rentRes.json();
        expect(body.error).toMatch(/missing|invalid|fields/i);
    });

    test('CT-RF004-06: Nombre con longitud mínima', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF004-06-Item-${Date.now()}`);
        const itemId = item.id;

        const publicCsrf = await getCsrf(page);

        const today = new Date();
        const start = formatDate(addDays(today, 2));
        const end = formatDate(addDays(today, 5));

        // Intentar con nombre de 1 caracter
        const rentalForm = {
            itemId: String(itemId),
            name: 'A',
            email: 'test@example.com',
            phone: '099123123',
            size: 'M',
            start,
            end,
            csrf: publicCsrf,
        };

        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });

        // Resultado esperado: Mensaje de error solicitando al menos 2 caracteres
        expect(rentRes.status()).toBe(400);
        const body = await rentRes.json();
        expect(body.error).toMatch(/name|character|length|min/i);
    });

    test('CT-RF004-07: Teléfono con menos de 7 dígitos', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF004-07-Item-${Date.now()}`);
        const itemId = item.id;

        const publicCsrf = await getCsrf(page);

        const today = new Date();
        const start = formatDate(addDays(today, 2));
        const end = formatDate(addDays(today, 5));

        // Intentar con teléfono de 6 dígitos
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '123456',
            size: 'M',
            start,
            end,
            csrf: publicCsrf,
        };

        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });

        // Resultado esperado: Mensaje de error (debe tener entre 7-15 dígitos)
        expect(rentRes.status()).toBe(400);
        const body = await rentRes.json();
        expect(body.error).toMatch(/phone|7.*15|digit/i);
    });

    test('CT-RF004-08: Teléfono con más de 15 dígitos', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF004-08-Item-${Date.now()}`);
        const itemId = item.id;

        const publicCsrf = await getCsrf(page);

        const today = new Date();
        const start = formatDate(addDays(today, 2));
        const end = formatDate(addDays(today, 5));

        // Intentar con teléfono de 16 dígitos
        const rentalForm = {
            itemId: String(itemId),
            name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890123456',
            size: 'M',
            start,
            end,
            csrf: publicCsrf,
        };

        const rentRes = await page.request.post('/api/rentals', { form: rentalForm });

        // Resultado esperado: Mensaje de error (debe tener entre 7-15 dígitos)
        expect(rentRes.status()).toBe(400);
        const body = await rentRes.json();
        expect(body.error).toMatch(/phone|7.*15|digit/i);
    });

    test('CT-RF004-09: Respuesta exitosa de API tras reserva válida', async ({ page, users }) => {
        // Crear item
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const item = await createItem(page, csrf, `RF004-09-Item-${Date.now()}`);
        const itemId = item.id;

        const publicCsrf = await getCsrf(page);

        const today = new Date();
        const start = formatDate(addDays(today, 2));
        const end = formatDate(addDays(today, 5));

        // Crear reserva con datos válidos
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

        // Resultado esperado: Respuesta exitosa con status 201 y datos del rental
        expect(rentRes.status()).toBe(201);
        const body = await rentRes.json();
        expect(body.rental).toBeDefined();
        expect(body.rental.id).toBeDefined();
        expect(body.rental.itemId).toBe(itemId);
        expect(body.rental.customer.name).toBe('Test User');
        expect(body.rental.customer.email).toBe('test@example.com');
        expect(body.rental.status).toBe('active');
    });
});
