import { Page } from "@playwright/test";

export class PortfolioPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto() {
    await this.page.goto("/portfolio", { waitUntil: "domcontentloaded" });
  }

  getHolding(symbol: string) {
    return this.page.getByText(new RegExp(`^${symbol} \\(\\d+\\)$`));
  }
}
