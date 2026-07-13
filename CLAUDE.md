# CLAUDE.md — Market Mock

_AI-authored (Claude), maintained with Reid. This is a **public** repo — keep it that way (see "Boundaries")._

## What this is

Market Mock is a full-stack paper-trading web app Reid built solo in 2023 (Express/TypeScript + MySQL + a React/Cloudscape SPA). As of July 2026 it's been revived to serve as the **app-under-test for Reid's QA-automation ramp** — a real, owned, deterministic target for a hand-authored Playwright + API suite. The app is the target; the suite in `e2e/` is the point.

## How AI is used in this repo (the honest version)

| Part | Who / how |
| --- | --- |
| The app — `routes/`, `tools/`, `client/`, `database/`, … | Reid's own 2023 code. Recent changes to run it as a test target are AI-assisted and tagged in-code `TEST-TARGET ADAPTATION (2026-07-12)`. |
| The tests — `e2e/tests/`, `e2e/pages/`, `e2e/fixtures/` | **Reid, hand-authored, no AI.** Deliberate SDET skill-building. |
| Scaffolding — `e2e/` config, `scripts/seed.sh`, READMEs, this file | AI-drafted. |

**If you are an AI working here:** the tests are Reid's no-AI learning. **Do not write, complete, or draft his tests, Page Objects, or fixtures.** Hint, explain, point at the bug, review after he's drafted — never hand him finished test code. Any prose/doc you author gets labeled AI; a mixed file marks where Reid's words begin; his own files get no note.

## Run it

Not duplicated here — see **`e2e/README.md`** for boot / seed / install / run. Short version: `docker compose up -d` at the repo root, then `bash scripts/seed.sh`. Seeded account: `seed@marketmock.test` / `Test1234!`.

## Map

- **App under test:** repo root + `client/`. `docker-compose.yml` runs mysql (8.0 → host 3307), backend (:5000), frontend (:3000), mailpit (:8025 UI / :1025 SMTP).
- **Test suite:** `e2e/` — Playwright + TypeScript (`tests/api`, `tests/ui`, `pages/`, `fixtures/`).
- **Data seed:** `scripts/seed.sh` — deterministic, idempotent; the fixture the tests build on.

## Boundaries

- **Public repo.** Reid's career/strategy context (the *why* behind this revival) lives in a separate private workspace — **never write it here.** This repo is the app and its tests, nothing about the job hunt.
- Keep test-target changes tagged `TEST-TARGET ADAPTATION` so they stay greppable and honest.
- AI-authored commits carry a `Co-Authored-By: Claude` trailer; Reid's own commits use his peer style.
