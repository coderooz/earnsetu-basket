# Test Strategy — EarnSetu Basket

> **Status: PROPOSED.** No test infrastructure exists yet
> ([`../TESTING.md`](../TESTING.md)). This is the strategy to adopt.

## Goals

- Prevent regressions as the (currently absent) domain is built.
- Give confidence in offline data integrity and sync correctness.
- Keep the feedback loop fast enough for local development.

## Test levels

| Level | Scope | Tooling (proposed) | When |
|-------|-------|--------------------|------|
| Static | Types, lint, config | `tsc --noEmit`, `expo-doctor`, ESLint | Every change |
| Unit | `src/lib/*`, pure domain logic | Jest (`jest-expo`) | Every change |
| Component | Shared UI components | `@testing-library/react-native` | Every change |
| Integration | Navigation flows, contexts | RTL + mocked deps | Feature work |
| Offline/sync | Local store + sync engine | Jest + fake storage/network | Once data layer exists |
| Migration | DB migrations | Jest + temp DB | Once DB exists |
| Authorization | Ownership enforcement | Integration + server mocks | Once auth exists |
| E2E (optional) | Critical journeys | Maestro / Detox (later) | Pre-release |

## Priority order (when tooling is added)

1. Unit tests for `src/lib/storage.ts` and `src/lib/utils.ts`.
2. A smoke test that the app renders and the navigation skeleton works.
3. Domain logic tests as features land.
4. Offline/sync and migration tests with the data layer.
5. Auth/authorization tests with real auth integration.

## Conventions

- Co-locate tests (`*.test.ts(x)`) or use a `__tests__/` folder — decide once and keep it.
- Test behaviour, not implementation details.
- Mock the platform boundaries (notifications, storage, network); do not mock the code
  under test.
- Never assert on secrets or real network calls.

## Tooling to add (requires an approved task, not part of docs)

| Package | Purpose |
|---------|---------|
| `jest` + `jest-expo` | Runner + Expo preset |
| `@testing-library/react-native` | Component/interaction tests |
| `@testing-library/jest-native` (optional) | Extra matchers |

Add scripts (`test`, `test:watch`, `test:coverage`) and wire CI at the same time.

## Definition of done (per change)

- `tsc --noEmit` and `npm run lint` pass; `expo-doctor` passes.
- New logic has unit tests (once a runner exists).
- Changed behaviour is covered or explicitly noted as a gap.

## Related documents

- [`../TESTING.md`](../TESTING.md)
- [`TEST_COVERAGE_MAP.md`](TEST_COVERAGE_MAP.md)
- [`OFFLINE_TESTING.md`](OFFLINE_TESTING.md)
