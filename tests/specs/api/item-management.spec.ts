
import { test, expect } from '../../fixtures/api-fixture';

// Helpers generales
async function loginAsAdmin(page: any, users: any) {
    const csrfResponse = await page.request.get('/api/csrf');
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrf;

    const loginResponse = await page.request.post('/api/admin/login', {
        form: {
            username: users.admin.user,
            password: users.admin.pass,
            csrf: csrfToken
        }
    });

    if (loginResponse.status() !== 200) {
        throw new Error(`Login failed with status ${loginResponse.status()}`);
    }
}

async function getCsrf(page: any): Promise<string> {
    const csrfResponse = await page.request.get('/api/csrf');
    const csrfData = await csrfResponse.json();
    return csrfData.csrf;
}

async function createItem(page: any, csrf: string, overrides: any = {}) {
    const defaultItem = {
        name: 'Vestido de Prueba',
        category: 'dress',
        sizes: ['S', 'M', 'L'],
        pricePerDay: 50,
        color: 'Rojo',
        style: 'Elegante',
        description: 'x'.repeat(60),
        images: ['/images/placeholder.jpg'],
        alt: 'Vestido rojo elegante',
        csrf
    };
    const itemData = { ...defaultItem, ...overrides };
    const createResponse = await page.request.post('/api/admin/items', { data: itemData });
    return createResponse;
}

test.use({ baseURL: 'http://localhost:3000' });

test.describe('API - Gestión de Artículos', () => {

    test('CT-RF005-01: Creación de artículo con datos completos', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const createResponse = await createItem(page, csrf, {
            description: 'Vestido elegante de prueba para tests automatizados',
            color: 'Rojo',
            style: 'Elegante',
            alt: 'Vestido rojo elegante',
        });
        expect(createResponse.status()).toBe(201);
        const responseBody = await createResponse.json();
        expect(responseBody.item).toBeDefined();
        expect(responseBody.item.name).toBe('Vestido de Prueba');
        expect(responseBody.item.category).toBe('dress');
        expect(responseBody.item.pricePerDay).toBe(50);
        // Verificar que el artículo aparece en el catálogo público
        const itemsResponse = await page.request.get('/api/items');
        expect(itemsResponse.ok()).toBeTruthy();
        const itemsData = await itemsResponse.json();
        const createdItem = itemsData.items.find((item: any) => item.name === 'Vestido de Prueba');
        expect(createdItem).toBeDefined();
    });

    test('CT-RF005-02: Crear artículo sin datos requeridos', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const createResponse = await createItem(page, csrf, {
            name: undefined,
            category: undefined,
            pricePerDay: undefined,
            sizes: undefined,
            color: 'Azul',
            style: 'Casual',
        });
        expect(createResponse.status()).toBe(400);
        const responseBody = await createResponse.json();
        expect(responseBody.error).toBeDefined();
        expect(responseBody.error).toMatch(/missing fields/i);
    });

    test('CT-RF005-02b: Crear artículo sin nombre', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const createResponse = await createItem(page, csrf, {
            name: '',
            category: 'dress',
            sizes: ['M'],
            pricePerDay: 100,
        });
        expect(createResponse.status()).toBe(400);
        const responseBody = await createResponse.json();
        expect(responseBody.error).toMatch(/missing fields/i);
    });

    test('CT-RF005-02c: Crear artículo sin precio', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const createResponse = await createItem(page, csrf, {
            name: 'Vestido sin precio',
            category: 'dress',
            sizes: ['S', 'M'],
            pricePerDay: 0,
        });
        expect(createResponse.status()).toBe(400);
        const responseBody = await createResponse.json();
        expect(responseBody.error).toMatch(/missing fields/i);
    });

    test('CT-RF005-03: Editar artículo existente', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        // Crear artículo original
        const createResponse = await createItem(page, csrf, {
            name: 'Vestido Original',
            sizes: ['S', 'M'],
            pricePerDay: 50,
            color: 'Negro',
            style: 'Formal',
            description: 'x'.repeat(60),
            images: ['https://example.com/image1.jpg'],
            alt: 'Vestido negro',
        });
        expect(createResponse.status()).toBe(201);
        const createBody = await createResponse.json();
        const itemId = createBody.item.id;
        // Nuevo CSRF para edición
        const csrf2 = await getCsrf(page);
        // Editar el artículo
        const updatedData = {
            name: 'Vestido Actualizado',
            category: 'dress',
            sizes: ['S', 'M', 'L', 'XL'],
            pricePerDay: 75,
            color: 'Azul',
            style: 'Casual',
            description: 'Descripción actualizada con más detalles',
            images: ['/images/placeholder.jpg'],
            alt: 'Vestido azul casual',
            csrf: csrf2
        };
        const updateResponse = await page.request.put(`/api/admin/items/${itemId}`, {
            data: updatedData
        });
        expect(updateResponse.status()).toBe(200);
        const updateBody = await updateResponse.json();
        expect(updateBody.item).toBeDefined();
        expect(updateBody.item.id).toBe(itemId);
        expect(updateBody.item.name).toBe(updatedData.name);
        expect(updateBody.item.pricePerDay).toBe(updatedData.pricePerDay);
        expect(updateBody.item.color).toBe(updatedData.color);
        expect(updateBody.item.style).toBe(updatedData.style);
        expect(updateBody.item.sizes).toEqual(updatedData.sizes);
        // Verificar que los cambios se reflejan en el catálogo
        const itemsResponse = await page.request.get('/api/admin/items');
        expect(itemsResponse.ok()).toBeTruthy();
        const itemsData = await itemsResponse.json();
        const updatedItem = itemsData.items.find((item: any) => item.id === itemId);
        expect(updatedItem).toBeDefined();
        expect(updatedItem.name).toBe(updatedData.name);
        expect(updatedItem.pricePerDay).toBe(updatedData.pricePerDay);
    });

    test('CT-RF005-03b: Editar artículo inexistente', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const updatedData = {
            name: 'Intento de actualización',
            category: 'dress',
            pricePerDay: 100,
            csrf
        };
        const updateResponse = await page.request.put('/api/admin/items/99999', {
            data: updatedData
        });
        expect(updateResponse.status()).toBe(404);
        const responseBody = await updateResponse.json();
        expect(responseBody.error).toMatch(/not found/i);
    });

    test('CT-RF005-04: Eliminar artículo con confirmación', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        // Crear artículo para eliminar
        const createResponse = await createItem(page, csrf, {
            name: 'Vestido para Eliminar',
            sizes: ['M'],
            pricePerDay: 30,
            color: 'Verde',
        });
        expect(createResponse.status()).toBe(201);
        const createBody = await createResponse.json();
        const itemId = createBody.item.id;
        // Nuevo CSRF para el DELETE
        const csrf2 = await getCsrf(page);
        // Eliminar el artículo
        const deleteResponse = await page.request.delete(`/api/admin/items/${itemId}`, {
            data: { csrf: csrf2 }
        });
        expect(deleteResponse.status()).toBe(200);
        const deleteBody = await deleteResponse.json();
        expect(deleteBody.success).toBe(true);
        // Verificar que el artículo ya no existe en el catálogo
        const itemsResponse = await page.request.get('/api/admin/items');
        expect(itemsResponse.ok()).toBeTruthy();
        const itemsData = await itemsResponse.json();
        const deletedItem = itemsData.items.find((item: any) => item.id === itemId);
        expect(deletedItem).toBeUndefined();
    });

    test('CT-RF005-04b: Eliminar artículo inexistente', async ({ page, users }) => {
        await loginAsAdmin(page, users);
        const csrf = await getCsrf(page);
        const deleteResponse = await page.request.delete('/api/admin/items/99999', {
            data: { csrf }
        });
        expect(deleteResponse.status()).toBe(404);
        const responseBody = await deleteResponse.json();
        expect(responseBody.error).toMatch(/not found/i);
    });
});




