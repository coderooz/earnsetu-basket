# Offline Testing — EarnSetu Basket

> **Status: PROPOSED.** There is nothing offline to test yet
> ([`../OFFLINE_FIRST.md`](../OFFLINE_FIRST.md)). This is the plan for when the data layer
> exists.

## Why this matters

Offline-first correctness is easy to get wrong and hard to notice. Failures (lost writes,
duplicates, silent divergence) are data-integrity bugs. They need dedicated tests, not just
happy-path screenshots.

## Scenarios to test

### Local-first writes
- Create/update/delete a list off-line → succeeds locally, marked pending.
- Create/update/delete items and purchases off-line → succeed locally.
- Data survives app restart (persisted, not in-memory).

### Connectivity transitions
- Write while offline → then go online → pending changes sync.
- Go offline mid-sync → sync resumes without duplication/corruption.
- Rapid toggling of connectivity → no duplicate operations.

### Idempotency & retries
- A pushed operation that times out and is retried → applied exactly once.
- Partial batches → remaining operations retry.

### Conflicts
- Same record edited on two devices → resolution follows the accepted policy.
- Concurrent create with same client id → de-duplicated.

### Deletion propagation
- Delete locally → tombstone synced → remote delete applied.
- Delete while offline → reconciles on reconnect.

### Auth expiry
- Session expires mid-sync → operations are not lost; user is prompted to re-auth.

### Failure recovery
- Sync throws → local data intact; error surfaced; retry available.

## Test approach

- Use a **fake/in-memory storage** and a **fake network** with programmable failures.
- Assert **invariants**: no data loss, no duplication, deterministic convergence.
- Prefer property-style checks (apply operations in varied orders → same converged state).

## Acceptance criteria

- [ ] All scenarios above have automated tests.
- [ ] No scenario results in silent data loss.
- [ ] Converged state is deterministic across orderings.

## Related documents

- [`../OFFLINE_FIRST.md`](../OFFLINE_FIRST.md)
- [`../SYNCHRONIZATION.md`](../SYNCHRONIZATION.md)
- [`TEST_STRATEGY.md`](TEST_STRATEGY.md)
