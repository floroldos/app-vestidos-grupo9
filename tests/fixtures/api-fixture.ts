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



export const expect = test.expect;
