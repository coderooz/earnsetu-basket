# Database Migrations — Development Guide

> There is **no database yet** ([`../DATABASE_AND_MIGRATIONS.md`](../DATABASE_AND_MIGRATIONS.md)).
> This guide defines the rules to follow *when one exists*, so the first implementation
> starts correct.

## Principles

1. **Migrations are forward-only and ordered.** Never edit or delete a migration that has
   shipped. Add a new one.
2. **Migrations are transactional** where the engine supports it. A migration must end in
   a consistent state or roll back entirely.
3. **Migrations are idempotent** where practical (guarded `CREATE TABLE IF NOT EXISTS`,
   column-existence checks).
4. **Migrations run deterministically** in a defined startup sequence, before any data
   access, exactly once per version.
5. **Schema version is tracked** (`user_version` or a migrations table).
6. **Downgrades are explicit** — define what happens when an older app meets a newer
   schema (usually: refuse to open, or migrate forward only).

## Workflow

1. Decide the schema change; update [`../DATA_MODEL.md`](../DATA_MODEL.md) first.
2. Add a new migration file (numbered/ordered).
3. Write the migration (DDL + any data backfill).
4. Add the matching migration to the runner registry.
5. Test on a fresh DB **and** on a DB with existing data.
6. Update [`../DATA_MODEL.md`](../DATA_MODEL.md) and
   [`../DATABASE_AND_MIGRATIONS.md`](../DATABASE_AND_MIGRATIONS.md).
7. Commit the migration with the code that depends on it.

## Rules

- Never mutate user data without a documented, reversible plan.
- Never drop a column/table without a migration path and an ADR if data could be lost.
- Soft-delete where deletion must propagate during sync.
- Back up (or export) before destructive migrations when feasible.
- Migration failures must be surfaced, never swallowed.

## Testing migrations

Once a DB and test runner exist:

- create-from-scratch test (all migrations on an empty DB);
- upgrade test (seed an old schema/data, migrate, assert);
- idempotency/re-run test;
- failure-path test (migration throws → consistent state, error surfaced).

## Related documents

- [`../DATABASE_AND_MIGRATIONS.md`](../DATABASE_AND_MIGRATIONS.md)
- [`../DATA_MODEL.md`](../DATA_MODEL.md)
- [`../testing/TEST_STRATEGY.md`](../testing/TEST_STRATEGY.md)
