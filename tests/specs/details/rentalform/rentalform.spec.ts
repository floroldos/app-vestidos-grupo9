import { test } from "@playwright/test";
import { ProductDetailPage } from "../../../pages/ProductDetailPage";

test.describe("Validaciones Rental Form", () => {
    test.beforeEach(({ browserName }) => {
        test.skip(browserName === "firefox" || browserName === "webkit",
            "Esta suite no corre en Firefox ni Safari"
        );
    });

    const valid = {
        name: "Test",
        email: "example@test.com",
        phone: "099123456",
        start: "2099-01-10",
        end: "2099-01-12",
        size: "M",
    };

    test("Happy Path: Validación positiva", async ({ page }) => {
        const product = new ProductDetailPage(page);

        await product.goToProductDetail();
        await product.fillForm(valid);
        await product.submit();
        await product.assertRedirectedToSuccess();
    });

    test("Form vacío no debe redirigir a url de éxito", async ({ page }) => {
        const product = new ProductDetailPage(page);

        await product.goToProductDetail();
        await product.submit();
        await product.assertNotRedirectedToSuccess();
    });

    const casos = [
        { descripcion: "Nombre vacío", data: { ...valid, name: "" } },
        { descripcion: "Email sin @", data: { ...valid, email: "invalid" } },
        { descripcion: "Email sin dominio", data: { ...valid, email: "test@" } },
        { descripcion: "Teléfono con letras", data: { ...valid, phone: "abc123" } },
        { descripcion: "Teléfono corto", data: { ...valid, phone: "123" } },
        { descripcion: "Solo start date", data: { ...valid, end: "" } },
        { descripcion: "Solo end date", data: { ...valid, start: "" } },
        { descripcion: "end < start", data: { ...valid, start: "2099-01-20", end: "2099-01-10" } },
        { descripcion: "Size inválido (XL)", data: { ...valid, size: "XL" } },
    ];

    for (const caso of casos) {
        test(`Validación negativa: ${caso.descripcion}`, async ({ page }) => {
            const product = new ProductDetailPage(page);

            await product.goToProductDetail();
            await product.fillForm(caso.data);
            await product.submit();
            await product.assertNotRedirectedToSuccess();
        });
    }

});
