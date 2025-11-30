import { test, expect } from '../../fixtures/base';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('RF002 - Item Detail & Description Validation (CT-RF002)', () => {

  // Helper: Login como admin (reutilizado de items.spec.ts)
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

  test('CT-RF002-01: Página de detalle (campos obligatorios)', async ({ page }) => {
    // Leer catálogo y tomar el primer item
    const itemsResponse = await page.request.get('/api/items');
    expect(itemsResponse.ok()).toBeTruthy();
    const itemsBody = await itemsResponse.json();
    const items = Array.isArray(itemsBody) ? itemsBody : itemsBody?.items ?? [];
    expect(items.length).toBeGreaterThan(0);

    const it = items[0];
    // Campos esperados
    expect(it.id).toBeDefined();
    expect(typeof it.name).toBe('string');
    expect(Array.isArray(it.sizes) || typeof it.sizes === 'string').toBeTruthy();
    const sizes = Array.isArray(it.sizes) ? it.sizes : JSON.parse(it.sizes || '[]');
    expect(sizes.length).toBeGreaterThan(0);
    expect(typeof it.pricePerDay === 'number' || typeof it.pricePerDay === 'string').toBeTruthy();
    expect(typeof it.description === 'string' || it.description === undefined).toBeTruthy();
  });

  test('CT-RF002-02: Validación de longitud de descripción (49,50,500,501 caracteres)', async ({ page, users }) => {
    await loginAsAdmin(page, users);

    // Obtener CSRF token (admin context)
    const csrfResp = await page.request.get('/api/csrf');
    expect(csrfResp.ok()).toBeTruthy();
    const csrfData = await csrfResp.json();
    const csrf = csrfData.csrf;

    const lengths = [49, 50, 500, 501];
    for (const len of lengths) {
      const desc = 'x'.repeat(len);
      const payload = {
        name: `DescLength${len}`,
        category: 'dress',
        sizes: ['M'],
        pricePerDay: 10,
        description: desc,
        images: ['https://example.com/x.jpg'],
        alt: 'test',
        csrf,
      } as any;

      const res = await page.request.post('/api/admin/items', { data: payload });

      if (len === 49 || len === 501) {
        expect(res.status()).toBe(400);
      } else {
        expect(res.status()).toBe(201);
        const body = await res.json();
        expect(body.item).toBeDefined();
      }
    }
  });

  test('CT-RF002-04: Precio mostrado correctamente (campo API)', async ({ page }) => {
    const itemsResp = await page.request.get('/api/items');
    expect(itemsResp.ok()).toBeTruthy();
    const itemsBody = await itemsResp.json();
    const items = Array.isArray(itemsBody) ? itemsBody : itemsBody?.items ?? [];
    expect(items.length).toBeGreaterThan(0);

    for (const it of items) {
      expect(it.pricePerDay).toBeDefined();
      // Debe ser un número mayor o igual a 0
      const price = Number(it.pricePerDay);
      expect(Number.isFinite(price)).toBeTruthy();
      expect(price).toBeGreaterThanOrEqual(0);
      break;
    }
  });

});
