# ADR-0003: Navigation architecture — bottom tabs with per-tab stacks and typed params

- **Status:** Accepted
- **Date:** 2026-10-11
- **Deciders:** Project maintainer (selected the structure, 2026-10-11); AI agent
  (implementation)
- **Related:** [`../../AGENTS.md`](../../AGENTS.md), [`../ARCHITECTURE.md`](../ARCHITECTURE.md),
  [`../REPOSITORY_STRUCTURE.md`](../REPOSITORY_STRUCTURE.md),
  [`../FEATURE_STATUS.md`](../FEATURE_STATUS.md), `.workspace/LFI/`

## Context

The repository had a three-stack React Navigation skeleton
(`OnBoardingNavigation` → `AuthNavigation` → `AppNavigation`) with only four placeholder
screens (`SplashScreen`, `AuthScreen`, `HomeScreen`, `SettingScreen`) and **untyped**
navigation (`useNavigation<any>()`).

The maintainer asked for **all necessary screens** to be created so that only **design and
backend** work remains: Home, Auth, Onboarding, Settings (plus legal/policy screens such
as licences and policies), Purchase, Product Item, and Profile.

Two structural questions had to be answered: (a) the shape of the authenticated app
(single stack vs tabs vs drawer), and (b) how much typing to introduce. The maintainer
selected **bottom tabs + per-tab stacks**.

## Decision

- The authenticated app uses a **bottom-tab navigator**
  (`@react-navigation/bottom-tabs`, already installed) with four tabs: **Home**,
  **Purchases**, **Profile**, **Settings**.
- **Each tab owns its own stack** (`@react-navigation/stack`), so detail screens
  (Product Item, Purchase Detail, legal pages, …) push within the relevant section rather
  than sharing one global stack.
- Route names and params are **centralised in `src/navigation/types.ts`** as param lists
  (`RootStackParamList`, `AuthStackParamList`, `MainTabParamList`, and the four per-tab
  lists). Screens use typed navigation (`useNavigation<HomeNav>()`, etc.).
- The existing **root gate** (`OnBoardingNavigation`: first launch → onboarding, else auth)
  and **auth gate** (`AuthNavigation`: unauthenticated → auth flow, authenticated → app
  shell) are preserved. Onboarding now uses a dedicated `OnboardingScreen` instead of
  `SplashScreen`.
- Screens are **structural skeletons only**: navigation is fully wired, but **no design
  and no backend/data are implemented**. `TODO(design)` / `TODO(data)` / `TODO(backend)` /
  `TODO(legal)` markers indicate remaining work.

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Single stack | Poor fit for an app with four primary areas; deep flows become awkward and the back stack grows unbounded |
| Drawer + stacks | Heavier than needed for four destinations; bottom tabs are the conventional pattern for this app |
| Expo Router | The project deliberately uses React Navigation (`AGENTS.md`); migrating routers is out of scope and would need its own ADR |
| Keep `useNavigation<any>()` everywhere | Loses route-name/param checking; typed param lists cost little and prevent broken links as screens are designed |

## Consequences

**Positive**
- Every required screen is reachable through wired navigation.
- Route names/params are type-checked; navigation calls fail at compile time if the target
  or params are wrong.
- Each tab can evolve its stack independently as design and features land.
- Consistent with the parent EarnSetu mobile app (React Navigation v7).

**Negative / risks**
- Nested cross-tab navigation (e.g. the shared header settings icon → Settings tab) relies
  on route-name lookup across navigators; route names must stay unique.
- Screens that are registered in two stacks (`ProductItem` in Home and Purchase) are typed
  against one list; params are identical today, and this must be kept in sync.

**Neutral / follow-ups**
- No dependency was added; `@react-navigation/bottom-tabs` was already installed.
- Screens remain placeholders — domain data, persistence, and auth are still
  `NOT_IMPLEMENTED` (see [`../FEATURE_STATUS.md`](../FEATURE_STATUS.md)).

## Compliance & implementation notes

- Added: `src/navigation/types.ts`, `HomeNavigation`, `PurchaseNavigation`,
  `ProfileNavigation`, `SettingsNavigation`; `src/components/common/{ScreenContainer,
  SectionCard,SettingRow,EmptyState}.tsx`; screens `OnboardingScreen`,
  `ForgotPasswordScreen`, `ProductItemScreen`, `PurchaseDetailScreen`,
  `RecordPurchaseScreen`, `ProfileScreen`, `EditProfileScreen`, `AccountScreen`,
  `AppearanceScreen`, `NotificationSettingsScreen`, `HelpScreen`, `AboutScreen`,
  `TermsScreen`, `PrivacyScreen`, `LicensesScreen`.
- Updated: `OnBoardingNavigation`, `AuthNavigation`, `AppNavigation`, `HomeScreen`,
  `PurchaseScreen`, `SettingScreen`, `Header`, `LoginForm` (forgot-password link).
- Verified: `npx tsc --noEmit` (exit 0), `npx expo-doctor` (21/21 checks), and
  `npx expo export --platform android` (bundle exit 0). On-device runtime is still
  unverified (see `docs/KNOWN_LIMITATIONS.md`).
- No dependency, auth, persistence, or data-layer changes are part of this ADR.

## Superseded / supersedes

- Supersedes: None.
- Superseded by: None.
