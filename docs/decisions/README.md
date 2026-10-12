# Architecture Decision Records (ADRs) — Index

This directory holds the project's **Architecture Decision Records**. An ADR records a
significant decision, its context, and its consequences so future developers and agents
understand *why* the system is the way it is.

## When to write an ADR

Write one when a decision is **architectural**, e.g.:

- adding/removing a dependency that shapes the architecture (auth, database, state, HTTP);
- changing persistence, state management, navigation, or styling strategy;
- changing data ownership, synchronization, or API contracts;
- restructuring the project or introducing a domain layer;
- any decision with lasting maintenance consequences.

Do **not** write an ADR for trivial code changes.

## Status values

- `Proposed` — under discussion, not yet accepted.
- `Accepted` — agreed and in effect.
- `Superseded by ADR-XXXX` — replaced.
- `Deprecated` — no longer relevant.

## How to propose one

1. Copy [`ADR_TEMPLATE.md`](ADR_TEMPLATE.md) to `ADR-000N_short-title.md` (next free
   number).
2. Fill in context, decision, alternatives, and consequences.
3. Set status to `Proposed` until accepted.
4. Link it from this index.

> **Important:** Do not retroactively label an *inferred* decision as formally approved.
> If a decision is unresolved, record it as `Proposed` or as an open question.

## Index

| ID | Title | Status | Date |
|----|-------|--------|------|
| [ADR-0001](ADR-0001_nativewind-runtime-dependency-pin.md) | Pin `react-native-css-interop` as a direct dependency (NativeWind v4) | Accepted | 2026-10-11 |
| [ADR-0002](ADR-0002_basket-as-earnsetu-child-app.md) | EarnSetu Basket is a specialized child/extension app of EarnSetu | Accepted | 2026-10-11 |
| [ADR-0003](ADR-0003_navigation-structure.md) | Navigation architecture — bottom tabs with per-tab stacks and typed params | Accepted | 2026-10-11 |
| [ADR-0004](ADR-0004_eslint-parser-hoist.md) | Hoist `@typescript-eslint/parser` to fix the ESLint parse errors | Accepted | 2026-10-11 |

## Open decisions (not yet ADRs)

These are known architecture questions, tracked here until a decision is made. They block
dependent feature work (see [`../ROADMAP.md`](../ROADMAP.md)).

| # | Question |
|---|----------|
| ~~1~~ | ~~Standalone Expo app vs. shared EarnSetu mobile codebase?~~ **Resolved: [ADR-0002](ADR-0002_basket-as-earnsetu-child-app.md)** — standalone app that is a specialized child/extension of EarnSetu |
| 2 | Authentication provider/instance and sign-in methods? |
| 3 | Backend and API contracts Basket will consume? |
| 4 | Local persistence technology (SQLite vs alternative) and schema? |
| 5 | Synchronization model (ownership, conflicts, idempotency)? |
| 6 | Domain entities and ownership/identity model? |
| 7 | Is Clerk (`@clerk/expo`) adopted as the auth client? |

## Related documents

- [`ADR_TEMPLATE.md`](ADR_TEMPLATE.md)
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`../ROADMAP.md`](../ROADMAP.md)
