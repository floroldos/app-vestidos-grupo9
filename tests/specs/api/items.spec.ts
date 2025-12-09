import { test, expect } from '../../fixtures/api-fixture';
import { loginAsAdmin, getCsrf, createTestItem, getAvailability, createRental } from '../../utils/api-helpers';
import { findAvailableDates } from '../../utils/date-helpers';

test.use({ baseURL: 'http://localhost:3000' });

test.describe('RF002 - Item Detail & Description Validation (CT-RF002)', () => {

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
    // Arrange: Crear item de prueba y obtener disponibilidad inicial
    await loginAsAdmin(page, users);
    const csrfAdmin = await getCsrf(page);
    const item = await createTestItem(page, csrfAdmin, `TestItem-RF002-03-${Date.now()}`);
    
    const availBefore = await getAvailability(page, item.id);
    expect(availBefore.metadata).toBeDefined();
    expect(availBefore.metadata.totalUnits).toBeDefined();
    expect(typeof availBefore.metadata.totalUnits).toBe('number');
    
    // Arrange: Encontrar fechas disponibles
    const { start, end } = findAvailableDates(availBefore.rentals || []);
    
    // Act: Crear rental para ocupar la unidad
    const csrfPublic = await getCsrf(page);
    const size = item.sizes && item.sizes[0] ? String(item.sizes[0]) : 'M';
    await createRental(page, item.id, size, start, end, csrfPublic);
    
    // Assert: Verificar incremento de activeRentals
    const availAfter = await getAvailability(page, item.id);
    const activeRentalsBefore = availBefore.metadata?.activeRentals || 0;
    expect(availAfter.metadata.activeRentals).toBeGreaterThanOrEqual(activeRentalsBefore + 1);
    expect(availAfter.metadata.totalUnits).toBeDefined();
  });

});
