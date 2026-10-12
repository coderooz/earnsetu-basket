# Feature Status — EarnSetu Basket

> **Last verified:** 2026-10-11 (repository inspection + `tsc`/`expo-doctor`/`expo export`).
> **Method:** direct inspection of source files, `package.json`, `app.json`, and config;
> `npx tsc --noEmit`, `npx expo-doctor`, and `npx expo export --platform android` all pass.
> **Rule:** a feature is only `IMPLEMENTED` when functioning code supports it. A screen,
> stub, `TODO`, or mock is **not** proof of implementation. Screen *structure* (routing) can
> be `IMPLEMENTED` even when the feature it will host is not.

Legend: `IMPLEMENTED` · `PARTIALLY_IMPLEMENTED` · `NOT_IMPLEMENTED` · `BLOCKED` ·
`NOT_APPLICABLE` · `UNVERIFIED`.

## Summary

| Status | Count |
|--------|-------|
| `IMPLEMENTED` | 0 domain features; 6 scaffold capabilities |
| `PARTIALLY_IMPLEMENTED` | 4 (scaffold-level) |
| `NOT_IMPLEMENTED` | 17 (all domain features) |
| `UNVERIFIED` | 0 marked (runtime on-device still unverified — see below) |

## Scaffold-level capabilities

| ID | Feature | Status | Evidence | Notes |
|----|---------|--------|----------|-------|
| SCAF-01 | App bootstrap | `IMPLEMENTED` | `index.ts`, `App.tsx` | `registerRootComponent(App)` |
| SCAF-02 | Provider composition | `IMPLEMENTED` | `src/context/AppProvider.tsx` | Theme + User + NavigationContainer |
| SCAF-03 | Navigation (routing) | `IMPLEMENTED` | `src/navigation/*` (incl. `types.ts`) | Root gate + auth gate + bottom tabs with per-tab stacks; **typed** params — [ADR-0003](decisions/ADR-0003_navigation-structure.md). No deep linking |
| SCAF-04 | Onboarding | `IMPLEMENTED` (UI) | `src/screens/OnboardingScreen.tsx` | 3-page first-launch tour; persists `hasLaunched` via the `storage` wrapper |
| SCAF-05 | Auth UI | `PARTIALLY_IMPLEMENTED` | `src/screens/AuthScreen.tsx`, `src/screens/ForgotPasswordScreen.tsx`, `src/components/auth/*` | Mock submit fabricates user; no provider; forgot-password is UI-only |
| SCAF-06 | Local storage helper | `PARTIALLY_IMPLEMENTED` | `src/lib/storage.ts`, `src/hooks/useStorage.ts` | `AsyncStorage` wrapper; `get/set/update/remove/clear` |
| SCAF-07 | Push notification request | `PARTIALLY_IMPLEMENTED` | `App.tsx` | Requests permission + logs Expo push token |
| SCAF-08 | Shared components | `IMPLEMENTED` | `src/components/*` (incl. `common/*`) | `Header`, `Loading`, `Button`, auth forms, and `ScreenContainer`/`SectionCard`/`SettingRow`/`EmptyState`; yet untested |
| SCAF-09 | Theming | `PARTIALLY_IMPLEMENTED` | `src/context/ThemeProvider.tsx` | `toggleTheme` is a stub (`return null`); `AppearanceScreen` writes `userData.theme`, which nothing applies |
| SCAF-10 | Screen inventory | `IMPLEMENTED` (structure) | `src/screens/*` | 19 routed screen skeletons (+ retained `SplashScreen`); routes wired, but no design/data |

## Domain features

| ID | Feature | Status | Evidence | Notes |
|----|---------|--------|----------|-------|
| DOM-01 | Shopping-list creation | `NOT_IMPLEMENTED` | — | No list model, store, or UI |
| DOM-02 | Shopping-list management (edit/rename/delete) | `NOT_IMPLEMENTED` | — | — |
| DOM-03 | Item add/edit/delete | `NOT_IMPLEMENTED` | — | — |
| DOM-04 | Item reordering | `NOT_IMPLEMENTED` | — | — |
| DOM-05 | Quantity & unit handling | `NOT_IMPLEMENTED` | — | — |
| DOM-06 | Item notes | `NOT_IMPLEMENTED` | — | — |
| DOM-07 | Item status (to-buy/purchased/etc.) | `NOT_IMPLEMENTED` | — | — |
| DOM-08 | Purchase recording | `NOT_IMPLEMENTED` | — | — |
| DOM-09 | Partial purchases | `NOT_IMPLEMENTED` | — | — |
| DOM-10 | Actual quantity recording | `NOT_IMPLEMENTED` | — | — |
| DOM-11 | Purchase price recording | `NOT_IMPLEMENTED` | — | — |
| DOM-12 | Purchase history | `NOT_IMPLEMENTED` | — | — |
| DOM-13 | Shopping summaries/totals | `NOT_IMPLEMENTED` | — | — |
| DOM-14 | Offline data operation | `NOT_IMPLEMENTED` | — | No persistence beyond AsyncStorage helper |
| DOM-15 | Local SQLite persistence | `NOT_IMPLEMENTED` | `app.json` plugin only | `expo-sqlite` installed but unused (0 code refs) |
| DOM-16 | Sync / conflict handling | `NOT_IMPLEMENTED` | — | — |
| DOM-17 | Customer ownership / auth | `NOT_IMPLEMENTED` | — | No Clerk; mock user only |

## Placeholder files (planned but empty)

These files exist at **0 bytes** and indicate intended work. They are not features.

| File | Apparent intent | Status |
|------|-----------------|--------|
| `src/context/AlertProvider.tsx` | Alert context provider | `NOT_IMPLEMENTED` |
| `src/context/ToastProvider.tsx` | Toast context provider | `NOT_IMPLEMENTED` |
| `src/lib/connectDb.ts` | Database connection module | `NOT_IMPLEMENTED` |
| `src/lib/fetchData.ts` | Data-fetching module | `NOT_IMPLEMENTED` |
| `src/navigation/SplashNavigation.tsx` | Splash navigator | `NOT_IMPLEMENTED` (superseded by `OnBoardingNavigation`) |

## External dependencies for features

| Feature area | Required external dependency | Present? |
|--------------|------------------------------|----------|
| Authentication | EarnSetu auth (Clerk; used by the parent mobile app) | ❌ Not implemented/configured in Basket |
| Backend/API | EarnSetu backend (exists in parent; **no Basket-facing contract**) | ❌ Not consumed by Basket |
| Local DB | `expo-sqlite` | ⚠️ Installed, unused |
| Notifications backend | Expo push service | ⚠️ Token requested; nothing consumes it |

## Not verified

No row above is marked `UNVERIFIED`; however, **runtime behaviour on a device/emulator**
was **not executed** (no emulator/simulator run). Static verification only: `npx tsc
--noEmit` (exit 0), `npx expo-doctor` (21/21), and `npx expo export --platform android`
(bundle exit 0, 1518 modules). Treat on-device navigation, notifications, and the web
target as unverified even though the code is present.
