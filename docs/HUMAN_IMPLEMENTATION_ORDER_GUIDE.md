# EarnSetu Basket — Human Implementation Order Guide

> Audience: the project owner/developer implementing the application manually.
> This is a working implementation guide derived from the repository's current documentation, PRI, LFI, and accepted ADRs. It is **not an OpenCode execution prompt** and does not delegate implementation to an AI coding agent.
> Verified reference point: public repository `coderooz/earnsetu-basket`, branch `master`, documentation primarily dated 2026-10-11/12. Always inspect the current checkout before acting; the working tree may be ahead of GitHub.

## 1. How to read the project's governance files

Use these resources for different purposes:

1. **`AGENTS.md`** — repository-wide constraints and commands. Even though it is written for coding agents, its architectural constraints are useful to you as the developer.
2. **`README.md`** — product purpose, current status, setup, and links into the docs.
3. **`.workspace/PRI/PROJECT_REFERENCE_INDEX.md`** — structural index: entry points, source paths, responsibilities, configuration, docs. Use it to find files; it is a navigational aid, not proof that a feature works.
4. **`.workspace/LFI/LOGIC_FLOW_INDEX.md`** — behavioural map: what actually happens when the user taps or launches something. The stable flow IDs document current behaviour, including mock/no-op flows.
5. **`.workspace/LFI/COMPONENT_INTERACTIONS.md`** — which providers, screens, and components actually call/read/render each other.
6. **`.workspace/LFI/DIAGRAMS.md`** — bootstrap/navigation diagrams and proposed data flow.
7. **`.workspace/LFI/ERROR_PATHS.md`** — known errors and missing failure handling.
8. **`docs/ARCHITECTURE.md`, `docs/REPOSITORY_STRUCTURE.md`, `docs/TECH_STACK.md`** — current architecture and dependencies.
9. **`docs/PRODUCT_SCOPE.md`, `docs/FEATURE_STATUS.md`, `docs/ROADMAP.md`** — what belongs in Basket, what is implemented, and proposed direction.
10. **`docs/decisions/README.md` + each accepted ADR** — accepted long-lived decisions; do not silently violate them.
11. **`docs/DATA_MODEL.md`, `docs/DATABASE_AND_MIGRATIONS.md`, `docs/OFFLINE_FIRST.md`** — data/database options and constraints. Their proposed models are not implementations or automatically accepted decisions.
12. **`docs/development/FEATURE_DEVELOPMENT.md`, `docs/development/DATABASE_MIGRATIONS.md`, `docs/TESTING.md`** — practical change workflow, migration rules, and test status.
13. **`REPORT_INDEX.md`** — links to historical reports. Reports are evidence snapshots, not the source of truth for the current code.

### Rules for resolving contradictions

- Start with the actual checked-out source/config and Git status.
- Accepted ADRs control decisions that they explicitly cover, until they are superseded.
- The code is the source of truth for current behaviour; update LFI when behaviour changes.
- PRI answers **where** something belongs; LFI answers **what happens** and which paths change.
- Docs may be stale or contradictory. Record and resolve material contradictions; do not silently assume an old roadmap equals the current implementation.
- Keep a small work log/change list for yourself. No AI agent is required.

## 2. Important current state found in GitHub

The default branch is `master`. The repository describes itself as an early prototype/pre-alpha scaffold, not a completed shopping app.

Current documented stack: Expo SDK 57, React Native 0.86.3, React 19.2.3, strict TypeScript, NativeWind v4 with Tailwind CSS v3, React Navigation v7, npm. The existing parent EarnSetu mobile stack is in the same family.

Documented state at the reference point:
- Navigation scaffold: four bottom tabs (Home, Purchases, Profile, Settings), each with a stack; 19 routed screen skeletons.
- Onboarding UI exists.
- Authentication and signup are mocks/stubs, not real authentication.
- Shopping lists, item management, purchase recording/history, domain models and SQLite persistence are not implemented in the GitHub docs.
- `expo-sqlite` is present/configured but not used by application code according to the documentation.
- Backend/API, sync, and a Basket-specific auth contract do not exist.
- Test runner/test files are absent; static checks are the existing baseline.
- The current LFI documents working bootstrap/onboarding/mock-auth/routing/AsyncStorage paths and specific inert UI/error cases.
- GitHub ADR-0002 has already resolved the app as a **standalone repository** that is a specialized child/extension of EarnSetu, and says to remain stack-aligned. It does not mean Basket already shares auth/backend/data.
- ADR-0003 accepts React Navigation bottom tabs + per-tab stacks + typed route params.
- ADR-0001 pins `react-native-css-interop` for NativeWind v4; ADR-0004 adds a direct parser dependency to fix lint resolution. Respect these pins unless you explicitly supersede them after testing.

This snapshot conflicts with some recent local context where more implementation may have happened. Therefore, before following this guide, compare your actual working tree against `master` and revise the phase checklist based on what is already present. Do not re-implement a feature merely because an older GitHub doc says it is missing.

## 3. Overall implementation order

Implement one stable layer at a time. Do not start building screens that depend on a data model that has not been decided.

```text
0. Reconcile repo + design and freeze scope
1. Confirm project setup / icon / local emulator loop
2. Approve domain + offline/persistence ADRs
3. Define entities and money/date/deletion rules
4. Build SQLite and migration foundation
5. Add repository + domain/service logic with tests
6. Add first-run, error, loading, and reusable UI foundations
7. Implement Lists + List Items
8. Implement independent local Shop Directory
9. Implement Purchases + Purchase History
10. Integrate Home and navigation flows
11. Add backup/export/import policy and implementation
12. Complete accessibility, privacy, boundary and recovery cases
13. Test full journeys and regressions on emulator/device
14. Update docs, PRI, LFI, feature status, reports, roadmap
15. Release engineering only after product flows are stable
```

Phases may overlap only when the dependency is one-way and the lower layer has a stable API. Do not mix DB redesign, navigation redesign, and all feature screens into one giant change.

## 4. Phase 0 — Establish the baseline

Do this before coding.

1. Open the root README, AGENTS, docs index, FEATURE_STATUS, ARCHITECTURE, TECH_STACK, KNOWN_LIMITATIONS, ROADMAP, PRI, all LFI files, ADR index, and the accepted ADRs.
2. Run `git status --short --branch`, inspect HEAD and diffs, and note any uncommitted files. Make a safe backup or branch using your normal Git workflow before a major rebuild; never erase the current working directory.
3. Verify actual `package.json`, lockfile, app config, Expo SDK, Node/npm, NativeWind/Tailwind versions and scripts.
4. Launch the existing app on the emulator and fix the dev environment until you can reliably: start Metro, install the development build, load JS, reload, and see logs. Keep network/signature issues separate from application code bugs.
5. Use the supplied HTML design demo as the UI reference. Record the global tokens, typography, surfaces, tabs, cards, spacing, form states, empty states and icon rules in a design note before building individual screens.
6. Make an implementation checklist from the actual current code, not only these historical docs. Mark each item PRESENT/WORKING, PRESENT/BROKEN, PLACEHOLDER, or MISSING.

**Exit criteria:** you can reproduce the app launch locally; you know exactly which starter code is reusable; architecture questions are visible and written down.

## 5. Phase 1 — Make the bounded architecture decisions

Use `docs/decisions/ADR_TEMPLATE.md` and increment from the next unused ADR number. Put the decision in Proposed state until you, the developer, accept it. Then update the ADR index and relevant docs.

Decide these before building dependent code:

1. **Persistence: SQLite** (recommended for structured lists/items/shops/purchases) or an alternative. Since Expo SQLite is already part of the stack and this is offline-first relational data, prefer it unless you have a concrete reason not to.
2. **Ownership and identity:** personal local profile vs account-owned data. Until the parent contract is established, avoid introducing remote user ownership IDs as if they were real.
3. **Data model and relations:** can a purchase exist with no shop; does a purchase contain multiple purchased items; how do planned items differ from actual purchase rows; how are shops with purchases archived/deleted.
4. **Money:** store in integer minor units (for INR, paise) with explicit rounding; do not use binary floats as the persisted money representation.
5. **Date/time:** define storage format (UTC ISO timestamp or integer epoch plus timezone assumptions) and local display policy.
6. **Delete/archive:** define what happens to children and historical records. Prefer archive/retain when references or history exist.
7. **Backup/export:** define format, versioning, file handling, import validation, and recovery before relying on export as protection against data loss.
8. **Testing:** select compatible test tooling and where tests live; wire the test command early.
9. **Authentication/backend/sync:** explicitly defer implementation until Basket-facing contracts exist. Do not invent endpoints or share auth sessions on assumptions.

Keep the decisions scoped. Do not add a backend, Clerk, sync engine, or extra data libraries just because those appear in proposed docs. If your intended rebuild changes the accepted navigation or stack, supersede the existing ADR intentionally instead of silently contradicting it.

**Exit criteria:** ADRs are accepted, entity relationships are documented, and there is no unresolved decision that would force a schema rewrite.

## 6. Phase 2 — Domain model and schema design

Update `docs/DATA_MODEL.md` to reflect the accepted model before implementing tables.

Start with these conceptual entities, modifying fields to match your decisions:

- **ShoppingList** — stable ID, name, creation/update timestamps, active/archive status.
- **ShoppingListItem** — stable ID, list ID, name, desired quantity/unit, notes, checked state, ordering, timestamps.
- **Shop** — stable ID, required name, optional category/contact/address/locality/notes, timestamps, archive marker.
- **Purchase** — stable ID, actual purchase timestamp, optional shop reference, notes, timestamps, optional historical shop snapshot if needed.
- **PurchaseItem** — stable ID, purchase ID, purchased-name snapshot, actual quantity/unit, optional unit price and line total in minor units, notes.

Do not automatically adopt the current illustrative `DATA_MODEL.md` purchase-to-planned-item relation. It is explicitly proposed and unresolved. A purchase item should usually preserve the item name/quantity/price actually purchased; it must not break when a planned item is renamed, deleted or partially purchased.

Record constraints such as non-empty names, quantity validation, duplicate submission prevention, optional price, optional shop, unique IDs, FK actions, and ordering. The user must explicitly save a purchase; checking a shopping-list item alone must not create a purchase.

**Exit criteria:** the schema and relationship diagram make clear how partial purchases, missing shops, shop edits and archived lists behave.

## 7. Phase 3 — Persistence foundation and migrations

Implement database code away from screens. Suggested boundary: `src/db/` + `src/repositories/` or a data folder aligned to your chosen convention. Check PRI first and update it when you create the actual paths.

Recommended sequence:

1. Database open/connection module with single-flight initialization.
2. Schema version mechanism using SQLite `PRAGMA user_version` or a migration table.
3. Ordered, forward-only migration runner.
4. Initial tables, foreign keys, indexes and transactions.
5. Startup barrier: migration must finish before any repository reads/writes.
6. Typed repository APIs with parameterized SQL.
7. Domain input validation and predictable errors.
8. Unit/integration tests for migrations and repository behaviour.

Migration rules from `docs/development/DATABASE_MIGRATIONS.md`:
- Never edit a migration after it has been released; add a new migration.
- Prefer transactions; partial migration must roll back.
- Migrations should be deterministic/idempotent where appropriate and run once per version.
- Test a fresh DB, upgrading an older DB with seeded data, repeat/idempotency, and failure rollback.
- Surface migration errors; do not swallow them.
- Update DATA_MODEL and database docs with schema changes.

If you are truly initializing a brand-new v2 app, keep a distinct database filename from the old app until you have completed an explicit data-transfer/import plan. Do not have two app installs accidentally point at or overwrite each other's database.

**Exit criteria:** schema initializes from a fresh install, migrations are versioned, and repository CRUD survives process restart with tests.

## 8. Phase 4 — Test and platform foundations

Do this before feature expansion.

1. Set up the test runner compatible with the actual Expo SDK, TypeScript and native dependencies. The current GitHub docs say no test runner exists; re-verify.
2. Add scripts for unit tests and, where useful, coverage.
3. Ensure CI can run lint, typecheck, Expo Doctor and tests deterministically.
4. Add a consistent loading/empty/error pattern and form validation pattern.
5. Implement an error boundary and clear user-facing recoverable errors where appropriate.
6. Make theme tokens and system/light/dark behaviour real if the UI needs theme selection; current LFI says stored theme choice is not applied.
7. Verify icons, splash assets and the design demo on the emulator.
8. Verify no private data or tokens are logged. LFI currently identifies push-token logging and swallowed AsyncStorage errors as gaps; review notification scope before retaining unrelated permission prompts.

**Exit criteria:** project startup, error display, styling, form validation, tests and emulator development loop are stable before feature code multiplies.

## 9. Phase 5 — Shopping lists and items

Implement the first full feature because it establishes the primary navigation and CRUD pattern.

Build in this order:

1. List repository operations and tests.
2. List/item domain validation.
3. List overview: loading, empty, populated, search/filter if required.
4. Create and rename list.
5. List detail and item ordering.
6. Add/edit/delete an item.
7. Checked/unchecked state, desired quantity/unit, notes.
8. Archive/delete with confirmation and explicit child-item behavior.
9. Persistence verification after navigation and app restart.

Test empty names, long names, duplicate names according to the policy, invalid quantities, repeated taps and failure recovery.

**Exit criteria:** all list and item operations work offline, state survives restart, and no UI action is a no-op.

## 10. Phase 6 — Independent personal Shop Directory

The shop directory must work independently of purchases. It is a private, on-device directory, not merchant registration.

Build in this order:

1. Shop repository, validation and tests.
2. Directory list and empty state.
3. Add a shop without a purchase.
4. Detail view.
5. Edit name/contact/address/notes/category.
6. Search/filter if needed.
7. Archive/delete policy for shops referenced by purchase history.
8. Optional navigation from a purchase form to create a shop without losing the draft purchase.
9. Verify shop data persists offline and never sends to a remote service.

Do not label this as EarnSetu merchant registration, public listing, merchant verification, or partner onboarding.

**Exit criteria:** a shop can exist with zero purchases; a purchase can exist with zero shops.

## 11. Phase 7 — Purchases and history

Implement purchase recording only after the list/shop data boundaries are stable.

1. Purchase repository + transaction-bound save of purchase and child items.
2. Purchase form and validation.
3. Add/remove multiple items.
4. Actual quantity and unit, optional prices, notes, purchased date/time.
5. Calculate displayed totals from valid line totals and persist a documented minor-unit representation.
6. Optionally choose a directory shop; allow no shop.
7. Prevent duplicate saves.
8. Implement chronological history, search/filter and detail view.
9. Preserve purchase item snapshots.
10. Define explicit edit/delete/void semantics and historical integrity.
11. Link shop detail to associated purchases, if included in accepted scope.
12. Tests for totals, partial quantities, unknown prices, no shop, atomic writes and history.

Never equate checked list items with purchases. The user must explicitly record what was actually bought, including cases where actual quantity differs from the planned quantity.

**Exit criteria:** recording a purchase does not mutate the planning list unexpectedly, and persisted history remains accurate after later shop/list edits.

## 12. Phase 8 — Home dashboard and cross-feature integration

Only after the underlying repositories and features work:

- Show useful list status/counts.
- Show recent purchases and totals only when the calculations are defined.
- Add quick actions to create a list, record a purchase, or add a shop.
- Wire typed navigation from list → purchase workflow, purchase → shop and shop → purchase history.
- Verify back behaviour, tab state, empty states and loading/error transitions.
- Match the supplied HTML demo without introducing a competing design system.

**Exit criteria:** all primary flows can be completed without dead ends or data loss.

## 13. Phase 9 — Backup, export and recovery

Define a versioned backup format, then implement:

- Export user-selected/all data safely.
- Handle files/storage permissions and sharing.
- Include schema/format version and timestamps.
- Validate imports before mutation.
- Prefer transaction-based all-or-nothing import or a clearly defined partial import contract.
- Detect duplicate IDs and unknown schema versions.
- Provide useful error messages and recovery guidance.
- Test export → clean test install/import → compare record counts and relationships.

A backup is not cloud synchronization. Document that uninstalling the app or losing the device can lose local data if no separate export/backup exists.

## 14. Phase 10 — Quality, privacy and edge cases

Check the failure map in `.workspace/LFI/ERROR_PATHS.md` for known patterns, then build equivalents for new modules.

Required tests include:
- blank/whitespace names, long labels, duplicate submissions;
- zero/negative/fractional/large quantities and unknown prices;
- shop missing/archived/deleted with historical purchases;
- list archived/deleted with child items;
- database unavailable, migration failure, disk/storage failure;
- app interrupted while writing;
- rapid repeated save taps;
- timezone/date boundary display;
- empty search/results and empty database;
- offline use with network disabled;
- export/import mismatch and malformed backup.

Use fake/test data, never real personal data in reports. Never log secrets, tokens, or private shop/contact fields.

## 15. Phase 11 — Release readiness

Do not begin production release tasks while main user flows are still placeholders.

Then:
1. Verify package identity, icons, splash and display name.
2. Configure dev and production build profiles intentionally.
3. Create/verify EAS registration under the confirmed owner; never guess project IDs.
4. Validate clean install and upgrade/install paths.
5. Run CI, test suite, Expo Doctor, lint and typecheck.
6. Test on actual emulator/device, including a fresh install and restart.
7. Document backup/data-loss and privacy limitations.
8. Keep auth/backend/sync deferred until the parent provides approved Basket-facing contracts.

## 16. Keeping PRI and LFI correct as you build

### Update PRI whenever structure changes

When you add/move/remove modules:
- update the entry points/source map and config/docs map in `.workspace/PRI/PROJECT_REFERENCE_INDEX.md`;
- list new domain/data repositories and tests;
- remove entries that no longer match actual files;
- keep the index structural, not an explanation of business rules.

### Update LFI whenever behaviour changes

When a feature adds a real user journey:
- allocate the next stable flow ID in `.workspace/LFI/LOGIC_FLOW_INDEX.md`;
- document trigger, ordered steps, state reads/writes, persistence, navigation destinations and errors;
- update `COMPONENT_INTERACTIONS.md` with provider/repository/component relationships;
- update `DIAGRAMS.md` when the flow/sequence/architecture materially changes;
- update `ERROR_PATHS.md` for new failures/recovery paths;
- mark flows as not implemented/partial rather than omitting planned functions.

Do not write LFI as a desired design before code exists. If a proposed flow is useful, clearly mark it PROPOSED, then change it to verified after implementation/testing.

### Update feature status and docs

After each vertical slice:
- update `docs/FEATURE_STATUS.md` with status + code/test evidence;
- update the relevant architecture/data/setup/testing docs;
- update `CHANGELOG.md` for meaningful structural or behaviour changes;
- update `docs/README.md` if docs were added or moved;
- update `REPORT_INDEX.md` if you create a report under `.workspace/reports/`.

## 17. Recommended slice size and personal workflow

As the developer, work in small, finished slices. For each slice:

1. Read related PRI + LFI flow + architecture/doc/ADR.
2. Write down the exact user-visible acceptance criteria.
3. Change only one coherent slice.
4. Run tests, typecheck, lint and Expo Doctor that are relevant.
5. Manually exercise the journey in the emulator.
6. Inspect the diff and ensure no unrelated changes.
7. Update PRI/LFI/docs/feature status with evidence.
8. Commit only when your own gates pass, using a clear conventional commit.
9. Move to the next slice only after the previous slice is stable.

Suggested commits:
- `chore(setup): stabilize Expo base and design tokens`
- `docs(architecture): accept local data and domain decisions`
- `feat(database): add versioned SQLite foundation`
- `feat(lists): implement offline list and item workflows`
- `feat(shops): add personal local shop directory`
- `feat(purchases): record purchases and history`
- `feat(home): integrate dashboard and quick actions`
- `test(core): cover migrations and critical workflows`
- `docs(project): align PRI LFI feature status and setup guides`

These are examples, not mandatory commits. Only commit changes after validating them yourself.

## 18. Per-slice checklist

- [ ] Read PRI + relevant LFI flow + docs + ADR.
- [ ] Confirm the task is in product scope.
- [ ] Any architectural decision is accepted and indexed.
- [ ] Domain types and validation are explicit.
- [ ] Storage/repository logic stays out of presentation components.
- [ ] Loading, empty, error, retry and destructive confirmation states exist where relevant.
- [ ] Tests cover changed logic and failures.
- [ ] Typecheck, lint, Expo Doctor pass.
- [ ] Emulator/device flow was actually exercised or marked not tested.
- [ ] Code diff contains no accidental unrelated work.
- [ ] PRI updated for structure.
- [ ] LFI updated for verified behaviour and error paths.
- [ ] Feature status and related docs updated.
- [ ] Changelog/report index updated where applicable.

## 19. Non-negotiable boundaries

- Standalone Expo child app, stack-aligned with EarnSetu mobile; do not turn it into a parent-repo submodule without reversing ADR-0002 deliberately.
- React Navigation v7 with typed routes is accepted by ADR-0003; do not change to Expo Router casually.
- NativeWind v4 + Tailwind CSS v3 is the existing setup; respect ADR-0001's exact `react-native-css-interop` pin and the ESLint parser pin in ADR-0004.
- Add SDK-dependent packages with `npx expo install`.
- Do not claim a feature is working because a screen exists.
- No Basket API/auth/sync contract currently exists: do not invent one.
- Keep the local shop directory distinct from official merchant registration.
- Never treat a checked planned item as proof of purchase.
- Preserve all existing data and uncommitted work.
- Tests and emulator verification must be reported truthfully.

## 20. Source references

- Repository: https://github.com/coderooz/earnsetu-basket
- [README](https://github.com/coderooz/earnsetu-basket/blob/master/README.md)
- [AGENTS.md](https://github.com/coderooz/earnsetu-basket/blob/master/AGENTS.md)
- [PRI](https://github.com/coderooz/earnsetu-basket/blob/master/.workspace/PRI/PROJECT_REFERENCE_INDEX.md)
- [LFI index](https://github.com/coderooz/earnsetu-basket/blob/master/.workspace/LFI/LOGIC_FLOW_INDEX.md)
- [LFI component interactions](https://github.com/coderooz/earnsetu-basket/blob/master/.workspace/LFI/COMPONENT_INTERACTIONS.md)
- [LFI diagrams](https://github.com/coderooz/earnsetu-basket/blob/master/.workspace/LFI/DIAGRAMS.md)
- [LFI error paths](https://github.com/coderooz/earnsetu-basket/blob/master/.workspace/LFI/ERROR_PATHS.md)
- [Architecture](https://github.com/coderooz/earnsetu-basket/blob/master/docs/ARCHITECTURE.md)
- [Feature status](https://github.com/coderooz/earnsetu-basket/blob/master/docs/FEATURE_STATUS.md)
- [Data model](https://github.com/coderooz/earnsetu-basket/blob/master/docs/DATA_MODEL.md)
- [Database & migrations](https://github.com/coderooz/earnsetu-basket/blob/master/docs/DATABASE_AND_MIGRATIONS.md)
- [Development setup](https://github.com/coderooz/earnsetu-basket/blob/master/docs/DEVELOPMENT_SETUP.md)
- [Testing strategy](https://github.com/coderooz/earnsetu-basket/blob/master/docs/testing/TEST_STRATEGY.md)
- [ADR index](https://github.com/coderooz/earnsetu-basket/blob/master/docs/decisions/README.md)
- [ADR-0002: standalone child app](https://github.com/coderooz/earnsetu-basket/blob/master/docs/decisions/ADR-0002_basket-as-earnsetu-child-app.md)
- [ADR-0003: navigation](https://github.com/coderooz/earnsetu-basket/blob/master/docs/decisions/ADR-0003_navigation-structure.md)
