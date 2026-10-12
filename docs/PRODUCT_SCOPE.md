# Product Scope — EarnSetu Basket

> **Status key:** `IMPLEMENTED` · `PARTIALLY_IMPLEMENTED` · `NOT_IMPLEMENTED` ·
> `PROPOSED` (intended, not built) · `UNVERIFIED` · `EXCLUDED` (explicit non-goal).

This document separates **verified scope** from **intended/proposed scope**. Nothing in
the "intended" columns should be read as built. Evidence for the implemented column is in
[`FEATURE_STATUS.md`](FEATURE_STATUS.md).

## 1. Current implemented scope (verified)

The repository delivers only a scaffold. Verified today:

| Capability | Status | Notes |
|------------|--------|-------|
| App bootstrap & navigation | `IMPLEMENTED` | Root gate + auth gate + bottom tabs with per-tab stacks; typed params ([ADR-0003](decisions/ADR-0003_navigation-structure.md)) |
| Screen inventory | `IMPLEMENTED` (structure) | 19 routed skeletons (+ retained `SplashScreen`); no design/data |
| Onboarding screen | `IMPLEMENTED` (UI) | 3-page `OnboardingScreen`; persists `hasLaunched` |
| Auth UI (login/signup forms) | `PARTIALLY_IMPLEMENTED` | Mock; no real auth; forgot-password UI only |
| Local key/value storage helper | `PARTIALLY_IMPLEMENTED` | `AsyncStorage` wrapper; no domain use |
| Push-notification permission request | `PARTIALLY_IMPLEMENTED` | Requests token; logs it; not otherwise used |
| Shared UI components | `IMPLEMENTED` | `Button`/`Header`/`Loading` + `common/*` primitives |

## 2. Intended initial-release scope (proposed — NOT built)

These are the capabilities the project brief identifies as the core of Basket. **All are
`NOT_IMPLEMENTED`.**

| Capability | Status |
|------------|--------|
| Shopping-list creation & management | `NOT_IMPLEMENTED` |
| Item add/edit/delete/reorder | `NOT_IMPLEMENTED` |
| Quantity & unit handling | `NOT_IMPLEMENTED` |
| Item notes & status | `NOT_IMPLEMENTED` |
| Purchase recording | `NOT_IMPLEMENTED` |
| Partial purchases | `NOT_IMPLEMENTED` |
| Actual quantity & purchase price recording | `NOT_IMPLEMENTED` |
| Purchase history | `NOT_IMPLEMENTED` |
| Shopping summaries & totals | `NOT_IMPLEMENTED` |
| Offline operation (data layer) | `NOT_IMPLEMENTED` |
| Local persistence + migrations (SQLite) | `NOT_IMPLEMENTED` |
| Authentication & customer ownership | `NOT_IMPLEMENTED` |
| Backend communication | `NOT_IMPLEMENTED` |
| Synchronization & conflict handling | `NOT_IMPLEMENTED` |

## 3. Future possibilities (not commitments)

- Shared lists / household collaboration.
- Barcode or catalogue lookup.
- Budget tracking and richer analytics.
- Deeper EarnSetu ecosystem integration (rewards, merchant linkage).

These are possibilities only; they are **not** committed and are **not** scheduled.

## 4. Explicit exclusions (non-goals)

| Excluded | Reason |
|----------|--------|
| Merchant inventory management | Belongs to the EarnSetu merchant domain |
| Payments / checkout | Owned by EarnSetu payments (Razorpay/Stripe direction) |
| Product marketplace / discovery | Out of Basket's concern |
| Financial accounting / ledger | Separate domain |
| Online ordering / fulfilment | Out of scope |

## 5. Domain boundaries within EarnSetu

The intended boundary is that **Basket owns shopping-list and purchase records**, while
other EarnSetu domains own merchant inventory, catalogue, payments, and accounting.

```
        ┌────────────────────────── EarnSetu ecosystem ──────────────────────────┐
        │                                                                         │
   Merchant domain           Payments domain            Accounting domain        │
   (inventory, catalogue)    (Razorpay/Stripe)          (ledger)                 │
        │                          │                         │                   │
        └───────────────┬──────────┴───────────┬─────────────┘                   │
                        │ integration contract │ (UNRESOLVED)                   │
                        ▼                      ▼                                │
                 ┌──────────────────────────────────────┐                       │
                 │            EarnSetu Basket            │  ← this repository    │
                 │  shopping lists · purchases · history │                       │
                 └──────────────────────────────────────┘                       │
        └─────────────────────────────────────────────────────────────────────────┘
```

**Critical caveat:** the **Basket-facing** integration contract between Basket and the rest
of EarnSetu **does not exist yet** and could not be verified. The parent EarnSetu repository
exists (`coderooz/EarnSetu`, Expo SDK 57 mobile + Next.js 16 website), but it does not yet
reference Basket and defines no Basket-facing contract. See
[`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md).

## 6. Scope decisions still required

Before implementation can proceed, these must be decided (and recorded as ADRs):

1. Is Basket a standalone Expo app or part of a monorepo/shared mobile codebase?
2. What shared authentication does EarnSetu provide (Clerk instance/org model)?
3. What backend and API contracts will Basket consume (if any)?
4. What is the local persistence technology and schema (SQLite vs other)?
5. What is the synchronization model (conflict handling, idempotency, ownership)?
6. What are the domain entities and their ownership/identity model?

See [`ROADMAP.md`](ROADMAP.md) and [`decisions/README.md`](decisions/README.md).
