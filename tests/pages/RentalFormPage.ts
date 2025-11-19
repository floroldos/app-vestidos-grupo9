import { expect, Page } from '@playwright/test';

export class RentalFormPage {
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto('http://localhost:3000/items/1');
    }

    // Selectores del formulario
    get startDate() { return this.page.getByRole('textbox', { name: 'Start date' }); }
    get endDate() { return this.page.getByRole('textbox', { name: 'End date' }); }
    get fullName() { return this.page.getByPlaceholder('name'); }
    get email() { return this.page.getByPlaceholder('email'); }
    get phone() { return this.page.getByPlaceholder('phone'); }
    get sizePicker() { return this.page.locator('[data-testid="size-picker"]'); }
    get submit() { return this.page.getByRole('button', { name: 'Request Rental' }); }
    get errorMessage() { return this.page.locator('.error'); }

    async fillDates(start: string, end: string) {
        await this.startDate.fill(start);
        await this.endDate.fill(end);
    }

    async fillContact(fullName: string, email: string, phone: string) {
        await this.fullName.fill(fullName);
        await this.email.fill(email);
        await this.phone.fill(phone);
    }

    async submitForm() {
        await this.submit.click();
    }
}
