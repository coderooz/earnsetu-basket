# Testing — EarnSetu Basket

> **Status: NO TESTS EXIST.** There is no test framework, no test files, and no test script.
> CI exists (`.github/workflows/ci.yml`) for static checks only.

## 1. Verified current state

| Concern | Reality |
|---------|---------|
| Test runner | **None** (no Jest/Vitest config; no `test` script) |
| Test files | **None** (`*.test.*` / `*.spec.*` absent) |
| Coverage | **None** |
| CI | **Basic** — `.github/workflows/ci.yml` runs typecheck + `expo-doctor` + lint (required) and Prettier (non-blocking) |
| E2E | **None** |

Evidence: absence of test config/deps and test files; `package.json` has no `test` script.

## 2. What *can* be validated today

Static checks (local via `.vscode/tasks.json` → **Ctrl+Shift+B** = `validate`, and in CI):

| Command | Purpose | Last observed |
|---------|---------|---------------|
| `npx tsc --noEmit` | type check | ✅ Pass |
| `npx expo-doctor` | config/dependency health | ✅ 21/21 |
| `npm run lint` | lint | ✅ Pass — 0 problems |
| `npx prettier --check .` | formatting | ⚠️ Advisory (not yet enforced) |

No dynamic/runtime tests have been executed. Runtime behaviour of the navigation flows is
**unverified**.

### Continuous integration

`.github/workflows/ci.yml` runs on push/PR to `master`/`main`:

- **Required:** `tsc --noEmit`, `expo-doctor`.
- **Non-blocking:** `npm run lint` (now passing) and `npx prettier --check .`. Consider
  promoting lint to **required** now that the parser issue is resolved
  ([ADR-0004](decisions/ADR-0004_eslint-parser-hoist.md)).

The workflow uses `npm ci --ignore-scripts` so CI validates rather than mutates
dependencies.

## 3. Proposed test strategy (NOT implemented)

See [`testing/TEST_STRATEGY.md`](testing/TEST_STRATEGY.md). Summary:

- **Unit tests** for `src/lib/*` (storage wrapper, utils) and future domain logic.
- **Component tests** with `@testing-library/react-native` for shared UI.
- **Integration tests** for navigation flows.
- **Offline/sync tests** once a data layer exists ([`testing/OFFLINE_TESTING.md`](testing/OFFLINE_TESTING.md)).
- **Migration tests** once a database exists.
- **Authorization tests** once auth exists.

Recommended tooling (to be added via an approved task): Jest + `jest-expo` preset +
`@testing-library/react-native`. Do not add test tooling as part of documentation.

## 4. Coverage map

[`testing/TEST_COVERAGE_MAP.md`](testing/TEST_COVERAGE_MAP.md) lists units and their current
coverage (all **0%** — nothing tested).

## 5. Definition of "tested" (to adopt)

A change is not done until:

- `tsc --noEmit` passes;
- `expo-doctor` passes;
- new/changed logic has unit tests (once a runner exists);
- `npm run lint` passes (0 problems).

## Related documents

- [`testing/TEST_STRATEGY.md`](testing/TEST_STRATEGY.md)
- [`testing/TEST_COVERAGE_MAP.md`](testing/TEST_COVERAGE_MAP.md)
- [`testing/OFFLINE_TESTING.md`](testing/OFFLINE_TESTING.md)
