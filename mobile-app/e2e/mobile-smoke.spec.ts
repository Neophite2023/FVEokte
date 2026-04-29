import { expect, test } from "@playwright/test";

test.describe("Mobile app smoke", () => {
  test("navigates core screens", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "FVE Analýza" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Klienti" })).toBeVisible();

    await page.getByRole("link", { name: "Nová analýza" }).click();
    await expect(page.getByRole("heading", { name: "Nová analýza" })).toBeVisible();

    await page.getByRole("link", { name: "História" }).click();
    await expect(page.getByRole("heading", { name: "História výsledkov" })).toBeVisible();
  });

  test("creates client and verifies persistence after reload", async ({ page }) => {
    await page.goto("/");
    await page.getByPlaceholder("Meno").fill("Ján");
    await page.getByPlaceholder("Priezvisko").fill("Tester");
    await page.getByPlaceholder("Mesto").fill("Bratislava");
    await page.getByPlaceholder("Kapacita batérie (kWh)").fill("10");
    await page.getByRole("button", { name: "Uložiť klienta" }).click();

    await expect(page.getByText("Ján Tester")).toBeVisible();
    await page.reload();
    await expect(page.getByText("Ján Tester")).toBeVisible();
  });

  test("serves manifest", async ({ request }) => {
    const response = await request.get("/manifest.webmanifest");
    expect(response.ok()).toBeTruthy();
    const body = await response.json();
    expect(body.name).toBe("FVE Mobilná Analýza");
  });
});
