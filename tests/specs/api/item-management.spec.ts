import { test, expect } from '../../fixtures/base';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('API - Gestión de Artículos', () => {
    
    // Helper: Login como admin y retornar el contexto autenticado
    async function loginAsAdmin(page: any, users: any) {
        await page.goto('/admin/login');
        
        await page.waitForFunction(() => {
            const csrf = document.querySelector<HTMLInputElement>('[name="csrf"]');
            return csrf && csrf.value !== '';
        });

        await page.locator('[name="username"]').fill(users.admin.username);
        await page.locator('[name="password"]').fill(users.admin.password);
        await page.getByRole('button', { name: /sign in/i }).click();
        await page.waitForURL('/admin');
    }

    test('CT-RF005-01: Creación de artículo con datos completos', async ({ page, users }) => {
        // Paso 1: Login admin
        await loginAsAdmin(page, users);

        // Paso 2: Obtener CSRF token
        const csrfResponse = await page.request.get('/api/csrf');
        expect(csrfResponse.ok()).toBeTruthy();
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrf;

        // Paso 3: Crear artículo con todos los datos
        const newItem = {
            name: 'Vestido de Prueba',
            category: 'dress',
            sizes: ['S', 'M', 'L'],
            pricePerDay: 50,
            color: 'Rojo',
            style: 'Elegante',
            description: 'Vestido elegante de prueba para tests automatizados',
            images: ['https://example.com/image1.jpg'],
            alt: 'Vestido rojo elegante',
            csrf: csrfToken
        };

        const createResponse = await page.request.post('/api/admin/items', {
            data: newItem
        });

        // Resultado esperado: status 201 y artículo creado
        expect(createResponse.status()).toBe(201);
        
        const responseBody = await createResponse.json();
        expect(responseBody.item).toBeDefined();
        expect(responseBody.item.name).toBe(newItem.name);
        expect(responseBody.item.category).toBe(newItem.category);
        expect(responseBody.item.pricePerDay).toBe(newItem.pricePerDay);

        // Verificar que el artículo aparece en el catálogo público
        const itemsResponse = await page.request.get('/api/items');
        expect(itemsResponse.ok()).toBeTruthy();
        const itemsData = await itemsResponse.json();
        
        const createdItem = itemsData.items.find((item: any) => item.name === newItem.name);
        expect(createdItem).toBeDefined();
    });

    test('CT-RF005-02: Crear artículo sin datos requeridos', async ({ page, users }) => {
        // Paso 1: Login admin
        await loginAsAdmin(page, users);

        // Paso 2: Obtener CSRF token
        const csrfResponse = await page.request.get('/api/csrf');
        expect(csrfResponse.ok()).toBeTruthy();
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrf;

        // Paso 3: Intentar crear artículo sin campos obligatorios (name, category, pricePerDay)
        const incompleteItem = {
            color: 'Azul',
            style: 'Casual',
            csrf: csrfToken
            // faltan los campos de name, category, pricePerDay, sizes
        };

        const createResponse = await page.request.post('/api/admin/items', {
            data: incompleteItem
        });

        // Resultado esperado: status 400 y mensaje de error
        expect(createResponse.status()).toBe(400);
        
        const responseBody = await createResponse.json();
        expect(responseBody.error).toBeDefined();
        expect(responseBody.error).toMatch(/missing fields/i);
    });

    test('CT-RF005-02b: Crear artículo sin nombre', async ({ page, users }) => {
        await loginAsAdmin(page, users);

        const csrfResponse = await page.request.get('/api/csrf');
        const csrfData = await csrfResponse.json();

        const itemWithoutName = {
            name: '',
            category: 'dress',
            sizes: ['M'],
            pricePerDay: 100,
            csrf: csrfData.csrf
        };

        const createResponse = await page.request.post('/api/admin/items', {
            data: itemWithoutName
        });

        // Resultado esperado: status 400
        expect(createResponse.status()).toBe(400);
        const responseBody = await createResponse.json();
        expect(responseBody.error).toMatch(/missing fields/i);
    });

    test('CT-RF005-02c: Crear artículo sin precio', async ({ page, users }) => {
        await loginAsAdmin(page, users);

        const csrfResponse = await page.request.get('/api/csrf');
        const csrfData = await csrfResponse.json();

        const itemWithoutPrice = {
            name: 'Vestido sin precio',
            category: 'dress',
            sizes: ['S', 'M'],
            pricePerDay: 0,
            csrf: csrfData.csrf
        };

        const createResponse = await page.request.post('/api/admin/items', {
            data: itemWithoutPrice
        });

        // Resultado esperado: status 400
        expect(createResponse.status()).toBe(400);
        const responseBody = await createResponse.json();
        expect(responseBody.error).toMatch(/missing fields/i);
    });

    test('CT-RF005-03: Editar artículo existente', async ({ page, users }) => {
        // Paso 1: Login admin
        await loginAsAdmin(page, users);

        // Paso 2: Obtener CSRF token
        const csrfResponse = await page.request.get('/api/csrf');
        expect(csrfResponse.ok()).toBeTruthy();
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrf;

        // Paso 3: Primero crear un artículo para luego editarlo
        const originalItem = {
            name: 'Vestido Original',
            category: 'dress',
            sizes: ['S', 'M'],
            pricePerDay: 50,
            color: 'Negro',
            style: 'Formal',
            description: 'Descripción original',
            images: ['https://example.com/image1.jpg'],
            alt: 'Vestido negro',
            csrf: csrfToken
        };

        const createResponse = await page.request.post('/api/admin/items', {
            data: originalItem
        });
        expect(createResponse.status()).toBe(201);
        const createBody = await createResponse.json();
        const itemId = createBody.item.id;

        // Paso 4: Obtener nuevo CSRF token para la edición
        const csrfResponse2 = await page.request.get('/api/csrf');
        const csrfData2 = await csrfResponse2.json();

        // Paso 5: Editar el artículo creado
        const updatedData = {
            name: 'Vestido Actualizado',
            category: 'dress',
            sizes: ['S', 'M', 'L', 'XL'],
            pricePerDay: 75,
            color: 'Azul',
            style: 'Casual',
            description: 'Descripción actualizada con más detalles',
            images: ['https://example.com/image2.jpg', 'https://example.com/image3.jpg'],
            alt: 'Vestido azul casual',
            csrf: csrfData2.csrf
        };

        const updateResponse = await page.request.put(`/api/admin/items/${itemId}`, {
            data: updatedData
        });

        // Resultado esperado: status 200 y artículo actualizado
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

        const csrfResponse = await page.request.get('/api/csrf');
        const csrfData = await csrfResponse.json();

        const updatedData = {
            name: 'Intento de actualización',
            category: 'dress',
            pricePerDay: 100,
            csrf: csrfData.csrf
        };

        // Intentar editar item con ID que no existe (99999)
        const updateResponse = await page.request.put('/api/admin/items/99999', {
            data: updatedData
        });

        // Resultado esperado: status 404
        expect(updateResponse.status()).toBe(404);
        const responseBody = await updateResponse.json();
        expect(responseBody.error).toMatch(/not found/i);
    });

    test('CT-RF005-04: Eliminar artículo con confirmación', async ({ page, users }) => {
        // Paso 1: Login admin
        await loginAsAdmin(page, users);

        // Paso 2: Obtener CSRF token
        const csrfResponse = await page.request.get('/api/csrf');
        expect(csrfResponse.ok()).toBeTruthy();
        const csrfData = await csrfResponse.json();
        const csrfToken = csrfData.csrf;

        // Paso 3: Crear un articulo para eliminarlo
        const itemToDelete = {
            name: 'Vestido para Eliminar',
            category: 'dress',
            sizes: ['M'],
            pricePerDay: 30,
            color: 'Verde',
            csrf: csrfToken
        };

        const createResponse = await page.request.post('/api/admin/items', {
            data: itemToDelete
        });
        expect(createResponse.status()).toBe(201);
        const createBody = await createResponse.json();
        const itemId = createBody.item.id;

        // Paso 4: Obtener token para el DELETE
        const csrfResponse2 = await page.request.get('/api/csrf');
        const csrfData2 = await csrfResponse2.json();

        // Paso 5: Eliminar el articulo
        const deleteResponse = await page.request.delete(`/api/admin/items/${itemId}`, {
            data: {
                csrf: csrfData2.csrf
            }
        });

        // Resultado esperado: status 200 y success true
        expect(deleteResponse.status()).toBe(200);
        
        const deleteBody = await deleteResponse.json();
        expect(deleteBody.success).toBe(true);

        // Paso 6: Verificar que el artículo ya no existe en el catalogo
        const itemsResponse = await page.request.get('/api/admin/items');
        expect(itemsResponse.ok()).toBeTruthy();
        const itemsData = await itemsResponse.json();
        
        const deletedItem = itemsData.items.find((item: any) => item.id === itemId);
        expect(deletedItem).toBeUndefined();
    });

    test('CT-RF005-04b: Eliminar artículo inexistente', async ({ page, users }) => {
        await loginAsAdmin(page, users);

        const csrfResponse = await page.request.get('/api/csrf');
        const csrfData = await csrfResponse.json();

        // Intentar eliminar item con ID que no existe
        const deleteResponse = await page.request.delete('/api/admin/items/99999', {
            data: {
                csrf: csrfData.csrf
            }
        });

        // Resultado esperado: status 404
        expect(deleteResponse.status()).toBe(404);
        const responseBody = await deleteResponse.json();
        expect(responseBody.error).toMatch(/not found/i);
    });
});




