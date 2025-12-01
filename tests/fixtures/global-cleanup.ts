import { test as base } from '@playwright/test';

export const test = base;

test.beforeEach(async ({ request }) => {
  // Llama al endpoint de limpieza
  await request.post('/api/test/cleanup');
});
