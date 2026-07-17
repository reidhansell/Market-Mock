import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";

test.describe("Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("Failed login", async () => {
    await expect(loginPage.loginError).toBeHidden();
    await loginPage.login("notarealemail@email.com", "Wrong1234!");
    await expect(loginPage.loginError).toBeVisible();
  });
});
