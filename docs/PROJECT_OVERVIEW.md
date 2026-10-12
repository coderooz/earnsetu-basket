# Project Overview — EarnSetu Basket

> **Verification status:** This overview distinguishes **verified** implementation facts
> (from the repository) from **intended** product direction (from the project brief). The
> intended direction has **not** been validated against a **Basket-facing** EarnSetu
> contract — the parent EarnSetu platform exists, but no Basket-facing contract is defined.

## What EarnSetu Basket is

EarnSetu Basket is a **mobile-first shopping-list and purchase-recording application**.
Its aim is to help a user:

1. create and manage **shopping lists**;
2. track **items** they intend to purchase (with quantity/unit and notes);
3. **record actual purchases** (including partial purchases and real quantities/prices);
4. review **shopping history and summaries**.

It is intended to be **offline-first**, persisting locally and synchronising with the
EarnSetu ecosystem where a Basket-facing API contract exists.

## What it is today (verified)

The repository is a **scaffolded Expo prototype**, not a working shopping-list app.
Specifically:

- An Expo (SDK 57) + TypeScript + NativeWind project initialised from the author's
  `expo-template-coderooz` template.
- A React Navigation **bottom-tab + per-tab stack** structure with **19 routed screen
  skeletons** ([ADR-0003](decisions/ADR-0003_navigation-structure.md)):
  - `OnboardingScreen` — a 3-page first-launch tour (`SplashScreen` is retained but unused).
  - `AuthScreen` / `ForgotPasswordScreen` — mock login/signup forms + reset UI (no real auth).
  - Home, Purchase, Product Item, Profile, and Settings (+ Account/Appearance/Notifications/
    Help/About/Terms/Privacy/Licenses) — structural placeholders with wired navigation.
- A `UserProvider` React context holding mock user state, plus `useUserContext`.
- A thin `AsyncStorage` wrapper (`src/lib/storage.ts`) and a `useStorage` hook.
- Several **empty placeholder files** that indicate planned work (see below).

**None of the shopping-list / item / purchase / history domain is implemented.** There is
no database, no API, no authentication provider, and no synchronization.

## Why it exists

EarnSetu Basket is intended to be a specialized **child/extension app** of the **EarnSetu**
platform (`coderooz/EarnSetu`) — an "Economic Operating System" for hyperlocal commerce. It
offers a focused slice for users who want only this capability, not the full EarnSetu app.
Basket owns the **shopping-list and purchase-recording** concern for end users, while keeping
clear separation from the merchant, inventory, payment, accounting, and marketplace domains.

The problem it is intended to solve: give users a simple, reliable, offline-capable way
to plan shopping and record what they actually bought, as part of a single ecosystem.

## Intended users

- End users / shoppers within the EarnSetu ecosystem (household and personal shopping).
- **Not** merchants or sellers.

## Core workflows (intended)

> These are **proposed** workflows. They are not implemented. See
> [`FEATURE_STATUS.md`](FEATURE_STATUS.md).

- Create a list → add items → mark items purchased → record actual quantity/price →
  review history/summary → optionally sync.

## Product boundaries

EarnSetu Basket is **not**:

- a merchant/inventory management tool;
- a marketplace, checkout, or online-ordering app;
- a payments application;
- a product-discovery/catalogue app;
- the primary EarnSetu merchant mobile application.

See [`PRODUCT_SCOPE.md`](PRODUCT_SCOPE.md) for the boundary detail and
[`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md) for
ecosystem integration concerns (largely **unresolved**).

## Architectural principles (intended)

- **Offline-first**: local persistence is the primary source of truth on-device.
- **Clear domain boundary**: Basket owns shopping-list/purchase records only.
- **Reuse ecosystem capabilities** (auth, backend) rather than duplicating them.
- **No competing sources of truth** for shared domain rules.

These are *directions*. Only the technology choices actually present in the repository are
verified; see [`TECH_STACK.md`](TECH_STACK.md).

## Current state summary

| Dimension | State |
|-----------|-------|
| Product functionality | Scaffold only |
| Architecture | Single Expo app; UI skeleton; no data layer |
| Backend integration | None |
| Authentication | None (mock UI) |
| Persistence | AsyncStorage wrapper only |
| Sync/offline data | None |
| Tests / CI / Release | None |
| Documentation | This foundation (new) |

## Explicit non-goals (for now)

- Merchant inventory, payments, accounting, marketplace, ordering.
- Multi-tenant or multi-user collaboration.
- Web-first or desktop experiences (web target exists but is incidental).
- Production release (no release pipeline exists).

## Related documents

- [`PRODUCT_SCOPE.md`](PRODUCT_SCOPE.md)
- [`FEATURE_STATUS.md`](FEATURE_STATUS.md)
- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`ROADMAP.md`](ROADMAP.md)
