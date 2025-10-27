import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
    constructor(private page: Page) { }

    private layout = this.page.locator('[data-testid="admin-dashboard"], main, #admin');
}
