# Test Plan, Market Mock

My test plan for Market Mock. It runs on one rule: I spend testing effort in proportion to risk. The sections below are the steps I take to apply it.

## How this is organized

Everything here follows from one rule, **effort goes where the risk is.** The sections are not independent templates to fill in. They are the steps of one procedure, and every step is organized by risk.

1. **Surfaces.** Where the product can fail, grouped by who consumes each one (end users versus developers). Different consumer, different surface, different tests.
2. **Feature inventory.** Per surface, what a consumer does, organized into domain clusters (UI by user goal, API by resource) with the atomic actions nested inside. The nested items are _predictions_ of where a feature might later split by risk. Structural only, no risk yet.
3. **Risk-based prioritization.** Rank by impact and likelihood, resolving the inventory into rows where **one row is one shared risk profile.** Coarse features split apart where their nested parts diverge in risk. Fine or same-domain items group together where they share it. This is the only place risk enters, and the only place the grain changes.
4. **Test types.** Functional is the broad baseline across every feature. Each non-functional type (security, performance, and so on) attaches only to the specific features where that risk actually lives.
5. **Out of scope.** The test types I deliberately skip, each with a reason.

**One scope note.** I own the whole stack here, so unlike a black-box third-party SUT this is not limited to a single outside-in level by constraint. E2E plus API is a deliberate choice, and the test-levels question (unit and integration) is real rather than hypothetical (see section 8).

<!-- Notes to self on why the structure is shaped this way.
     The "infinite number of things to test" problem is real, but it lives at the test-CASE level, below
     scope. Scope works at the feature and feature-by-type level, both finite. Case count is controlled
     by risk depth in section 4.1, not by listing cases out.
     Feature grain: stop where a user would name the goal ("log in", not "focus the email field"). Only
     split a feature in section 3, and only when the halves carry different risk.
     Out of scope is not guesswork: walk the standard quality menu once (ISO 25010, ISTQB), and whatever
     I skip with a reason becomes the out-of-scope list. -->

## 1. Surfaces (by consumer)

<!-- A surface is a place the product can fail, grouped by who depends on it. A defect only hurts whoever
     consumes it. -->

| Surface      | Consumer                        | In / out of scope |
| ------------ | ------------------------------- | ----------------- |
| UI (web app) | end users                       | in                |
| REST API     | developers / integrators, no UI | in                |

I own this backend, so the API is the **complete** surface, not a curated public subset. That runs the section 2 completeness cross-check strong both ways, and it surfaces API-only features (monitoring) that a UI walk would never show.

## 2. Feature inventory (per surface)

_What a consumer would say they came to do, organized into domain clusters (UI by goal, API by resource). Coarse. Risk-splitting happens in section 3._

<!-- Structure and grain.
     Organize each surface into domain clusters with the atomic actions nested inside: UI by user goal,
     API by resource. Same shape on both surfaces.
     The nested items are PREDICTIONS of where a feature might split by risk in section 3, not decisions.
     No ranking and no risk here. This stage is structural only.
     Completeness cross-check: I own the stack, so it runs both ways. Every UI goal has an endpoint,
     and API-only features (monitoring) have no UI. Walk both surfaces, not just the site. -->

### 2.1 UI (end users)

1. **Make an account** (sign up, sign in, sign out, verify email) _[no delete or update account]_
2. **Browse stock data** (search tickers, view charts, intraday or EOD)
3. **Buy and sell** (place order: market, limit, stop; fulfillment)
4. **Track stocks I'm watching** (add or remove from watchlist)
5. **See how I'm doing** (portfolio: holdings, net-worth over time, P/L)
6. **Cancel pending orders** (view open limit or stop orders, cancel)
7. **Complete quests** (progress the game's quests)
8. **Reset my run** (wipe progress back to a starting balance) _[destructive]_

_[leaderboard, advertised in the README but no endpoint, expected-but-absent]_

### 2.2 REST API (developers)

The owned backend. Every UI cluster above has an endpoint. Plus one with no UI.

- **Monitoring:** HTTP-request and hardware-load logging (internal ops).

## 3. Risk-based prioritization

_Ranked by **impact and likelihood**, resolved into rows where one row is one shared risk profile. Coarse features split here where their parts diverge in risk. Fine or same-domain items group. This ordering is the plan._

<!-- What a ROW is: one shared risk profile, not one inventory entry. Resolve section 2 into rows by
     splitting a coarse feature where its nested parts diverge in risk, and grouping fine or same-domain
     items where they share it. The pre-splits from section 2 were predictions. Real risk confirms or
     overrides them here.
     Finding the splits is mechanical, not a stare: walk each cluster's section-2 pre-splits and fail each
     child in turn. When one child's failure is far worse or far likelier than its siblings, it wants its
     own row. Judging a feature as one blob hides its worst part. The average washes the outlier out.

     Priority is impact and likelihood together. Priority is the OUTPUT (the answer). Impact and likelihood
     are the two INPUTS (the work). Assess the two inputs independently and FIRST, then let priority fall
     out. Do not pick a priority and backfill impact to match, or impact just becomes a copy of priority.
     Because likelihood modulates it, a high-impact and low-likelihood row can rank BELOW a medium-impact
     and high-likelihood one. That is why impact and priority are not one column.
     Impact means how bad it is if it breaks. Money, auth, PII, destructive, or blocks-downstream beats
     cosmetic.
       Gating is NOT impact. "A is a prerequisite for B" is transitive (browse then place then execute,
       signup then everything). If prerequisite meant high-impact, every upstream feature is H and the
       axis collapses. Availability-gating fails LOUD and bounded (announces itself, corrupts nothing,
       caught by testing that feature), so no bump. "Blocks-downstream" means SILENT propagation: bad data
       or state that flows on and executes wrongly without announcing (a malformed-but-valid order settling
       as a real wrong trade). The severity is the marker, not the prerequisite ordering.
     Likelihood means how much room there is to go wrong (step count, input or validation surface,
     integrations). The app "works", so likelihood is not "recently changed", it is how edge-case-rich the
     area is.
     Frequency of use is NOT likelihood. Heavy traffic on a stable feature is blast radius, which belongs
     in impact.
     API risk lens: read-only data is low. Touches auth or PII, or changes or destroys state, is high.
     Do not rank everything P0 (if all of it is critical, none of it is). The reasoning list below the
     table is the deliverable. -->

| Priority | Feature                        | Surface | Impact | Likelihood |
| -------- | ------------------------------ | ------- | ------ | ---------- |
| P1       | Sign up and verify email       | UI/API  | H      | L          |
| P1       | Sign in                        | UI/API  | H      | L          |
| P0       | Session (stay logged in)       | UI/API  | H      | H          |
| P1       | Browse stock data              | UI/API  | M      | L          |
| P1       | Order placement and type rules | UI/API  | H      | L          |
| P0       | Order execution and settlement | UI/API  | H      | H          |
| P2       | Track stocks I'm watching      | UI/API  | L      | M          |
| P1       | See how I'm doing (portfolio)  | UI/API  | H      | M          |
| P2       | Cancel pending orders          | UI/API  | L      | L          |
| P2       | Complete quests                | UI/API  | L      | M          |
| P1       | Reset my run                   | UI/API  | H      | M          |
| P2       | Monitoring                     | API     | L      | L          |

**Why these ranks**

_Ranking principle: no real money, so proximity-to-revenue does not apply. Impact rides on two axes. First, correctness and availability of the trading and portfolio core (the education lens, where a wrong-but-not-crashed number is still a failure). Second, account and data safety (auth, PII, destructive ops). Quests are the engagement layer, capped low._

<!-- One bullet per row. Each bullet has an IMPACT clause (what breaks and how bad) then a LIKELIHOOD
     clause (how much room to go wrong). The priority falls out of the two. Model, from my old plan:
     "Make an account (P1). Prereq to buying, so it gates revenue, high stakes. But a simple flow a user
     hits once, so it rarely breaks." -->

- **Sign up and verify email (P1).** **Impact:** high because it is auth. Account creation plus email verification is account-safety surface (a verification bypass or a botched new account is a security failure, not a mere inconvenience). It is not high because it "gates the app". Being blocked is loud and bounded, so the severity is the auth stakes. **Likelihood:** low. One short linear happy path, a single form then one click of an emailed link, a narrow validation surface. High impact and low likelihood, so P1. (Used once per user, but frequency is blast radius, not likelihood.)
- **Sign in (P1).** **Impact:** high. It is the auth gate to every authenticated action. **Likelihood:** low. A single-endpoint credentials check, a short path with a narrow surface. BUG-001 (the login leak) living here does not raise that. Likelihood measures the area's edge-case richness, not defects found. A junior dev can ship a bug even in a genuinely low-surface flow.
- **Session, stay logged in (P0).** **Impact:** high, same as sign-in. A broken session drops an authenticated user or fumbles their token. **Likelihood:** high. Where sign-in is one shot, the session is a stateful lifecycle (issue, refresh, expire, log out) with real integration surface, exactly where BUG-002 lives (a refresh-token response-shape mismatch that causes silent logout). High impact and high likelihood, so P0.
- **Browse stock data (P1).** **Impact:** medium. It is read-only, so nothing here corrupts state, and if the view breaks it fails loudly (a user could route around it via the API). The subtler risk is a wrong price or chart misleading a trade decision, a correctness defect under the education lens. But execution fetches its own price server-side, so bad display data cannot corrupt the actual trade. Not money, auth, or destructive, so it caps at medium. **Likelihood:** low. Read-only reads over seeded data, simple display, narrow surface. Medium impact and low likelihood, so P1.
- **Order placement and type rules (P1).** **Impact:** high, not because it "gates" trading (a can't-submit failure is loud and bounded), but because a malformed-but-valid order persisted here executes downstream as a real wrong trade. A bad quantity, or a LIMIT stored as MARKET, flows silently into settlement and moves the wrong money. That silent propagation is the true "blocks-downstream" marker. **Likelihood:** low. Just input validation (ticker, order type, trigger price, quantity) and persisting the order row, a short well-bounded surface. High impact and low likelihood, so P1. (P1 whether impact reads high or medium, so the priority is stable.)
- **Order execution and settlement (P0).** **Impact:** high. This is the shared `processOrder` path every order settles through (market fills immediately, limit or stop via the trigger check): funds and stock validation, the atomic transaction, and the balance, holdings, and net-worth update at the current price. It moves money and mutates portfolio state app-wide, so a bug here hits all order types at once. **Likelihood:** high. The most integration-heavy code in the app: live price fetch, fulfill decision, commit and rollback, several downstream writes, running on two paths (synchronously on placement, plus the hourly cron for open orders). High impact and high likelihood, so P0.
- **Track stocks I'm watching (P2).** **Impact:** low. A convenience and organizing feature: no money, auth, or destructive op, and a break is loud and bounded (your saved tickers just do not show). **Likelihood:** medium. Simple add and remove, but a little state to get wrong (duplicates, removing something absent) plus the auto-add-on-fill path (`addTickerToWatchList` runs when an order settles). Low impact and medium likelihood, so P2.
- **See how I'm doing, portfolio (P1).** **Impact:** high. This is the app's core educational payoff. Holdings, P/L, and net-worth-over-time are the feedback a user learns from, so a wrong number does not just mislead a screen, it teaches a wrong lesson that can bleed into real financial decisions (a silent failure). Two things push it past a plain read-out: it is the number the app exists to show you, and net-worth is computed and persisted to history, so a bad calc corrupts stored state-of-record, not just a transient view. **Likelihood:** medium, not because the calc is long, but because the P/L and cost-basis accounting is stateful and edge-rich (partial sells, averaging, ordering) over all holdings plus a saved time series. Real room to go wrong. High impact and medium likelihood, so P1.
- **Cancel pending orders (P2).** **Impact:** low. Cancelling only affects one order you already placed. Failure means you keep an order you tried to drop, which is bounded control-loss, not corrupted state. (Strict view: a silent cancel-failure could let an unwanted limit or stop fill later, a mild silent-propagation case, but it is confined to one order you chose to place, so it stays low.) **Likelihood:** low. A single guarded operation (an ownership check plus an is-it-still-open check, then mark cancelled), narrow surface. Low impact and low likelihood, so P2.
- **Complete quests (P2).** **Impact:** low. The engagement and gamification layer, capped low by design: a broken quest is motivational or cosmetic, never money, auth, or data. **Likelihood:** medium. Quest progress is checked from several trigger points (place buy, sell, limit, stop, or market in the order route, fulfill or profit in the settlement path), so a moderate number of places to miss. Low impact and medium likelihood, so P2.
- **Reset my run (P1).** **Impact:** high. It is destructive and irreversible: the `User_Reset` snapshot saves only the starting and end balance, not the holdings, orders, or history, so once it commits the run is gone for good. It is bounded to the one user (every delete scoped by `WHERE user_id = ?`, no cross-user blast) and self-inflicted and expected, but the irreversibility keeps it high, not a shrug. **Likelihood:** medium. Not a simple query but an eight-table transaction (snapshot, update, six deletes, insert, a per-order transaction-delete loop, conditional rollback), and already edge-fragile: the loop throws for users with open or cancelled orders (see BUG-003) and the `affectedRows` guards are half commented-out. Real room to go wrong. High impact and medium likelihood, so P1.
- **Monitoring (P2).** **Impact:** low. Internal ops telemetry (HTTP-request and hardware-load logging), API-only with no user-facing surface. If it breaks, operators lose visibility but users are unaffected, so no money, auth, or data. **Likelihood:** low. Fire-and-forget inserts (`insertHTTPRequest`, hardware-load log) over a narrow stable surface. Low impact and low likelihood, so P2.

## 4. Test types

### 4.1 Functional (baseline)

_Applies to every ranked feature, positive plus negative and validation, depth set by the feature's rank._

<!-- Mechanical, derives straight from the section-3 ranks, no new judgment. Depth by rank:
     P0 is positive plus several negative, edge, and boundary. P1 is positive plus key negatives. P2 is a
     smoke. The actual case list gets written when the tests do, not in the plan. -->

### 4.2 Non-functional (targeted)

_Each type attaches to specific features, only where that quality carries real risk. Most features get none._

<!-- Walk the quality menu once. Each TYPE either attaches to the feature or features where its risk lives,
     or drops to section 5 as one disclaimed line. Partition the roughly seven TYPES, not the
     type-by-feature grid. Additive, not a full grid. Menu: performance, security, accessibility,
     compatibility, usability, reliability, localization. -->

- **Security:** the auth cluster plus every user-scoped endpoint. Two layers. First, **authentication:** sign-in and session (BUG-001 leaks the password policy, BUG-002 breaks session refresh). Second, **authorization (IDOR):** every endpoint acting on user-owned data (orders, cancel, reset, portfolio, watchlist) must reject another user's records. Ownership is enforced off the session token today (cancel checks `order.user_id !== user_id` in `routes/order.ts:103`, reset scopes each delete by `user_id`). The security test verifies that on every endpoint rather than assuming it. Also confirm inputs stay parameterized (`?` placeholders) so injection stays closed.
- **Reliability:** the transactional write paths, execution and settlement plus reset. Both wrap multi-table writes in a DB transaction where a partial failure corrupts state. The test is that a mid-operation failure rolls back clean, with no half-applied money or holdings (settlement) and no half-wiped run (reset, where BUG-003 shows the rollback path is already load-bearing).
- **Performance:** the fulfillment batch. `fulfillOpenOrders` loops every open order hourly, a DB round-trip plus transaction each (`tools/services/orderFulfillmentService.ts:119`), which grows with open-order volume. (The slow ticker fetch from memory was the live MarketStack sync, disabled for the test target, since the SUT reads seeded prices, so it is not a live risk here.) This is where section 8's "real load and stress on my own infra" would land.
- **Compatibility:** cross-browser is surface-wide, not tied to one feature, and I measure its cost instead of guessing. Playwright already ships all three engines (Chromium for Chrome and Edge, Firefox, and WebKit for Safari; no Internet Explorer, it is retired), so I run the full suite on all three once and let the result make one all-or-nothing call. If it passes clean, or with just a small fix or two, I keep all three browsers. If getting Firefox and WebKit green would take real per-browser or source work, I defer cross-browser entirely and stay Chromium-only on purpose, rather than ship a half-covered matrix. The call is measured effort, not a guess about which journeys matter.

## 5. Out of scope

_Test types I'm deliberately not running, each with a reason, so a gap reads as a decision, not an oversight._

<!-- The menu types NOT attached in 4.2 land here, each disclaimed in ONE line, plus any scope boundaries.
     Type-level, never a per-type-per-feature cell. Note: owning the stack means far less is out by
     constraint than on a black-box SUT. Most exclusions here are choices, not access limits. -->

- **Accessibility:** deferred as an explicit scope choice for a solo portfolio build. The UI is built on Cloudscape, which gives a reasonable a11y baseline (context for why the deferral is low-risk, not a substitute for testing).
- **Usability:** out. Qualitative and manual, not assertable in an automated functional suite.
- **Localization:** out. USD-only, English-only by design, no planned locales.

**Scope boundaries** (structural, not type-level).

- **Leaderboard:** advertised in the README but has no endpoint (expected-but-absent). Nothing to test until it exists.
- **Live market-data feed:** the MarketStack sync is disabled for the test target. The SUT runs on deterministic seeded prices, so the live integration is out of scope here.
- **Test levels below E2E and API:** section 8 notes unit and integration are now in reach, but this suite deliberately scopes to E2E and API. Lower-pyramid coverage is a future choice, not a gap.

## 6. Environments

- **SUT:** local Docker stack. `docker compose up -d` brings up mysql (8.0 on host 3307), backend (5000), frontend (3000), mailpit (8025 and 1025). Deterministic seeded data via `bash scripts/seed.sh`, full reset with `docker compose down -v`. Unlike a shared third-party host, I control the data and the environment, so no external flakiness.
- **Browsers:** Chromium (Firefox and WebKit available via the Playwright project matrix when wanted).
- **CI:** GitHub Actions: boot stack, seed, run suite, traces and HTML report as artifacts.

## 7. Entry and exit criteria

<!-- Entry is what has to be true before a test cycle counts. Exit is when the cycle is done. Honest to
     what this repo actually gates on. -->

**Entry:** the stack is up and seeded, dependencies and browsers are installed, and the suite passes locally before push.

**Exit:** every P0 and P1 feature has automated coverage and passes, defects are written up in `BUGS.md`, and no open Blocker or Critical defects remain.

## 8. What owning the app makes possible

This suite tests from the outside in, end to end through the UI plus the API. Because I own the whole app and not just its front door, I could go deeper. Unit and integration tests for the internal logic and contracts, load and stress tests against my own servers, security tests with real backend access, and fault injection to confirm the app recovers when something breaks. Staying at E2E and API is a deliberate scope choice, not a wall I am stuck behind.

## Appendix, the algorithm start to finish

The repeatable procedure behind this plan, in order, so I can re-run it on any product. One rule underneath all of it: **effort goes where the risk is.** Each step's finer detail lives in the linked section.

1. **Surfaces, by consumer** (section 1). Where the product can fail, grouped by who depends on it (end users to UI, developers to API). A defect only hurts that surface's consumer.
2. **Feature inventory, per surface** (section 2). What a consumer does, at user-goal grain, in domain clusters with atomic actions nested as _predictions_. No risk yet. Cross-check the surfaces (a documented API maps to UI as a strong signal, UI to API is weak unless I own the API, then it is strong both ways).
3. **Risk ranking** (section 3). Priority comes from impact and likelihood together. Assess the two inputs first and let priority fall out. One row is one shared risk profile: **split** a cluster where a child's failure is worse or likelier than its siblings (fail-each-child), **group** where they share risk.
4. **Functional coverage** (section 4.1). Mechanical: every feature, depth set by its rank (P0 deep, P2 a smoke).
5. **Non-functional, targeted** (section 4.2). Walk the quality menu once. Each type either attaches to the feature or features where its risk lives, or drops to section 5. Targeted, never type-by-feature.
6. **Out of scope** (section 5). The un-attached types plus scope boundaries, each with a reason (expectation management). Silence covers everything else.
7. **Environments plus entry and exit** (sections 6 and 7). Where it runs, plus the objective gates for "ready to test" and "done testing".
