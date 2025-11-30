import { assert } from 'console';
import { CatalogPage } from './CatalogPage';
import { Page, Locator, expect } from '@playwright/test';

export class ProductDetailPage {
    constructor(private page: Page) { }


    private anyImage: Locator = this.page.locator('img').first();
    private title: Locator = this.page.getByRole('heading').first()
        .or(this.page.locator('h1,h2').first());
    private body: Locator = this.page.locator('main, article, section, body');

    private nameInput = this.page.locator('input[name="name"]');
    private emailInput = this.page.locator('input[name="email"]');
    private phoneInput = this.page.locator('input[name="phone"]');
    private startInput = this.page.locator('input[name="start"]');
    private endInput = this.page.locator('input[name="end"]');
    private sizeInput = (value: string) =>
        this.page.locator(`input[name="size"][value="${value}"]`);
    private submitBtn = this.page.locator('button[type="submit"]');

    async assertBasicDetail() {
        await expect(this.anyImage).toBeVisible();
        await expect(this.title).toBeVisible();
        await expect(this.body).toContainText(/(gown|dress|vestido|rentals|free cleaning|day)/i);
    }

    async fillForm(data: {
        name: string;
        email: string;
        phone: string;
        start: string;
        end: string;
        size: string;
    }) {
        await this.nameInput.fill(data.name);
        await this.emailInput.fill(data.email);
        await this.phoneInput.fill(data.phone);
        await this.startInput.fill(data.start);
        await this.endInput.fill(data.end);
        const sizeRadio = this.sizeInput(data.size);
        if (!(await sizeRadio.isDisabled())) {
            await sizeRadio.click({ force: true });
        }
    }

    async submit() {
        await this.submitBtn.click();
    }

    async assertRedirectedToSuccess() {
        this.page.locator('p', { hasText: "Reservation completed!" })
    }

    async assertNotRedirectedToSuccess() {

        await expect(this.page).not.toHaveURL(/success=1/);
    }

    async goToProductDetail() {
        const catalogPage = new CatalogPage(this.page);
        await catalogPage.goto();
        await catalogPage.assertCatalogLoaded();
        await catalogPage.openFirstProduct();
        await expect(this.page).toHaveURL("http://localhost:3000/items/1");
    }
    async debugPrintValues() {
        console.log("NAME:", await this.nameInput.inputValue());
        console.log("EMAIL:", await this.emailInput.inputValue());
        console.log("PHONE:", await this.phoneInput.inputValue());
        console.log("START:", await this.startInput.inputValue());
        console.log("END:", await this.endInput.inputValue());

        // Para radio buttons:
        const selectedSize = await this.page.locator('input[name="size"]:checked').inputValue();
        console.log("SIZE:", selectedSize);
    }

}