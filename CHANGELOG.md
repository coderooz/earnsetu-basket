# Changelog

All notable changes to **EarnSetu Basket** are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project intends to follow [Semantic Versioning](https://semver.org/) once it
reaches a releaseable state.

> **Note:** This changelog was initialised during a repository documentation pass. It
> records only changes that can be evidenced from the repository and its history. It does
> **not** invent history that cannot be verified.

## [Unreleased]

### Added
- Initial repository scaffold (Expo + TypeScript + NativeWind template:
  `create-expo` / `expo-template-coderooz` foundation).
- React Navigation stack skeleton: onboarding → auth → app flows.
- Placeholder screens: `SplashScreen`, `AuthScreen` (login/signup UI stubs),
  `HomeScreen`, `SettingScreen`.
- `AppProvider` composing `ThemeProvider`, `UserProvider`, and `NavigationContainer`.
- `UserProvider` context and `useUserContext` hook.
- `storage` utility wrapping `@react-native-async-storage/async-storage` and the
  `useStorage` hook.
- `Button`, `Header`, `Loading` shared components; `LoginForm`, `SignupForm` stubs.
- Expo push-notification permission request and token logging in `App.tsx`.
- Project documentation foundation (`docs/`, governance reference systems under
  `.workspace/`).
- Full screen scaffold (structural skeletons — no design/data): `OnboardingScreen`,
  `ForgotPasswordScreen`, `HomeScreen`, `ProductItemScreen`, `PurchaseScreen`,
  `PurchaseDetailScreen`, `RecordPurchaseScreen`, `ProfileScreen`, `EditProfileScreen`,
  `SettingScreen`, `AccountScreen`, `AppearanceScreen`, `NotificationSettingsScreen`,
  `HelpScreen`, `AboutScreen`, `TermsScreen`, `PrivacyScreen`, `LicensesScreen`.
- Bottom-tab navigation with per-tab stacks and **typed** param lists
  (`src/navigation/types.ts`; `Home`/`Purchase`/`Profile`/`Settings` navigators) —
  [ADR-0003](docs/decisions/ADR-0003_navigation-structure.md).
- Structural UI primitives: `common/ScreenContainer`, `common/SectionCard`,
  `common/SettingRow`, `common/EmptyState`.
- `@typescript-eslint/parser` devDependency (hoisted) so ESLint can parse TypeScript
  ([ADR-0004](docs/decisions/ADR-0004_eslint-parser-hoist.md)).

### Changed
- Added `android.package` and `ios.bundleIdentifier` (`com.coderooz.earnsetubasket`) to
  `app.json` — required for development/native builds.
- Aligned dependencies to Expo SDK 57 via `expo install --fix`.
- Tailwind CSS pinned to v3 (`^3.4.19`) for NativeWind v4 compatibility.
- `app.json` updated to the SDK 57 config schema (splash moved to the
  `expo-splash-screen` plugin; removed obsolete keys).
- `tsconfig.json` migrated off deprecated `baseUrl` for TypeScript 6 compatibility.
- Corrected the ecosystem documentation: the parent **EarnSetu** platform exists
  (`coderooz/EarnSetu`; Expo SDK 57 mobile + Next.js website) — the missing piece is a
  **Basket-facing** contract. Added
  [ADR-0002](docs/decisions/ADR-0002_basket-as-earnsetu-child-app.md).
- Onboarding now uses `OnboardingScreen` (3-page tour) instead of `SplashScreen`; the
  `hasLaunched` flag is written through the `storage` wrapper (read and write are now both
  JSON-consistent). `SplashScreen.tsx` is retained but no longer routed.
- The debug "clean logs" action moved from `HomeScreen` to Settings → Developer →
  "Clear local data" (behaviour and effect unchanged).
- Shared header settings icon now targets the `SettingsTab`; `LoginForm`'s "Forgot
  Password?" now opens `ForgotPassword`.
- CI now enforces lint: removed `continue-on-error` from the Lint step in
  `.github/workflows/ci.yml` (the resolver issue is fixed — ADR-0004). Prettier remains
  advisory.
- `nativewind-env.d.ts` (generated) is now gitignored.
- The default `validate` VS Code task now runs typecheck + `expo-doctor` + lint.

### Fixed
- TypeScript 6 `TS2882` on CSS side-effect import (added ambient `*.css` declaration).
- `expo-doctor` config-schema and missing-peer-dependency issues.
- Metro bundling failure `Unable to resolve "react-native-css-interop/jsx-runtime"` — npm
  nested the NativeWind v4 runtime; it is now pinned as an exact direct dependency
  ([ADR-0001](docs/decisions/ADR-0001_nativewind-runtime-dependency-pin.md)).
- ESLint parse errors (`Cannot find module '@typescript-eslint/parser'`) — the parser is now
  a hoisted direct devDependency ([ADR-0004](docs/decisions/ADR-0004_eslint-parser-hoist.md));
  `npx eslint .` passes with 0 errors / 0 warnings.
- Corrected stale onboarding references: `AGENTS.md`, `README.md` (status table, stack
  table, build & release), `docs/TESTING.md`, `docs/TECH_STACK.md`, `docs/ROADMAP.md`, and
  `KNOWN_LIMITATIONS.md` (KL-10) now describe the passing lint, the existing CI, the set
  app identifiers, and the bottom-tab navigation.

### Known issues
- No lint failure remains (`npx eslint .` passes). Remaining tracked limitations are listed
  in [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md).

## [1.0.0] — Repository baseline

- Initial commit of the Expo scaffold (`cf84dfe`, "Initial commit").
