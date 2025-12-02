import { test as base } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { CatalogPage } from '../pages/CatalogPage';
import { ProductDetailPage } from '../pages/ProductDetailPage';
import { LoginPage } from '../pages/LoginPage';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { users } from '../testData/users';

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

// Cleanup antes de cada test E2E
test.beforeEach(async ({ request }) => {
    try {
        await request.post('http://localhost:3000/api/test/cleanup');
    } catch (e) {
        // ignorar errores durante la limpieza
    }
});

export const expect = test.expect;
