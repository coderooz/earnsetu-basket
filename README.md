# EarnSetu Basket

<p align="center">
  <img src=".github/assets/banner.svg" alt="EarnSetu Basket" width="100%" />
</p>

[![CI](https://github.com/coderooz/earnsetu-basket/actions/workflows/ci.yml/badge.svg)](https://github.com/coderooz/earnsetu-basket/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Expo SDK 57](https://img.shields.io/badge/Expo-SDK%2057-000020.svg?logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6.svg?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NativeWind](https://img.shields.io/badge/NativeWind%20%C2%B7%20Tailwind-v4%20%C2%B7%20v3-38BDF8.svg)](https://www.nativewind.dev/)
[![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS%20%7C%20web-lightgrey.svg)]()
[![Status](https://img.shields.io/badge/status-prototype%20(pre--alpha)-orange.svg)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**A child/extension app of the [EarnSetu](https://github.com/coderooz/EarnSetu) platform · Status: Prototype (pre-alpha scaffold)**

EarnSetu Basket is a mobile-first application intended to let users organise shopping
lists, track items to purchase, record what was actually purchased, and review their
shopping history. It is an **offline-first** client within the planned EarnSetu
hyperlocal-commerce ecosystem.

> **Important:** This repository is currently an **early prototype**, not a finished
> application. The shopping-list / purchase-recording domain is **not implemented yet**.
> What exists today is an Expo scaffold with generic onboarding, authentication UI
> stubs, and a local-storage wrapper. See [`docs/FEATURE_STATUS.md`](docs/FEATURE_STATUS.md)
> for an evidence-backed feature inventory.

---

## Current status at a glance

| Area | State |
|------|-------|
| Project scaffold (Expo + TypeScript + NativeWind) | ✅ Present |
| Navigation (bottom tabs + per-tab stacks) | ✅ Wired (19 screen skeletons; no design/data) |
| Onboarding | ✅ 3-page first-launch tour (final content TBD) |
| Authentication (login / signup UI) | ⚠️ UI-only stub, mock submit, **no real auth** |
| Shopping list / item / purchase domain | ❌ Not implemented |
| Local persistence (SQLite) | ❌ Not implemented (dependency present, unused) |
| Backend / API integration | ❌ Not implemented |
| Synchronization / offline queue | ❌ Not implemented |
| Tests / CI | ⚠️ No tests; CI runs typecheck + doctor + lint |
| EAS build & release configuration | ❌ None |
| Lint / typecheck health | ✅ All green (`tsc`, `expo-doctor` 21/21, `npm run lint` 0 problems) |

---

## What it is (and is not)

- **Intended purpose:** a personal/household shopping-list and purchase-recording tool.
- **Intended users:** shoppers/customers within the EarnSetu ecosystem (not merchants).
- **Not** a merchant/inventory management app, **not** a marketplace, checkout, payments,
  product-discovery, or online-ordering app. See [`docs/PRODUCT_SCOPE.md`](docs/PRODUCT_SCOPE.md).

The product direction above is **intended** (from the project brief). Only the
scaffold-level functionality listed in [`docs/FEATURE_STATUS.md`](docs/FEATURE_STATUS.md)
is verified as implemented.

---

## Technology stack (verified, installed versions)

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | v24.x (dev machine) |
| Package manager | npm | 12.x (lockfile: `package-lock.json`) |
| Framework | Expo (managed) | SDK 57 (`expo ~57.0.27`) |
| UI runtime | React Native | `0.86.3` |
| UI library | React | `19.2.3` |
| Language | TypeScript (strict) | `~6.0.3` |
| Styling | NativeWind / Tailwind CSS | `^4.2.7` / `^3.4.19` |
| Navigation | React Navigation (stack + bottom tabs) | v7 (`stack ^7.12.0`, `bottom-tabs ^7.20.0`) |
| Local storage | AsyncStorage | `2.2.0` |
| Notifications | expo-notifications | `~57.0.22` |
| Icons | @expo/vector-icons | `^15.1.1` |

Full, evidence-based inventory (including dependencies that are installed but currently
unused): [`docs/TECH_STACK.md`](docs/TECH_STACK.md).

---

## Prerequisites

- **Node.js** 20+ (developed on v24).
- **npm** (uses `package-lock.json`).
- One of:
  - **Android device/emulator** or **iOS simulator** (for native dev builds), or
  - **Expo Go** for the JS-only portions (some native modules will not be available).
- For native builds: Android SDK / Xcode as appropriate. No EAS project is configured.

---

## Installation

```bash
npm install
```

> The `prepare` script runs `expo install --fix`, which aligns dependencies to the
> installed Expo SDK. It requires network access.

---

## Running the app

| Command | Purpose |
|---------|---------|
| `npm start` | Start the Expo dev server |
| `npm run android` | Build & run on Android (`expo run:android`) |
| `npm run ios` | Build & run on iOS (`expo run:ios`) |
| `npm run web` | Run the web target (`expo start --web`) |

These commands are defined in `package.json` and were verified to exist. They were **not
executed end-to-end** during documentation (no emulator/simulator run performed).

---

## Validation commands

| Command | Purpose | Last observed result |
|---------|---------|----------------------|
| `npx tsc --noEmit` | TypeScript type check | ✅ Pass |
| `npx expo-doctor` | Dependency/config health | ✅ 21/21 checks pass |
| `npm run lint` | ESLint (`expo lint`) | ✅ Pass — 0 problems |
| `npx expo install --fix` | Align deps to SDK | ✅ "Dependencies are up to date" |

---

## Environment configuration

No `.env` file or environment variables are currently required or read by the code.
There is **no** `.env.example`. If environment configuration is introduced, follow the
rules in [`docs/ENVIRONMENT_VARIABLES.md`](docs/ENVIRONMENT_VARIABLES.md) — never commit
secrets, and never place server credentials in `EXPO_PUBLIC_*` variables.

---

## High-level architecture

```
index.ts  →  App.tsx  →  <AppProvider>  →  OnBoardingNavigation (root gate)
                                              │
        ┌─────────────────────────────────────┴─────────────────────────────────────┐
        ▼ (first launch)                                                            ▼ (returning)
  OnboardingScreen (3-page tour)                                          AuthNavigation (auth gate)
        │ completes                                                                 │ isAuthenticated?
        └──────────────────────────────►─────────────────────────────────────────────┤
                                        ┌───────────────────────────────────────────┴────────────┐
                                        ▼ (false)                                                ▼ (true)
                            AuthScreen / ForgotPassword                        AppNavigation (bottom tabs)
                                                                                          │
                                     ┌───────────────┬────────────────┬────────────────┴────────┐
                                     ▼               ▼                ▼                        ▼
                              Home stack     Purchase stack    Profile stack          Settings stack
```

The application is a single ReactNative/Expo process. There is currently **no backend**,
**no authentication provider**, and **no persistence layer beyond in-memory context and
a thin AsyncStorage wrapper**. See [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## Offline-first behaviour and limitations

The project is *intended* to be offline-first, but **no offline data layer exists yet**.
There is no SQLite schema, no local write queue, and no synchronization. Storing and
reading values via `AsyncStorage` currently works on-device, but that is not an
offline-first data contract. See [`docs/OFFLINE_FIRST.md`](docs/OFFLINE_FIRST.md) and
[`docs/SYNCHRONIZATION.md`](docs/SYNCHRONIZATION.md).

---

## Authentication & backend integration

Authentication is **not implemented**. `AuthScreen` renders mock login/signup forms whose
submit handler fabricates a local user object; there is no Clerk, no token handling, and
no API call. Clerk (`@clerk/expo`) is the intended direction pending EarnSetu decisions.
See [`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md).

---

## Build & release

There is **no** `eas.json` and no configured EAS project. App identifiers
(`android.package` / `ios.bundleIdentifier` = `com.coderooz.earnsetubasket`) are set, and
CI (`.github/workflows/ci.yml`) runs typecheck + `expo-doctor` + lint on push/PR. The app
can be run locally via `expo run:*`; a production release path is **not yet defined**. See
[`docs/BUILD_AND_RELEASE.md`](docs/BUILD_AND_RELEASE.md).

---

## Documentation navigation

Start at **[`docs/README.md`](docs/README.md)** (documentation index). Highlights:

- [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) — what/why/who
- [`docs/PRODUCT_SCOPE.md`](docs/PRODUCT_SCOPE.md) — in/out of scope
- [`docs/FEATURE_STATUS.md`](docs/FEATURE_STATUS.md) — evidence-backed feature inventory
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — current architecture
- [`docs/REPOSITORY_STRUCTURE.md`](docs/REPOSITORY_STRUCTURE.md) — directory map
- [`docs/TECH_STACK.md`](docs/TECH_STACK.md) — stack + dependency inventory
- [`docs/DEVELOPMENT_SETUP.md`](docs/DEVELOPMENT_SETUP.md) — setup guide
- [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md) — known issues
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — intended direction (proposed)

Reference systems (governance): `.workspace/PRI/PROJECT_REFERENCE_INDEX.md` (structure),
`.workspace/LFI/` (behaviour). Reports live under `.workspace/reports/`.

---

## Known limitations & warnings

- **Lint passes** (`npm run lint`, 0 problems) as of 2026-10-11; the earlier
  `@typescript-eslint/parser` resolution error is fixed
  ([ADR-0004](docs/decisions/ADR-0004_eslint-parser-hoist.md)). See
  [`docs/TROUBLESHOOTING.md`](docs/TROUBLESHOOTING.md).
- Several `src/` files are **empty placeholders** (`AlertProvider.tsx`, `ToastProvider.tsx`,
  `lib/connectDb.ts`, `lib/fetchData.ts`, `navigation/SplashNavigation.tsx`).
- `package.json` metadata (`bugs`, `homepage`) still points at the upstream template
  repository and does not reflect this project.
- The parent **EarnSetu** platform exists (`coderooz/EarnSetu`; Expo SDK 57 mobile + Next.js
  website), but **no Basket-facing integration contract** exists yet and the parent does not
  yet reference Basket (see
  [`docs/architecture/INTEGRATION_BOUNDARIES.md`](docs/architecture/INTEGRATION_BOUNDARIES.md)).
- No GitHub remote is configured for this repository.

See [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md) for the full list.

---

## Security reporting

Do not open a public issue for security problems. See [`SECURITY.md`](SECURITY.md) for
reporting instructions and the current security scope.

---

## License

MIT — see [`LICENSE`](LICENSE). Maintained by Coderooz (Ranit Saha).
