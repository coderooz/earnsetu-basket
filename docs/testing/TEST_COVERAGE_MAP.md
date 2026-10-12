# Test Coverage Map — EarnSetu Basket

> **All coverage is currently 0% — there are no tests.** This map records the units that
> *should* be tested, and their current state. Update it as tests are added.

## Current state

| Metric | Value |
|--------|-------|
| Test files | 0 |
| Test runner | none |
| Line coverage | 0% (not measured) |
| CI | none |

## Units and intended coverage

| Unit | File | Test type | Current |
|------|------|-----------|---------|
| Storage wrapper | `src/lib/storage.ts` | Unit | ❌ 0% |
| Utility helpers | `src/lib/utils.ts` | Unit | ❌ 0% |
| `useStorage` hook | `src/hooks/useStorage.ts` | Unit (hooks) | ❌ 0% |
| `useUserContext` hook | `src/hooks/UserHook.ts` | Unit (hooks) | ❌ 0% |
| `AppProvider` | `src/context/AppProvider.tsx` | Integration | ❌ 0% |
| `ThemeProvider` | `src/context/ThemeProvider.tsx` | Integration | ❌ 0% |
| `UserProvider` | `src/context/UserProvider.tsx` | Integration | ❌ 0% |
| Navigation (root gate, auth gate, bottom tabs, per-tab stacks) | `src/navigation/*` | Integration | ❌ 0% |
| Screens (onboarding/auth) | `src/screens/{OnboardingScreen,AuthScreen,ForgotPasswordScreen}.tsx` | Component | ❌ 0% |
| Screens (home/purchase/product/profile) | `src/screens/{Home,Purchase,ProductItem,PurchaseDetail,RecordPurchase,Profile,EditProfile}Screen.tsx` | Component | ❌ 0% |
| Screens (settings + legal) | `src/screens/SettingScreen.tsx` + settings sub-screens | Component | ❌ 0% |
| Shared components | `src/components/*` (incl. `common/*`) | Component | ❌ 0% |
| Domain logic | *(none exists)* | Unit | N/A |
| Data layer | *(none exists)* | Integration | N/A |
| Sync engine | *(none exists)* | Integration | N/A |
| Migrations | *(none exist)* | Migration | N/A |
| Auth/authorization | *(none exists)* | Integration | N/A |

## Untestable today

- Runtime behaviour of the app (no runner, no E2E).
- Anything domain-related (feature not implemented).
- Migration/sync/auth (not implemented).

## How to use this map

When adding a test, flip the corresponding row to its coverage and keep this file current.
When adding a new unit, add a row.

## Related documents

- [`../TESTING.md`](../TESTING.md)
- [`TEST_STRATEGY.md`](TEST_STRATEGY.md)
