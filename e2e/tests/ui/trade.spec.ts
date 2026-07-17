import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/LoginPage";
import { MarketPage } from "../../pages/MarketPage";
import { PortfolioPage } from "../../pages/PortfolioPage";

const SEED_EMAIL = "seed@marketmock.test";
const SEED_PASSWORD = "Test1234!";

test.describe("Trading", () => {
  let marketPage: MarketPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(SEED_EMAIL, SEED_PASSWORD);
    await expect(page).toHaveURL("/");
    marketPage = new MarketPage(page);
  });

  test("Buy a stock and see it in the portfolio", async ({ page }) => {
    await marketPage.buyMarketOrder("GOOGL");
    const portfolioPage = new PortfolioPage(page);
    await portfolioPage.goto();
    await expect(portfolioPage.getHolding("GOOGL")).toBeVisible();
  });
});
