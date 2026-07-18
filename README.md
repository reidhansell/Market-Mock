[![Run Tests](https://github.com/reidhansell/Market-Mock/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/reidhansell/Market-Mock/actions/workflows/test.yml)

# Market Mock

Market Mock is a free, educational paper-trading platform: practice investing in a risk-free setting, with game-like quests and leaderboards to make learning the market enjoyable.

Built solo by Reid Hansell in 2023 — Express/TypeScript + MySQL on the back, a React/Cloudscape SPA on the front. In 2026 the app was revived to serve as the **app-under-test for a hand-authored Playwright + API test suite** — see [`e2e/`](e2e/README.md). The app is the target; the suite is the point.

## Features

- **Paper trading:** buy and sell with fake money against real market structure.
- **Quests:** guided goals that start simple and get progressively harder.
- **Leaderboards:** a competitive, achievement-driven learning environment.

## Running it locally

Prereqs: Docker Desktop, Node 18+.

```
docker compose up -d      # mysql, backend, frontend, mailpit
bash scripts/seed.sh      # deterministic data + a verified test account
```

UI at `http://localhost:3000`, API at `http://localhost:5000`, Mailpit (email capture) at `http://localhost:8025`. Seeded account: `seed@marketmock.test` / `Test1234!`. Reset with `docker compose down -v`, then re-seed.

Full detail — including installing and running the Playwright suite — lives in [`e2e/README.md`](e2e/README.md).

## Testing & CI

- **`e2e/`** — the hand-authored test suite: Playwright + TypeScript, UI journeys behind Page Objects plus REST API tests. Start with the [risk-based test plan](e2e/TEST-PLAN.md) and the [defect reports with repro evidence](e2e/BUGS.md).
- **CI** — [`.github/workflows/test.yml`](.github/workflows/test.yml) runs on every push and on pull requests into `dev`/`main`. It currently runs the app's Jest unit tests; wiring the Playwright suite into CI is the roadmap (see [`e2e/README.md`](e2e/README.md), "Intended scope"). The badge above tracks `main`.

## How AI is used in this repo

Being explicit about authorship, because for this repo it's the point:

| Part                                                                                          | Who / how                                                                                                                                 |
| --------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| The app — `routes/`, `tools/`, `client/`, `database/`, …                                      | Reid's own 2023 code. Recent changes to run it as a test target are AI-assisted and tagged in-code `TEST-TARGET ADAPTATION (2026-07-12)`. |
| The tests — `e2e/tests/`, `e2e/pages/`, `e2e/fixtures/`                                       | **Reid, hand-authored, no AI.** Deliberate SDET skill-building.                                                                           |
| Scaffolding — `e2e/` config, `scripts/seed.sh`, the READMEs (including this one), `CLAUDE.md` | AI-drafted (Claude), maintained with Reid.                                                                                                |

## Git workflow

Day-to-day work happens on `dev`; changes land in `main` via pull request, gated on the CI check going green. If `dev` falls behind `main`, it's caught up with a fast-forward merge (`git merge --ff-only main`) — never a rewrite.

## License

MIT — see the LICENSE file.

## Contact

Reid Hansell — reidhansell@gmail.com
