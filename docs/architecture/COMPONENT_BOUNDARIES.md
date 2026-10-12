# Component Boundaries — EarnSetu Basket

Responsibilities and boundaries of the components that exist today. "Boundary" here means
*what a component should and should not own*.

## Provider layer

| Component | Owns | Does not own |
|-----------|------|--------------|
| `AppProvider` | Composing app-wide providers + `NavigationContainer` | Business logic |
| `ThemeProvider` | Theme value/context | Persisting theme preference (toggle is a stub) |
| `UserProvider` | Current user state (mock) | Authentication (no real auth) |
| `AlertProvider` *(empty)* | — (planned: alert UI) | — |
| `ToastProvider` *(empty)* | — (planned: toast UI) | — |

## Navigation layer

| Component | Owns | Does not own |
|-----------|------|--------------|
| `OnBoardingNavigation` | Root gate: onboarding vs auth/app | Auth logic |
| `AuthNavigation` | Auth stack (login/signup + forgot password) | Credential validation |
| `AppNavigation` | Authenticated shell — bottom tabs | Domain state |
| `Home/Purchase/Profile/SettingsNavigation` | Per-tab stacks for their section | Cross-section domain state |
| `SplashNavigation` *(empty)* | — (superseded) | — |

## Screen layer

| Screen | Owns | Does not own |
|--------|------|--------------|
| `OnboardingScreen` | 3-page tour UI; sets launch flag | Real onboarding content |
| `AuthScreen` / `ForgotPasswordScreen` | Render auth forms | Real authentication |
| `HomeScreen` / `PurchaseScreen` / `ProductItemScreen` / `ProfileScreen` | Section placeholder UI | Lists/items/purchase domain |
| `SettingScreen` + settings sub-screens | Settings hub and sub-screens | Real settings persistence |

## Component layer (`src/components`)

`Header`, `Loading`, `Button`, `LoginForm`, `SignupForm` — presentational, reusable,
minimal. They must not contain domain logic or data access.

## Library layer (`src/lib`)

| Module | Owns | Does not own |
|--------|------|--------------|
| `storage.ts` | `AsyncStorage` get/set/update/remove/clear | Domain persistence/schema |
| `utils.ts` | Small pure helpers | State or I/O |
| `connectDb.ts` *(empty)* | — (planned DB connection) | — |
| `fetchData.ts` *(empty)* | — (planned data access) | — |

## Intended domain layer (does not exist)

A future domain layer should own: shopping lists, items, purchases, and their rules. It
must not own UI, navigation, or presentation. A data-access layer (local DB, later remote)
should sit beneath it. This is **proposed**, not built.

## Boundary rules

- Screens compose; they do not perform data access directly.
- `lib` holds non-UI logic; `components` holds presentational UI.
- Providers own app-wide state; they should not own domain rules.
- No component may import native/platform modules directly if a shared wrapper exists.

## Related documents

- [`../REPOSITORY_STRUCTURE.md`](../REPOSITORY_STRUCTURE.md)
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
