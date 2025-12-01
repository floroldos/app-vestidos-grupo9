import { Page, Locator } from '@playwright/test';

export class LoginPage {
    constructor(private page: Page) { }

    private user = this.page.getByLabel(/user|email|usuario/i)
        .or(this.page.locator('input[name*="user"], input[type="email"]'))
        .first();

    private pass = this.page.getByLabel(/pass|contrase/i)
        .or(this.page.locator('input[type="password"]'))
        .first();

    private submit = this.page.getByRole('button', { name: /login|ingresar|sign in/i });

    async goto() {
        await this.page.goto('http://localhost:3000/admin/login');
    }

    async formIsVisible(): Promise<boolean> {
        return await this.submit.isVisible().catch(() => false);
    }

    async login(username?: string, password?: string) {
        await this.user.fill(username || process.env.ADMIN_USERNAME!);
        await this.pass.fill(password || process.env.ADMIN_PASSWORD!);
        await this.submit.click();
    }
}
