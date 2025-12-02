import { test as base } from '@playwright/test';

export const test = base;

test.beforeEach(async ({ request }) => {
  await request.post('/api/test/cleanup');
});
