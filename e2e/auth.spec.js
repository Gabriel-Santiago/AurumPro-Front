import { test, expect } from "@playwright/test";

test.describe("Autenticação", () => {
  test("exibe tela de login", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Login")).toBeVisible();
    await expect(page.getByText("Cadastro")).toBeVisible();
    await expect(page).toHaveTitle(/Aurum Pro/i);
  });

  test("permite alternar para cadastro", async ({ page }) => {
    await page.goto("/");
    await page.getByText("Cadastro").click();
    await expect(page.getByRole("button", { name: "Cadastrar" })).toBeVisible();
  });
});
