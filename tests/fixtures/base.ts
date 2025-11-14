import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { users } from '../config/testData/users';

type Fixtures = {
    home: HomePage;
    catalog: CatalogPage;
    product: ProductDetailPage;
    login: LoginPage;
    admin: AdminDashboardPage;
    users: typeof users;
};

export const test = base.extend<Fixtures>({
    home: async ({ page }, use) => use(new HomePage(page)),
    catalog: async ({ page }, use) => use(new CatalogPage(page)),
    product: async ({ page }, use) => use(new ProductDetailPage(page)),
    login: async ({ page }, use) => use(new LoginPage(page)),
    admin: async ({ page }, use) => use(new AdminDashboardPage(page)),
    users: async ({ }, use) => use(users),
});

export const expect = test.expect;
