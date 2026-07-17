import { test, expect } from "@playwright/test";

const API = "http://localhost:5000";
const SEED_EMAIL = "seed@marketmock.test";
const SEED_PASSWORD = "Test1234!";

// AI-generated smoke test (free scaffold).
test.describe("API smoke", () => {
  test("ticker-search endpoint responds", async ({ request }) => {
    const login = await request.post(`${API}/api/auth/login`, {
      data: { email: SEED_EMAIL, password: SEED_PASSWORD },
    });
    const { token } = await login.json();
    const response = await request.get(`${API}/api/ticker/search/AAPL`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    await expect(response).toBeOK();
  });
});

// ─── My tests ───────────────────────────────────────────────────────────────
test.describe("Login API", () => {
  test("valid credentials are accepted", async ({ request }) => {
    const response = await request.post(`${API}/api/auth/login`, {
      data: { email: SEED_EMAIL, password: SEED_PASSWORD },
    });
    await expect(response).toBeOK();
    const body = await response.json();
    expect(body.token).toBeTruthy();
  });

  test("invalid credentials are rejected", async ({ request }) => {
    const response = await request.post(`${API}/api/auth/login`, {
      data: { email: SEED_EMAIL, password: "Wrong1234!" },
    });
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toBe("Invalid credentials");
  });
});
