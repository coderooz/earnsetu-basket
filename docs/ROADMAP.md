# Roadmap — EarnSetu Basket

> **This is a proposal, not a commitment.** Nothing here is scheduled, and no item is
> implemented unless [`FEATURE_STATUS.md`](FEATURE_STATUS.md) says so. Priorities depend on
> unresolved EarnSetu ecosystem decisions.

## Guiding constraint

Basket cannot be built far ahead of the EarnSetu architecture. The parent ecosystem
exists (Expo SDK 57 mobile app + Next.js website), but it currently publishes **no
Basket-facing architecture, backend, or auth contract**
(see [`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md)).
Platform decisions must be made (as ADRs) before dependent feature work begins.

## Phase 0 — Foundation & decisions (next)

| Item | Type | Status |
|------|------|--------|
| Resolve open architecture decisions (see below) | Decision | Partly done (ADR-0002/0003) |
| Screen scaffold & navigation structure | Scaffold | ✅ Done — 2026-10-11 ([ADR-0003](decisions/ADR-0003_navigation-structure.md)) |
| Fix the ESLint configuration | Tooling | ✅ Done — 2026-10-11 ([ADR-0004](decisions/ADR-0004_eslint-parser-hoist.md)) |
| Correct stale `package.json` metadata | Hygiene | Not started |
| Decide domain model & persistence (ADR) | Decision | Not started |
| Decide authentication approach (ADR) | Decision | Not started |

## Phase 1 — Offline data core

| Item | Type | Status |
|------|------|--------|
| Local database + schema + migrations | Feature | Not started |
| Shopping-list CRUD | Feature | Not started |
| Item CRUD, ordering, quantity/unit, notes, status | Feature | Not started |
| Purchase recording (incl. partial) | Feature | Not started |
| Purchase history & summaries | Feature | Not started |

## Phase 2 — Identity & backend

| Item | Type | Status |
|------|------|--------|
| Authentication (provider TBD, Clerk direction) | Feature | Not started |
| Customer ownership enforced server-side | Feature | Not started |
| Backend API integration | Feature | Not started |
| Synchronization + conflict handling | Feature | Not started |

## Phase 3 — Quality & release

| Item | Type | Status |
|------|------|--------|
| Test suite (unit/component/integration) | Quality | Not started |
| CI pipeline (lint/typecheck/doctor/tests) | Tooling | Partial — CI runs typecheck/doctor/lint; no tests |
| EAS project, app identifiers, release profiles | Release | Not started |
| OTA updates strategy | Release | Not started |
| App-store release | Release | Not started |

## Open decisions blocking progress

1. Standalone repo vs. shared EarnSetu mobile codebase.
2. Shared authentication instance/scheme.
3. Backend and API contracts.
4. Local persistence technology and schema.
5. Synchronization model (ownership, conflicts, idempotency).
6. Domain entities and ownership/identity model.

Record these as ADRs in [`decisions/`](decisions/README.md).

## Related documents

- [`PRODUCT_SCOPE.md`](PRODUCT_SCOPE.md)
- [`FEATURE_STATUS.md`](FEATURE_STATUS.md)
- [`decisions/README.md`](decisions/README.md)
