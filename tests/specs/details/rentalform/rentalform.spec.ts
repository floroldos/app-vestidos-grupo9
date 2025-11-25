import { test, expect } from "@playwright/test";

test.describe("Rental Form – Validaciones y comportamiento reales", () => {

    // -------------------------------
    // CT-RF004-01: Mostrar error al enviar vacío
    // -------------------------------
    test("CT-RF004-01: debe mostrar error cuando se envía vacío", async ({ page }) => {
        await page.goto("/items/1");

        await page.click('button[type="submit"]');

        // El componente solo muestra *un* mensaje global por vez → el del primer error detectado
        await expect(page.getByText("Invalid date")).toBeVisible();
    });

    // -------------------------------
    // CT-RF004-02: Email inválido (HTML5)
    // -------------------------------
    test("CT-RF004-02: debe marcar email inválido", async ({ page }) => {
        await page.goto("/items/1");

        await page.fill("#name", "Lucía");
        await page.fill("#email", "invalid-email");
        await page.fill("#phone", "099123456");
        await page.fill("#start", "2099-01-10");
        await page.fill("#end", "2099-01-12");

        // HTML5 evita submit si email es inválido
        await page.click('button[type="submit"]');

        await expect(page.locator("#email:invalid")).toBeVisible();
    });

    // -------------------------------
    // CT-RF004-03: Teléfono inválido (pattern)
    // -------------------------------
    test("CT-RF004-03: debe marcar teléfono inválido", async ({ page }) => {
        await page.goto("/items/1");

        await page.fill("#name", "Lucía");
        await page.fill("#email", "test@test.com");
        await page.fill("#phone", "abcXYZ");
        await page.fill("#start", "2099-01-10");
        await page.fill("#end", "2099-01-12");

        await page.click('button[type="submit"]');

        await expect(page.locator("#phone:invalid")).toBeVisible();
    });

    // -------------------------------
    // CT-RF004-04: Start date sin end date
    // -------------------------------
    test("CT-RF004-04: debe mostrar error si se selecciona solo start date", async ({ page }) => {
        await page.goto("/items/1");

        await page.fill("#start", "2099-01-10");

        await page.click('button[type="submit"]');

        await expect(page.getByText("Invalid date")).toBeVisible();
    });

    // -------------------------------
    // CT-RF004-05: End date sin start date
    // -------------------------------
    test("CT-RF004-05: debe mostrar error si se selecciona solo end date", async ({ page }) => {
        await page.goto("/items/1");

        await page.fill("#end", "2099-01-10");

        await page.click('button[type="submit"]');

        await expect(page.getByText("Invalid date")).toBeVisible();
    });

    // -------------------------------
    // CT-RF004-06: Fecha de fin anterior al inicio
    // -------------------------------
    test("CT-RF004-06: debe marcar error si end < start", async ({ page }) => {
        await page.goto("/items/1");

        await page.fill("#start", "2099-01-20");
        await page.fill("#end", "2099-01-10");

        await page.click('button[type="submit"]');

        await expect(page.getByText("End date must be later than start date.")).toBeVisible();
    });

    // -------------------------------
    // CT-RF004-07: Size no disponible
    // -------------------------------
    test("CT-RF004-07: no debe permitir seleccionar un size sin stock", async ({ page }) => {
        await page.goto("/items/1");

        // Los sizes no disponibles tienen "disabled"
        const xs = page.locator('input[name="size"][value="XS"]');

        if (await xs.isDisabled()) {
            await xs.click({ force: true }); // aunque haga force, el estado no cambia
            await expect(xs).not.toBeChecked();
        } else {
            test.skip(true, "XS estaba disponible en este item, no aplica el test");
        }
    });

    // -------------------------------
    // CT-RF004-08: Envío exitoso del formulario
    // -------------------------------
    test("CT-RF004-08: debe enviar el formulario correctamente", async ({ page }) => {
        await page.goto("/items/1");

        await page.fill("#name", "Lucía");
        await page.fill("#email", "lucia@test.com");
        await page.fill("#phone", "099123456");
        await page.fill("#start", "2099-01-10");
        await page.fill("#end", "2099-01-12");

        // Seleccionar size disponible
        const size = page.locator('input[name="size"]:not([disabled])').first();
        await size.check();

        const [req] = await Promise.all([
            page.waitForRequest((r) => r.url().includes("/api/rentals") && r.method() === "POST"),
            page.click('button[type="submit"]')
        ]);

        const formData = req.postData();

        expect(formData).toContain("name=Luc%C3%ADa");
        expect(formData).toContain("email=lucia%40test.com");
        expect(formData).toContain("phone=099123456");
        expect(formData).toContain("start=2099-01-10");
        expect(formData).toContain("end=2099-01-12");
    });

    // -------------------------------
    // CT-RF004-09: Mensaje por fechas ocupadas (409)
    // -------------------------------
    test("CT-RF004-09: debe mostrar error si backend responde 409", async ({ page }) => {
        await page.route("/api/rentals", (route) => {
            route.fulfill({
                status: 409,
                body: JSON.stringify({ error: "conflict" })
            });
        });

        await page.goto("/items/1");

        await page.fill("#name", "Lucía");
        await page.fill("#email", "lucia@test.com");
        await page.fill("#phone", "099123456");
        await page.fill("#start", "2099-01-10");
        await page.fill("#end", "2099-01-12");

        const size = page.locator('input[name="size"]:not([disabled])').first();
        await size.check();

        await page.click('button[type="submit"]');

        await expect(page.getByText("The selected dates are already booked. Please choose a different date range.")).toBeVisible();
    });

});
