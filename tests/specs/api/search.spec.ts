import { test, expect } from '../../fixtures/api-fixture';

const BASE = process.env.BASE_URL || 'http://localhost:3000';

test.describe('RF001 API Tests de búsqueda (CT-RF001)', () => {
    test('CT-RF001-01: Búsqueda por palabra clave válida', async ({ request }) => {
        // Usa una palabra clave que exista en los datos iniciales (por ejemplo "silk")
        const res = await request.get(`${BASE}/api/items`, { params: { q: 'silk' } });
        expect(res.status()).toBe(200);
        const body = await res.json();
        const items = Array.isArray(body) ? body : body?.items ?? [];
        expect(Array.isArray(items)).toBe(true);

        // Espera que al menos un ítem contenga la palabra clave en nombre/descripción
        const found = items.some((it: any) => {
            const hay = [it.name, it.description, it.style, it.color, it.category].join(' ').toLowerCase();
            return hay.includes('silk');
        });
        expect(found).toBeTruthy();
    });

    test('CT-RF001-02: Búsqueda con filtros combinables (color + style)', async ({ request }) => {
        // Hay un ítem inicial con color=negro y estilo=de gala
        const res = await request.get(`${BASE}/api/items`, { params: { q: 'dress', color: 'black', style: 'black-tie' } });
        expect(res.status()).toBe(200);
        const body = await res.json();
        const items = Array.isArray(body) ? body : body?.items ?? [];
        expect(Array.isArray(items)).toBe(true);

        // Si se devuelven ítems, valida que coincidan con los filtros solicitados
        if (items.length > 0) {
            for (const it of items) {
                expect(typeof it.color).toBe('string');
                expect(typeof it.style === 'string' || it.style === null || it.style === undefined).toBeTruthy();
                expect(it.color.toLowerCase()).toBe('black');
                expect(it.style.toLowerCase()).toBe('black-tie');
            }
        }
    });

    test('CT-RF001-03: Búsqueda sin resultados', async ({ request }) => {
        const res = await request.get(`${BASE}/api/items`, { params: { q: 'abcdfg' } });
        expect(res.status()).toBe(200);
        const body = await res.json();
        const items = Array.isArray(body) ? body : body?.items ?? [];
        expect(Array.isArray(items)).toBe(true);
        expect(items.length).toBe(0);
    });

    test('CT-RF001-04: Búsqueda por talle (size filter)', async ({ request }) => {
        // Filter by size M — seeded data has items with size M
        const res = await request.get(`${BASE}/api/items`, { params: { q: 'dress', size: 'M' } });
        expect(res.status()).toBe(200);
        const body = await res.json();
        const items = Array.isArray(body) ? body : body?.items ?? [];
        expect(Array.isArray(items)).toBe(true);

        // If items are returned, each must include the requested size
        for (const it of items) {
            expect(Array.isArray(it.sizes) || typeof it.sizes === 'string').toBeTruthy();
            const sizes = Array.isArray(it.sizes) ? it.sizes : JSON.parse(it.sizes || '[]');
            expect(sizes.includes('M')).toBeTruthy();
        }
    });

    test('CT-RF001-05: Búsqueda con caracteres especiales', async ({ request }) => {
        // Query with potentially unsafe characters should not crash the API
        const q = '<script>test</script>';
        const res = await request.get(`${BASE}/api/items`, { params: { q } });
        expect(res.status()).toBe(200);
        const body = await res.json();
        const items = Array.isArray(body) ? body : body?.items ?? [];
        expect(Array.isArray(items)).toBe(true);
    });

    test('CT-RF001-06: Búsqueda case-insensitive', async ({ request }) => {
        const r1 = await request.get(`${BASE}/api/items`, { params: { q: 'DRESS' } });
        const r2 = await request.get(`${BASE}/api/items`, { params: { q: 'dress' } });
        expect(r1.status()).toBe(200);
        expect(r2.status()).toBe(200);
        const b1 = await r1.json();
        const b2 = await r2.json();
        const items1 = Array.isArray(b1) ? b1 : b1?.items ?? [];
        const items2 = Array.isArray(b2) ? b2 : b2?.items ?? [];
        // Compare lengths and ids set
        const ids1 = items1.map((i: any) => i.id).sort();
        const ids2 = items2.map((i: any) => i.id).sort();
        expect(ids1).toEqual(ids2);
    });

    test('CT-RF001-07: Búsqueda con espacios al inicio/final (trim)', async ({ request }) => {
        const r1 = await request.get(`${BASE}/api/items`, { params: { q: '  dress  ' } });
        const r2 = await request.get(`${BASE}/api/items`, { params: { q: 'dress' } });
        expect(r1.status()).toBe(200);
        expect(r2.status()).toBe(200);
        const b1 = await r1.json();
        const b2 = await r2.json();
        const items1 = Array.isArray(b1) ? b1 : b1?.items ?? [];
        const items2 = Array.isArray(b2) ? b2 : b2?.items ?? [];
        const ids1 = items1.map((i: any) => i.id).sort();
        const ids2 = items2.map((i: any) => i.id).sort();
        expect(ids1).toEqual(ids2);
    });

    test('CT-RF001-08: Búsqueda vacía (sin término) devuelve todos los artículos', async ({ request }) => {
        const res = await request.get(`${BASE}/api/items`);
        expect(res.status()).toBe(200);
        const body = await res.json();
        const items = Array.isArray(body) ? body : body?.items ?? [];
        expect(Array.isArray(items)).toBe(true);
        // Expect at least the 4 seeded items to be present
        expect(items.length).toBeGreaterThanOrEqual(4);
    });
});
