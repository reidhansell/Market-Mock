> _Authorship: this README was drafted by Claude (AI), working with Reid. The **test suite it documents is hand-authored by Reid Hansell with no AI assistance** — see [How the work is split](#how-the-work-is-split). The scaffolding (Playwright config, CI, this file) is AI-generated; the tests are not._

# Market Mock — E2E & API Test Suite

Playwright + TypeScript tests — UI end-to-end and REST API — for **Market Mock**, a full-stack paper-trading application.

> **Status: actively being built.** The scaffold is in place; tests are added by hand as the suite grows. Treat the "Intended scope" section as a roadmap, not a finished claim.

## What this is

A hand-authored automated test suite: UI journeys driven through Page Objects, plus REST API tests against Market Mock's own backend. TypeScript throughout, run on the Playwright test runner.

## Why it exists

Deliberate, hands-on SDET skill-building. The application is the *target*; the point is the **suite** — being able to design, run, and *defend* a real Playwright + API framework in a technical screen. Every test is written without AI, on purpose, so the skill is genuinely mine.

## How the work is split

Being explicit about authorship, because it's the point:

| Artifact | Author |
|---|---|
| The tests, Page Objects, and fixtures in this suite | **Reid Hansell — hand-authored, no AI** |
| Market Mock itself (the app under test, in `../`) | Reid's own 2023 full-stack project, recently adapted (AI-assisted) to run locally as a deterministic test target |
| This suite's scaffolding — Playwright config, CI, this README | AI-drafted (Claude) |

The artifact that demonstrates hands-on test-automation skill is the **tests** — and those are mine.

## How to use it

Prereqs: Docker Desktop, Node 18+.

1. **Boot the app under test** (from the repo root):
   ```
   cd ..
   docker compose up -d
   ```
2. **Seed deterministic data** — tickers, fixed prices, and a known verified account (from the repo root):
   ```
   bash scripts/seed.sh
   ```
3. **Install the runner** (from this `e2e/` folder):
   ```
   npm install
   npx playwright install
   ```
4. **Run:**
   ```
   npm test             # headless, all specs
   npm run test:headed  # watch it drive a browser
   npm run test:ui      # Playwright's interactive runner
   npm run report       # open the last HTML report
   ```

App under test: UI at `http://localhost:3000`, API at `http://localhost:5000`. A seeded, verified account is available for tests. Reset everything with `docker compose down -v` from the repo root, then re-seed.

## Layout

```
e2e/
  tests/
    api/     REST API tests (auth, positive/negative, contract)
    ui/      UI end-to-end journeys
  pages/     Page Objects (UI abstractions)
  fixtures/  shared setup / auth-state reuse
```

## Intended scope

As it's built out: risk-based UI journeys behind Page Objects, API tests (auth + negative cases) against the owned backend, auth/state fixtures, web-first assertions, and flake control (CI retries + Playwright traces) — wired into CI.
