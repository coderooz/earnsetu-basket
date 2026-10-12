# Project Reference Index (PRI) — EarnSetu Basket

> **Kind:** Committed project reference system (structural).
> **Authority:** Navigational aid. The **filesystem is the source of truth**; if this index
> and the code disagree, the code wins and this file must be corrected.
> **Companion:** `.workspace/LFI/` (behavioural reference index).

## 1. Purpose

Give humans and AI agents a fast, accurate map of where things live, so that work can start
without re-scanning the repository. This is **structure only** — behaviour lives in the LFI
and rationale in `docs/`.

## 2. Project identity

| Field | Value |
|-------|-------|
| Name | EarnSetu Basket |
| Ecosystem | EarnSetu (parent) — repo `coderooz/EarnSetu`, local `../../website/LocalCart` |
| Type | Expo / React Native mobile app (shopping list + purchase recording) |
| Status | Prototype / pre-alpha scaffold |
| Package manager | npm (`package-lock.json`) |
| Expo SDK | 57 |
| Navigation | React Navigation v7 (bottom tabs + per-tab stacks) — **not** Expo Router |
| Styling | NativeWind + Tailwind v3 |

## 3. Entry points

| Path | Role |
|------|------|
| `index.ts` | App entry — imports `global.css`, `registerRootComponent(App)` |
| `App.tsx` | Root component — notification permission effect, wraps `AppProvider` |
| `src/context/AppProvider.tsx` | Composes Theme + User providers + `NavigationContainer` |
| `src/navigation/OnBoardingNavigation.tsx` | Root gate — resolves onboarding vs auth/app on launch |
| `src/navigation/AppNavigation.tsx` | Authenticated shell — bottom tabs (`HomeTab`, `PurchaseTab`, `ProfileTab`, `SettingsTab`) |
| `app.json` | Expo app configuration |
| `package.json` | Scripts, dependencies, metadata |
| `tsconfig.json` | TypeScript config (`@/*` → `./src/*`) |

## 4. Source map (`src/`)

| Path | Responsibility |
|------|----------------|
| `src/components/` | Presentational UI (`Header`, `Loading`, `items/Button`, `auth/*`) + structural primitives (`common/ScreenContainer`, `common/SectionCard`, `common/SettingRow`, `common/EmptyState`) |
| `src/context/` | App-wide state (`AppProvider`, `ThemeProvider`, `UserProvider`; `AlertProvider`/`ToastProvider` are **empty**) |
| `src/hooks/` | `UserHook` (`useUserContext`), `useStorage` |
| `src/lib/` | Non-UI logic (`storage.ts`, `utils.ts`; `connectDb.ts`/`fetchData.ts` are **empty**) |
| `src/navigation/` | Param types (`types.ts`) + navigators: root gate (`OnBoardingNavigation`), auth gate (`AuthNavigation`), bottom tabs (`AppNavigation`), and per-tab stacks (`HomeNavigation`, `PurchaseNavigation`, `ProfileNavigation`, `SettingsNavigation`); `SplashNavigation` is **empty** |
| `src/screens/` | 19 routed screen skeletons (+ retained `SplashScreen`) — onboarding, auth, home, purchase, product item, profile, settings + legal/policy. See §4a. |
| `src/types/` | Ambient types (`global.d.ts` — `*.css`) + unreferenced purchase-type draft (`purchase.types.ts`, imported nowhere — WIP) |

### 4a. Screen inventory (`src/screens/`)

| Screen | Stack | Status |
|--------|-------|--------|
| `OnboardingScreen` | Root (`Onboarding`) | Skeleton (paged tour) |
| `AuthScreen`, `ForgotPasswordScreen` | Auth | Skeleton (mock submit) |
| `HomeScreen` | Home | Skeleton |
| `ProductItemScreen` | Home + Purchase | Skeleton |
| `PurchaseScreen`, `PurchaseDetailScreen`, `RecordPurchaseScreen` | Purchase | Skeleton |
| `ProfileScreen`, `EditProfileScreen` | Profile | Skeleton |
| `SettingScreen`, `AccountScreen`, `AppearanceScreen`, `NotificationSettingsScreen`, `HelpScreen`, `AboutScreen`, `TermsScreen`, `PrivacyScreen`, `LicensesScreen` | Settings | Skeleton |
| `SplashScreen` | — | Superseded by `OnboardingScreen` (file retained) |

## 5. Configuration & tooling

| Path | Purpose |
|------|---------|
| `babel.config.js` | Babel preset + NativeWind + Reanimated plugin |
| `metro.config.js` | Metro + NativeWind |
| `tailwind.config.js`, `postcss.config.js` | Tailwind v3 |
| `global.css` | Tailwind entry stylesheet |
| `eslint.config.js` | Flat ESLint config (extends `eslint-config-expo`) |
| `.editorconfig`, `.gitattributes`, `.prettierrc`, `.prettierignore`, `.nvmrc` | Editor/repo conventions |
| `.vscode/` | Shared editor settings, extensions, debug, tasks |
| `.idea/` | Android Studio shared code style + inspection profiles (per-user files ignored) |
| `.github/` | CI, Dependabot, templates, CODEOWNERS, community files, banner |

## 6. Documentation map

| Area | Document |
|------|----------|
| Index | `docs/README.md` |
| Product | `docs/PROJECT_OVERVIEW.md`, `PRODUCT_SCOPE.md`, `FEATURE_STATUS.md`, `ROADMAP.md`, `GLOSSARY.md`, `KNOWN_LIMITATIONS.md` |
| Architecture | `docs/ARCHITECTURE.md`, `REPOSITORY_STRUCTURE.md`, `TECH_STACK.md`, `docs/architecture/*` |
| Development | `docs/DEVELOPMENT_SETUP.md`, `CONFIGURATION.md`, `ENVIRONMENT_VARIABLES.md`, `docs/development/*` |
| Data/domain | `docs/DATA_MODEL.md`, `DATABASE_AND_MIGRATIONS.md`, `OFFLINE_FIRST.md`, `SYNCHRONIZATION.md`, `API_INTEGRATION.md`, `AUTHENTICATION.md` |
| Quality/ops | `docs/TESTING.md`, `docs/testing/*`, `BUILD_AND_RELEASE.md`, `ERROR_HANDLING.md`, `SECURITY_AND_PRIVACY.md`, `TROUBLESHOOTING.md` |
| Decisions | `docs/decisions/README.md`, `ADR_TEMPLATE.md` |
| Agent rules | `AGENTS.md`, `CONTRIBUTING.md`, `SECURITY.md`, `CHANGELOG.md` |

## 7. Governance

| Path | Purpose |
|------|---------|
| `.workspace/PRI/` | This index (committed) |
| `.workspace/LFI/` | Behavioural flows (committed) |
| `.workspace/reports/` | Operational reports (not committed) |
| `REPORT_INDEX.md` | Index of reports |

## 8. Stable anchor references (for agents)

- App boot chain: `index.ts` → `App.tsx` → `src/context/AppProvider.tsx` → `src/navigation/OnBoardingNavigation.tsx`.
- Storage seam: `src/lib/storage.ts` ↔ `src/hooks/useStorage.ts`.
- User state seam: `src/context/UserProvider.tsx` ↔ `src/hooks/UserHook.ts`.
- Styling seam: `global.css` + `tailwind.config.js` + NativeWind (`className`).
- Navigation param seam: `src/navigation/types.ts` (param lists + `*Nav` prop types).

## 9. Maintenance rules

- Update this index when files are added, moved, or removed.
- Never store behaviour or rationale here — link to `docs/` or the LFI.
- Keep entries accurate; unsupported entries must be removed.
- This file is **committed** (see `.gitignore` carve-out for `.workspace/PRI/`).

## 10. Known gaps

- Parent EarnSetu exists (`coderooz/EarnSetu`; Expo 57 mobile + Next.js website), but no Basket-facing integration contract is defined (see `docs/architecture/INTEGRATION_BOUNDARIES.md`).
- Five source files are empty placeholders (documented in `docs/REPOSITORY_STRUCTURE.md`).
- All 20 screen files (19 routed + retained `SplashScreen`) are **structural skeletons** — navigation is wired, but there is no design, no domain data, and no backend (see `docs/FEATURE_STATUS.md`).
