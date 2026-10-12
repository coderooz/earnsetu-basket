# Database & Migrations — EarnSetu Basket

> **Status: NO DATABASE IS IMPLEMENTED.**

## 1. Verified current state

| Concern | Reality |
|---------|---------|
| Local database | **None** |
| `expo-sqlite` | Installed (`~57.0.4`) and enabled as an `app.json` plugin, but **0 code references** |
| Migration system | **None** |
| Schema versioning | **None** |
| Persistence actually used | `AsyncStorage` key/value (via `src/lib/storage.ts`) |
| Remote database | **None** |

Evidence: `app.json` plugin list; absence of SQLite imports in `src/`; `src/lib/connectDb.ts`
is a 0-byte placeholder.

## 2. What "migrations" means here today

There is nothing to migrate. The only persisted value is an onboarding flag. There is no
migration runner and no migration history.

## 3. Local persistence rules (current)

- All persistence goes through `src/lib/storage.ts` (an `AsyncStorage` wrapper with
  `get`/`set`/`update`/`remove`/`clear`).
- `AsyncStorage` is **not** an offline-first data store: it has no transactions, no
  queries, no relational constraints, and no change tracking.
- Do not build domain persistence on `AsyncStorage` without an ADR — it would create a
  migration burden and cannot satisfy the intended offline-first contract.

## 4. Required decisions before implementing a database

1. **Technology** — is `expo-sqlite` the choice (already installed), or another store
   (e.g. WatermelonDB, op-sqlite, Drizzle + SQLite)? Record as an ADR.
2. **Schema** — derive from the accepted data model (see [`DATA_MODEL.md`](DATA_MODEL.md)).
3. **Migration strategy** — versioned, forward-only migrations with a tracked
   `user_version` / migration table; define rollback behaviour.
4. **Schema versioning** — how the app handles a device with an older schema.
5. **Data retention & deletion** — soft vs hard delete; what happens on sign-out.
6. **Import/export** — whether data can be exported for backup.

## 5. Migration rules (to adopt once a DB exists)

- Migrations are **additive and ordered**; never edit a shipped migration.
- Each migration is idempotent where possible and wrapped in a transaction.
- Migrations run inside a defined startup sequence, before data access.
- A failed migration must not leave the DB in a partially-migrated state.
- Every schema change updates [`DATA_MODEL.md`](DATA_MODEL.md) and this document.

See also [`development/DATABASE_MIGRATIONS.md`](development/DATABASE_MIGRATIONS.md).

## Related documents

- [`DATA_MODEL.md`](DATA_MODEL.md)
- [`OFFLINE_FIRST.md`](OFFLINE_FIRST.md)
- [`development/DATABASE_MIGRATIONS.md`](development/DATABASE_MIGRATIONS.md)
