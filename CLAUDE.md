# CLAUDE.md — Market Mock

_AI-authored (Claude), maintained with Reid. This is a **public** repo — keep it that way (see the rules below)._

## Orientation

Human-facing docs live in the READMEs — read those, don't duplicate them here:

- **Root `README.md`** — what the app is, how to run it, testing & CI, git workflow, and the AI-usage/authorship table.
- **`e2e/README.md`** — the test suite: boot/seed/install/run, layout, intended scope.

Short version: Reid's 2023 solo full-stack paper-trading app, revived in 2026 as the app-under-test for his hand-authored Playwright + API suite. The app is the target; the suite in `e2e/` is the point.

## Rules for AI working here

- **The tests are Reid's no-AI learning.** Do not write, complete, or draft his tests, Page Objects, or fixtures (`e2e/tests/`, `e2e/pages/`, `e2e/fixtures/`). Hint, explain, point at the bug, review after he's drafted — never hand him finished test code.
- **Public repo.** Reid's career/strategy context (the _why_ behind this revival) lives in a separate private workspace — **never write it here.** This repo is the app and its tests, nothing about the job hunt.
- Any prose/doc you author gets labeled AI; a mixed file marks where Reid's words begin; his own files get no note.
- Keep test-target changes tagged `TEST-TARGET ADAPTATION` so they stay greppable and honest.
- AI-authored commits carry a `Co-Authored-By: Claude` trailer; Reid's own commits use his peer style.
- Follow the git workflow in the root README (`dev` → PR → `main`, CI green gates the merge). Don't admin-bypass protection on Reid's behalf.
