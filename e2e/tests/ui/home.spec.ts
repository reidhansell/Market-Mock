import { test, expect } from "@playwright/test";

// AI-generated smoke test (free scaffold).
test.describe("Home smoke", () => {
  test("unauthenticated visit redirects to the login screen", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Market Mock" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
  });
});

// ─── My tests ───────────────────────────────────────────────────────────────
