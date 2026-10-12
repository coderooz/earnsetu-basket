# Synchronization — EarnSetu Basket

> **Status: NOT IMPLEMENTED.** There is no sync engine, no backend, and no conflict
> handling. This document records the current state and the decisions required before
> implementation.

## 1. Verified current state

| Concern | Reality |
|---------|---------|
| Local/remote ownership | Undefined (no remote, no data model) |
| Pending operations | None |
| Retry behaviour | None |
| Idempotency | None |
| Conflict detection/resolution | None |
| Duplicate prevention | None |
| Deletion propagation | None |
| Auth expiry handling | N/A (no auth) |
| Failure recovery | None |
| Observability | None |

## 2. Why sync cannot be designed yet

Synchronization depends on a backend contract and a domain model, neither of which exists.
The parent EarnSetu ecosystem exists (`coderooz/EarnSetu`) but publishes no **Basket-facing**
contract, so the remote contract is unknown. Designing sync now would fabricate APIs. See
[`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md).

## 3. Decisions required before implementation

Record as ADRs:

1. **Ownership & source of truth** — local-first with server merge, or server-authoritative?
2. **Change tracking** — per-record dirty flags, operation log, or CRDTs?
3. **Idempotency** — how are retried operations de-duplicated (client-generated IDs,
   idempotency keys)?
4. **Conflict model** — last-write-wins, field-level merge, or manual resolution?
   Which fields are conflict-sensitive?
5. **Deletion semantics** — tombstones / soft delete and how deletions propagate.
6. **Transport** — REST polling, websockets, or push-triggered sync?
7. **Auth expiry** — how sync behaves when the session expires mid-operation.
8. **Batching & backpressure** — how many operations per sync, and throttling.
9. **Observability** — what is logged/metricised (without leaking user data).
10. **Failure recovery** — how a partially-applied sync is reconciled.

## 4. Non-claims

- No guarantee of **exactly-once** delivery.
- No claim of **conflict-free** operation.
- No claim of **eventual consistency** semantics.

None of these can be asserted without a technical design and evidence.

## 5. Proposed direction (NOT implemented)

The project brief indicates an **offline-first** model with controlled synchronization to
EarnSetu where supported. A plausible shape (to be decided, not adopted):

```
Local write ──▶ Local DB (immediate, success)
                    │
                    ├─ mark record dirty / append change
                    ▼
             Sync engine (when online)
                    │  push pending changes (idempotent, client IDs)
                    │  pull remote changes
                    ▼
             Conflict resolution ──▶ Local DB (reconciled)
```

This is illustrative only.

## Related documents

- [`OFFLINE_FIRST.md`](OFFLINE_FIRST.md)
- [`DATA_MODEL.md`](DATA_MODEL.md)
- [`API_INTEGRATION.md`](API_INTEGRATION.md)
- [`decisions/README.md`](decisions/README.md)
