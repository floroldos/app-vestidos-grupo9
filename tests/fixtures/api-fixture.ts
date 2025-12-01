import { test as base } from '@playwright/test';
import { users } from '../testData/users';

type UserFixture = {
  users: typeof users;
};

export const test = base.extend<UserFixture>({
  users: async ({}, use) => {
    await use(users);
  },
});

// Cleanup antes de cada test de API
test.beforeEach(async ({ request }) => {
  try {
    await request.post('http://localhost:3000/api/test/cleanup');
  } catch (e) {
    // ignorar errores durante la limpieza
  }
});

export const expect = test.expect;
