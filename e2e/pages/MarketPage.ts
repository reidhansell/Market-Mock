import { Page, Locator } from "@playwright/test";

export class MarketPage {
  readonly page: Page;
  readonly search: Locator;
  readonly quantity: Locator;
  readonly placeOrder: Locator;
  readonly orderConfirmation: Locator;

  constructor(page: Page) {
    this.page = page;
    this.search = page.getByPlaceholder("Search all tickers...");
    this.quantity = page.getByRole("spinbutton");
    this.placeOrder = page.getByRole("button", { name: "Place Order" });
    this.orderConfirmation = page.getByText(/immediately fulfilled/);
  }

  async goto() {
    await this.page.goto("/tickersearch", { waitUntil: "domcontentloaded" });
  }

  async searchFor(term: string) {
    await this.search.fill(term);
  }

  searchResult(symbol: string) {
    return this.page.getByRole("link", { name: new RegExp(`^${symbol}`) });
  }

  async buyMarketOrder(symbol: string, quantity = 1) {
    await this.page.goto(`/orderplacer/${symbol}`, {
      waitUntil: "domcontentloaded",
    });
    if (quantity !== 1) {
      await this.quantity.fill(String(quantity));
    }
    await this.placeOrder.click();
    await this.orderConfirmation.waitFor();
  }
}
