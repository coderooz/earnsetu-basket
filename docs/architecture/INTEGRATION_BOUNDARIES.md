# Integration Boundaries — EarnSetu Basket

EarnSetu Basket is a planned **child/extension app** of the parent **EarnSetu** platform.
This document records where Basket meets EarnSetu, and — honestly — that **no Basket-facing
integration contract exists yet**.

## 1. Parent ecosystem status (verified 2026-10-11)

The parent **EarnSetu** repository is available both locally and on GitHub:

| Property | Value |
|----------|-------|
| Local path | `../../website/LocalCart` (sibling of this repo, under `workProjects/`) |
| GitHub | `git@github.com:coderooz/EarnSetu.git` (branch `dev`) |
| Product | EarnSetu — an offline-first hyperlocal-commerce / "economic infrastructure" platform |

Verified **from the parent repository** (not from a summary doc):

- **Website** (`website/`): Next.js 16 (App Router), TypeScript strict, React 19, Tailwind 4,
  shadcn/ui, MongoDB 7 + Mongoose 9, Redis, custom HMAC session auth + bcrypt,
  Razorpay/PhonePe, Cloudinary, Resend, Sentry, Playwright; 35+ API routes.
- **Mobile app** (`application/`, package `com.earnsetu.localcart`, npm name
  `localcart-mobile`): **Expo SDK 57**, React Native 0.86.3, React 19.2.3, NativeWind v4,
  React Navigation v7, `@clerk/clerk-expo`, `expo-sqlite`, Zustand — i.e. **the same mobile
  stack family as Basket**.
- **Roadmap** (`ROADMAP/`): V0 Field Pilot → V1 EarnSetu App → V2 Sync Integration →
  V3 Full Ecosystem.

> **Correction (2026-10-11).** An earlier version of this document cited
> `C:\Code_Works\Docs\Projects\EarnSetu` — a **three-file placeholder** (`README.md`,
> `ARCHITECTURE.md`, `ROADMAP.md`) that reports "Architecture: Not started" / "NOT YET
> DESIGNED". That is **not** the EarnSetu repository. The earlier conclusion that "the
> parent has no published architecture" is therefore **false**; the real parent is the
> mature repository above.

**The child relationship is planned, not yet implemented.** The parent repository does
**not** reference "Basket" anywhere, and there is no shared module, workspace, API contract,
or auth binding for Basket yet.

## 2. Integration surfaces (intended)

| Surface | Basket side | EarnSetu side | Contract status |
|---------|-------------|---------------|-----------------|
| Identity/auth | login/session (mock today) | Parent mobile app uses **Clerk** (`@clerk/clerk-expo`); website uses custom HMAC sessions | **Not wired into Basket** |
| Data sync | local store ↔ remote | Website API routes + sync engine (parent roadmap V2) | **Not wired into Basket** |
| Domain model | lists/items/purchases | Parent domain modules (transaction, ledger, …) | **No Basket mapping defined** |
| Design language | NativeWind v4 UI | Parent also uses NativeWind v4 | Shared tokens **not defined** |
| Notifications | expo-notifications | Expo Notifications (parent) | **Not wired into Basket** |

## 3. Boundary rules (adopted)

- Basket owns **shopping-list and purchase-recording** concerns only.
- Basket is a **specialized child/extension app**: a focused subset for users who want only
  this capability, not the full EarnSetu app.
- Basket should **reuse** ecosystem auth/backend/sync once Basket-facing contracts exist,
  rather than duplicating them.
- Basket must **not** import merchant/inventory/payment/accounting modules.
- Where a Basket capability intersects another domain, the integration contract must be
  **defined and verified first** (ADR), not assumed.
- Stay **stack-aligned** with the parent mobile app (Expo SDK, React Navigation, NativeWind)
  so integration and code sharing remain viable.
- Do not assume Basket is a merchant, marketplace, checkout, payment, or ordering app.

## 4. Missing external context (gaps to obtain)

The parent repository itself is now available, but the following **Basket-specific**
contracts still do not exist:

1. A Basket-facing API contract (routes, base URLs, environments, error format).
2. A confirmed auth binding (shared Clerk instance/organisation, or another scheme).
3. A shared domain/data mapping between Basket entities and EarnSetu's domain.
4. Shared design tokens, if any.
5. A packaging/ownership decision (separate repository vs. later module extraction).

Until these exist, **no integration code should be written**, and no integration is claimed
as verified.

## 5. What Basket *can* do independently (bounded)

Basket can safely make **Basket-local** decisions that do not depend on the ecosystem:
domain modelling, local persistence choice, offline UX, error handling, testing, and build
configuration — while keeping the stack aligned with the parent mobile app. Even these should
be recorded as ADRs and revisited if a shared contract later dictates otherwise.

## 6. Application identity & EAS registration (verified 2026-10-12)

Basket is the **child** app; EarnSetu (`earnsetu`) is the **parent**. Both names are
**provisional working names** (final names depend on availability and cost). The hierarchy
is descriptive metadata + documentation — **not** a backend, auth, or data integration
(none exists; see §2).

| Property | EarnSetu-Basket (this app) | EarnSetu (parent) |
|----------|---------------------------|-------------------|
| Role | child | parent |
| Display name | `EarnSetu-Basket` | `EarnSetu` |
| Expo slug | `earnsetu-basket` | `earnsetu` |
| Expo owner | `coderooz` (verified) | `coderooz` (verified) |
| EAS project | `@coderooz/earnsetu-basket` | `@coderooz/earnsetu` |
| EAS project ID | `b66d6d4c-93b2-4a6d-80ce-993c4a037801` | `31b435a2-d883-4fe5-aa37-18900918190a` |
| Android package | `com.coderooz.earnsetubasket` | `com.earnsetu.localcart` (legacy — change needs approval) |
| iOS bundle ID | `com.coderooz.earnsetubasket` | `com.earnsetu.localcart` (legacy — change needs approval) |
| Naming status | provisional | provisional |

Notes:

- The two EAS project IDs are **distinct** — never share one ID between two native apps.
- The requested hyphenated identifiers (`com.coderooz.earnsetu-basket`) were **not applied**:
  hyphens are invalid in Android application IDs (Java package segments). Basket keeps its
  valid existing identifiers; any rename needs approval.
- The parent keeps its legacy `com.earnsetu.localcart` identifiers; moving to
  `com.coderooz.earnsetu` needs approval (established identity, existing builds).
- `Coderooz` is the developer/project namespace (identifiers, Expo owner) — not a product.
- Hierarchy metadata lives in each app's `app.json → expo.extra.earnsetu` (client-visible,
  no secrets).

## Related documents

- [`../PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md)
- [`../AUTHENTICATION.md`](../AUTHENTICATION.md)
- [`../API_INTEGRATION.md`](../API_INTEGRATION.md)
- [`../decisions/README.md`](../decisions/README.md)
