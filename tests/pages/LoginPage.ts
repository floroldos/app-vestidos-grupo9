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
        // Esperar a que el token CSRF se cargue
        await this.page.waitForFunction(() => {
            const csrfInput = document.querySelector('input[name="csrf"]') as HTMLInputElement;
            return csrfInput && csrfInput.value && csrfInput.value.length > 0;
        }, { timeout: 10000 });
        
        await this.user.fill(username || process.env.ADMIN_USER!);
        await this.pass.fill(password || process.env.ADMIN_PASS!);
        await this.submit.click();
    }
}
