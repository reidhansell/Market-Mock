# Defects, Market Mock

Defects found during the Market Mock test pass, in ID order. Each entry carries environment, reproduction steps, and captured evidence. Related plan: [TEST-PLAN.md](TEST-PLAN.md).

| ID | Defect | Severity | Status |
| --- | --- | --- | --- |
| BUG-001 | Login distinguishes failure modes and leaks the password policy | Medium | Reproduced, evidence captured |
| BUG-002 | Session can't refresh after the access token expires (silent logout) | Medium | Reproduced, evidence captured |
| BUG-003 | "Reset my run" isn't atomic, so a failed reset corrupts the account (holdings wiped, balance overwritten) | High | Reproduced, evidence captured |

---

## BUG-001: Login distinguishes failure modes and leaks the password policy (format validation runs before the credential check)

- **Status:** Reproduced 2026-07-16, evidence captured.
- **Severity:** Medium _(information disclosure and auth hardening)_
- **Description:** `POST /api/auth/login` runs the full sign-up password-complexity check on the submitted password before it verifies credentials, and returns the policy verbatim when the password fails that check: _"Password must include 8-255 characters, at least one uppercase letter, one lowercase letter, one number, and one special character."_ This causes two problems. First, an unauthenticated caller learns the exact password policy, which narrows the keyspace for brute-force and credential-stuffing. Second, login now has two distinguishable failure responses: a `400` plus the policy text for a badly-formatted password, and a `401` "Invalid credentials" for a well-formatted but wrong one. The status and message therefore reveal why authentication failed. A login check should return one generic failure regardless of the submitted password's shape. Format validation is a registration concern; the login path should not run it.
- **Environment:** 2026-07-16. Windows 11, Chrome, Market Mock local test target (UI http://localhost:3000, API http://localhost:5000), app v1.1.0.
- **Prerequisites:**
  - None. `/api/auth/login` is an unauthenticated endpoint, reachable from the UI login form or a direct API call.
- **Steps to reproduce:**
  1. `POST http://localhost:5000/api/auth/login` with body `{ "email": "anyone@example.com", "password": "password" }` (or type the same into the UI login form).
  2. Observe **HTTP 400** and body `{ "error": "Password must include 8-255 characters, at least one uppercase letter, one lowercase letter, one number, and one special character." }`.
  3. Repeat with a well-formatted but wrong password: `{ "email": "anyone@example.com", "password": "Wrong1234!" }`.
  4. Observe a **different** result, **HTTP 401** and body `{ "error": "Invalid credentials" }`, for the same underlying "authentication failed" condition.
- **Expected** _(inferred; no published spec, based on standard auth conventions):_ login returns a single generic failure (e.g. `401` "Invalid credentials") for any non-matching password, and never discloses the password-format policy to an unauthenticated caller.
- **Actual:** login validates password format first, leaks the policy on a `400`, and returns a status and message that vary by failure mode.
- **Evidence** _(captured 2026-07-16; raw HTTP responses, `curl -i`):_
  - `bugs/media/BUG-001/case1-badformat.txt`: `POST /api/auth/login` with password `"password"` returns **400** and the verbatim password-policy text (badly-formatted password).
  - `bugs/media/BUG-001/case2-wrongpassword.txt`: the same request with password `"Wrong1234!"` returns **401** `{"error":"Invalid credentials"}` (well-formatted, wrong), the distinguishable second failure mode.

---

## BUG-002: Session can't refresh after the access token expires, silently logging the user out (refresh response shape mismatch)

- **Status:** Reproduced 2026-07-16, evidence captured.
- **Severity:** Medium _(session availability; the refresh control silently no-ops)_
- **Description:** The refresh endpoint and the client that consumes it disagree on the response shape, so the automatic token-refresh path never works. An authenticated user is silently logged out once the 1-hour access token expires, even while holding a valid refresh token. `GET /api/auth/session/refresh_token` responds `{ "accessToken": <jwt> }` (`routes/auth.ts`), while every other auth response in the API returns `{ "token": ... }` (for example `/api/auth/login`). The client's refresh handler reads `response.data.data.token` (`client/src/index.tsx`), which is `undefined`. The interceptor then sets `Authorization: Bearer undefined`, the retried request returns `401`, and the app calls `logout()`. As an API defect: the refresh endpoint's contract is inconsistent with the rest of the auth surface, and that inconsistency is what breaks the client built against it.
- **Environment:** 2026-07-16. Windows 11, Chrome, Market Mock local test target (UI http://localhost:3000, API http://localhost:5000), app v1.1.0.
- **Prerequisites:**
  - A verified account able to log in (the seeded `seed@marketmock.test` / `Test1234!`).
- **Steps to reproduce:**
  1. `POST http://localhost:5000/api/auth/login` with the seed credentials; capture the `refreshToken` cookie from `Set-Cookie` (path `/api/auth/session`).
  2. `GET http://localhost:5000/api/auth/session/refresh_token` sending that cookie.
  3. Inspect the response body: it is `{ "accessToken": "<jwt>" }`. The token is under `accessToken`, and the client reads `token`.
  4. (End-to-end) In the browser, log in and let the access token expire (1h) or clear it. The app logs you out instead of refreshing the session.
- **Expected** _(inferred):_ the refresh response uses the same field the rest of the API and the client use (`token`), so the client can read the refreshed access token and keep the session alive past the access-token TTL.
- **Actual:** the endpoint returns `{ accessToken }`; the client reads `.data.data.token`, gets `undefined`; the session cannot be refreshed and the user is logged out at expiry.
- **Evidence** _(captured 2026-07-16; raw HTTP responses, `curl -i`; JWT values truncated):_
  - `bugs/media/BUG-002/step1-login-setcookie.txt`: `POST /api/auth/login` with the seed credentials returns **200**, a body field named `token`, and a `Set-Cookie: refreshToken=...` scoped to `Path=/api/auth/session`.
  - `bugs/media/BUG-002/step2-refresh-response.txt`: `GET /api/auth/session/refresh_token` with that cookie returns **200** and a body field named `accessToken`. The client reads `.token`, which is `undefined`.

---

## BUG-003: "Reset my run" isn't atomic, so a failed reset corrupts the account instead of rolling back (transaction-delete loop throws on a transaction-less order)

- **Status:** Reproduced 2026-07-17, evidence captured. Found by code inspection 2026-07-16; the repro corrected the original "rolls back, no data loss" reading, which was wrong.
- **Severity:** High. Destructive and irreversible data loss on the core account (holdings deleted, balance overwritten), and the API returns a 500 as if nothing happened, so the user is never told their run was damaged.
- **Description:** "Reset my run" is not atomic. A reset that fails partway through leaves the account in a corrupted, partly-wiped state instead of rolling back, and the API still returns a 500, so the user is never told their run was damaged.
  - **Trigger:** `resetUserData` (`database/queries/auth.ts:160`) loops over the user's orders and deletes each order's `Transaction`; if that delete affects 0 rows, it throws a 500 (`auth.ts:204-216`). An order only has a `Transaction` once it has been *fulfilled*, so an open (un-triggered) limit or stop order and a cancelled order both have none. Any user holding one hits `affectedRows === 0` and can never reset.
  - **Root cause:** `resetUserData` never calls `beginTransaction()`. It runs every query on one pooled connection from `getTransactionConnection()` (`databaseConnector.ts`) under MySQL's default autocommit, so each statement commits as it executes. By the time the loop throws, the balance update and the holdings, net-worth, watchlist, quest, and notification deletes have already committed, so the `transaction.rollback()` on the throw path does nothing. The tables are InnoDB, so a real transaction would have rolled back cleanly: `processOrder` opens one (`orderFulfillmentService.ts:85`); `resetUserData` omits it. The half-commented-out `affectedRows` guards below (`auth.ts:221-231`) sit on the same broken foundation, and any of those failure paths would corrupt the account the same way.
- **Environment:** 2026-07-17. Market Mock local test target (UI http://localhost:3000, API http://localhost:5000), app v1.1.0.
- **Prerequisites:** A logged-in user with at least one order that has no transaction (an open limit or stop order, or a cancelled order). The seeded `seed@marketmock.test` / `Test1234!` qualifies after placing one.
- **Steps to reproduce:**
  1. Log in as the seed account and note the starting state (the seed gives balance 6000 and holdings 10 AAPL / 5 MSFT).
  2. Place an order that stays open with no transaction: `POST /api/order` with `{ "ticker_symbol": "AAPL", "order_type": "LIMIT", "trigger_price": 1, "quantity": 1 }`. Trigger 1 is far below the seeded price (190), so it cannot fill and gets no `Transaction` row.
  3. `POST /api/auth/reset_progress` with `{ "starting_amount": 99999 }`.
  4. Observe **HTTP 500** `{ "error": "Could not reset user data" }`.
  5. Read the database back: `current_balance` and `starting_amount` are now **99999**, `User_Stocks` is **empty** (holdings deleted), and the orders still exist. The reported failure committed anyway.
- **Expected:** Reset either fully succeeds or fully rolls back. An order with no transaction is normal and should simply be deleted, not treated as a fatal error; and any mid-operation failure must leave the account exactly as it was.
- **Actual:** the transaction-delete loop treats "no transaction for this order" as a fatal error and throws. Because the operation was never wrapped in a real transaction, the partial writes (balance overwritten, holdings and history wiped) commit anyway, and the user sees a 500 as if nothing changed.
- **Evidence** _(captured 2026-07-17; raw HTTP responses and DB reads):_
  - `bugs/media/BUG-003/step1-open-order.txt`: `POST /api/order` returns **200** for the open LIMIT order (no transaction).
  - `bugs/media/BUG-003/step2-reset-500.txt`: `POST /api/auth/reset_progress` returns **500** `{"error":"Could not reset user data"}`.
  - `bugs/media/BUG-003/step3-db-before-after.txt`: the database before and after. Balance went from 6000 to 99999, holdings (10 AAPL / 5 MSFT) went to empty, orders still present. The rollback did not happen.

---
