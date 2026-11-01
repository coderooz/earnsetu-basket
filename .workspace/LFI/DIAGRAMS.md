# Diagrams

**Project:** EarnSetu Basket (earnsetu-basket-v2)  
**Status:** active  
**Last verified:** 2026-11-01

---

## Layered Architecture (text diagram)

```
Screens / Components  (src/screens, src/components)
        |
        v
Hooks / UI state        (src/context, src/hooks)
        |
        v
Domain Actions          (src/lib/<domain>/actions/*.action.ts)
        |
        v
Domain Services         (src/lib/<domain>/services/*.service.ts)
        |   +---> other domain service interfaces (cross-domain)
        v
Domain Repositories     (src/lib/<domain>/repositories/*.repository.ts)
        |
        v
src/db                  (connections, schema, migrations, local-store)
        |
        v
Expo SQLite             (WAL, PRAGMA user_version migrations)
```

---

## Sync Data Flow

```
Local write (action)
        |
        v
local-store.persistRecord / removeRecord
        |  (atomic txn: record + outbox op)
        v
Expo SQLite: resource table + sync_outbox
        |
        v  (opportunistic sync: launch + foreground)
SyncClient.syncAll()
        |
        +-- PUSH: POST /api/basket/sync (idempotency receipt id)
        |       on 2xx -> ack: delete outbox op, mark record synced
        |       on rejected -> keep op queued
        |       on retryable/auth -> abort, report
        |
        +-- PULL: GET /api/basket/:resource (paginated)
                local-wins: apply only if no local copy or synced
                -> saveSyncedRecord (no outbox op)
        v
setMeta lastSyncedAt
```

---

## Product Identity (derived read model)

```
list entries (items)       purchases       shop catalogues (soldItems)
        \                       |                       /
         \                      |                      /
          v                     v                     v
                normalised item name (product key)
                           |
                           v
                    ProductSummary / ProductProfile
                    (read model, NOT synced)
```
