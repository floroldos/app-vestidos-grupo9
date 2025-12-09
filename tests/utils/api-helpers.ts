import { expect } from '@playwright/test';

/**
 * Helper para login como administrador via API
 */
export async function loginAsAdmin(page: any, users: any) {
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

/**
 * Obtiene un token CSRF del endpoint público
 */
export async function getCsrf(page: any): Promise<string> {
    const csrfResp = await page.request.get('/api/csrf');
    const csrfData = await csrfResp.json();
    return csrfData.csrf;
}

/**
 * Crea un item de prueba como admin
 */
export async function createTestItem(page: any, csrf: string, name: string) {
    const payload = {
        name,
        category: 'dress',
        sizes: ['M'],
        pricePerDay: 10,
        description: 'x'.repeat(60),
        images: ['/images/placeholder.jpg'],
        alt: 'test',
        csrf,
    };

    const createRes = await page.request.post('/api/admin/items', { data: payload });
    expect(createRes.status()).toBe(201);
    const body = await createRes.json();
    return body.item;
}

/**
 * Obtiene información de disponibilidad de un item
 */
export async function getAvailability(page: any, itemId: number) {
    const availRes = await page.request.get(`/api/items/${itemId}/availability`);
    expect(availRes.ok()).toBeTruthy();
    return await availRes.json();
}

/**
 * Crea un rental via API
 */
export async function createRental(
    page: any,
    itemId: number,
    size: string,
    start: Date,
    end: Date,
    csrf: string
) {
    const form = {
        itemId: String(itemId),
        name: 'Test User',
        email: 'test@example.com',
        phone: '12345678',
        size,
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0],
        csrf,
    };

    const rentRes = await page.request.post('/api/rentals', { form });
    expect(rentRes.status()).toBe(201);
}
