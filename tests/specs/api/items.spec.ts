import { test, expect } from '../../fixtures/api-fixture';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('RF002 - Item Detail & Description Validation (CT-RF002)', () => {

  async function loginAsAdmin(page: any, users: any) {
    await page.goto('/admin/login');

    await page.waitForFunction(() => {
      const csrf = document.querySelector<HTMLInputElement>('[name="csrf"]');
      return csrf && csrf.value !== '';
    });

    await page.locator('[name="username"]').fill(users.admin.user);
    await page.locator('[name="password"]').fill(users.admin.pass);
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
        images: ['/images/placeholder.jpg'],
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

  test('CT-RF002-03: Selector de talle sin stock (disponibilidad)', async ({ page, users }) => {
    // Para evitar interferencias entre tests paralelos, crear un item nuevo como admin
    await loginAsAdmin(page, users);
    const csrfAdminResp = await page.request.get('/api/csrf');
    expect(csrfAdminResp.ok()).toBeTruthy();
    const csrfAdmin = (await csrfAdminResp.json()).csrf;

    const newItemPayload = {
      name: `TestItem-RF002-03-${Date.now()}`,
      category: 'dress',
      sizes: ['M'],
      pricePerDay: 10,
      description: 'x'.repeat(60),
      images: ['/images/placeholder.jpg'],
      alt: 'test',
      csrf: csrfAdmin,
    } as any;

    const createRes = await page.request.post('/api/admin/items', { data: newItemPayload });
    expect(createRes.status()).toBe(201);
    const createdBody = await createRes.json();
    const item = createdBody.item;
    const itemId = item.id;

    // Comprobar availability inicial
    const avail0 = await page.request.get(`/api/items/${itemId}/availability`);
    expect(avail0.ok()).toBeTruthy();
    const availBody0 = await avail0.json();
    expect(availBody0.metadata).toBeDefined();
    const meta0 = availBody0.metadata;
    expect(meta0.totalUnits).toBeDefined();
    expect(typeof meta0.totalUnits).toBe('number');

    // Buscar un intervalo libre (hasta 30 días hacia adelante) antes de crear rental
    const availBefore = await page.request.get(`/api/items/${itemId}/availability`);
    expect(availBefore.ok()).toBeTruthy();
    const availBodyBefore = await availBefore.json();
    const existing = (availBodyBefore.rentals || []).map((r: any) => ({
      start: new Date(r.start),
      end: new Date(r.end),
    }));

    // Encontrar una ventana de 2 días que no solape con rentals existentes
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    let chosenStart: Date | null = null;
    let chosenEnd: Date | null = null;
    for (let offset = 1; offset <= 30; offset++) {
      const candStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);
      const candEnd = new Date(candStart.getFullYear(), candStart.getMonth(), candStart.getDate() + 1);
      const overlap = existing.some((r: { start: Date; end: Date; }) => !(candEnd.getTime() < r.start.getTime() || candStart.getTime() > r.end.getTime()));
      if (!overlap) {
        chosenStart = candStart;
        chosenEnd = candEnd;
        break;
      }
    }

    if (!chosenStart || !chosenEnd) {
      throw new Error('No free date window found for the next 30 days to run the availability test');
    }

    // Obtener CSRF token (public endpoint sets cookie)
    const csrfResp = await page.request.get('/api/csrf');
    expect(csrfResp.ok()).toBeTruthy();
    const csrfData = await csrfResp.json();
    const csrf = csrfData.csrf;

    // Crear rental para ocupar la unidad en el intervalo encontrado
    const form = {
      itemId: String(itemId),
      name: 'Test User',
      email: 'test@example.com',
      phone: '12345678',
      size: item.sizes && item.sizes[0] ? String(item.sizes[0]) : 'M',
      start: fmt(chosenStart),
      end: fmt(chosenEnd),
      csrf,
    };

    const rentRes = await page.request.post('/api/rentals', { form });
    expect(rentRes.status()).toBe(201);

    // Consultar availability después y verificar incremento de activeRentals
    const avail1 = await page.request.get(`/api/items/${itemId}/availability`);
    expect(avail1.ok()).toBeTruthy();
    const availBody1 = await avail1.json();
    const meta1 = availBody1.metadata;
    expect(meta1.activeRentals).toBeGreaterThanOrEqual((availBodyBefore.metadata?.activeRentals || 0) + 1);
    // Si totalUnits == activeRentals entonces el selector de talles debería marcar agotado en la UI
    expect(meta1.totalUnits).toBeDefined();
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
