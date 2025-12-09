import { test } from "@playwright/test";
import { ProductDetailPage } from "../../../pages/ProductDetailPage";
import { formatDate, addDays } from "../../../utils/date-helpers";

test.describe("Validaciones Rental Form", () => {
    test.beforeEach(({ browserName }) => {
        test.skip(browserName === "firefox" || browserName === "webkit",
            "Esta suite no corre en Firefox ni Safari"
        );
    });

    const today = new Date();
    const valid = {
        name: "Test",
        email: "example@test.com",
        phone: "099123456",
        start: formatDate(addDays(today, 10)),
        end: formatDate(addDays(today, 12)),
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

    test("Form con datos inválidos no debe redirigir a url de éxito", async ({ page }) => {
        const product = new ProductDetailPage(page);

        const casos = [
            { descripcion: "Nombre vacío", data: { ...valid, name: "" } },
            { descripcion: "Email sin @", data: { ...valid, email: "invalid" } },
            { descripcion: "Email sin dominio", data: { ...valid, email: "test@" } },
            { descripcion: "Teléfono con letras", data: { ...valid, phone: "abc123" } },
            { descripcion: "Teléfono corto", data: { ...valid, phone: "123" } },
            { descripcion: "Solo start date", data: { ...valid, end: "" } },
            { descripcion: "Solo end date", data: { ...valid, start: "" } },
            { descripcion: "end < start", data: { ...valid, start: formatDate(addDays(today, 20)), end: formatDate(addDays(today, 10)) } },
            { descripcion: "Size inválido (XL)", data: { ...valid, size: "XL" } },
        ];

        for (const caso of casos) {
            await product.goToProductDetail();
            await product.fillForm(caso.data);
            await product.submit();
            await product.assertNotRedirectedToSuccess();
        }
    });

});
