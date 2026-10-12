# Offline-First — EarnSetu Basket

> **Status: NO OFFLINE DATA CONTRACT IS IMPLEMENTED.** The app is *intended* to be
> offline-first, but today there is no data layer to be offline *about*.

## 1. Distinguish UI-offline from data-offline

- **Offline-capable UI:** the app can render screens without a network connection because
  there is no network dependency at all.
- **Offline-capable data operations:** creating/reading/updating shopping lists and
  purchases entirely on-device with later sync — **does not exist**.

Do not confuse "the app opens without internet" with "the app supports offline data".

## 2. Verified current behaviour

| Operation | Works offline? | Notes |
|-----------|----------------|-------|
| App launch / navigation | Yes | no network calls |
| Onboarding flag persistence | Yes | `AsyncStorage` |
| Mock login/signup | Yes (trivially) | fabricates local state; not real auth |
| Create/manage lists or items | N/A | feature does not exist |
| Record purchases | N/A | feature does not exist |
| Sync pending changes | N/A | no sync exists |

## 3. Intended offline contract (proposed — NOT implemented)

The following is a **proposal** describing what offline-first should mean for Basket,
to be ratified as an ADR:

1. **Local-first writes.** All domain writes go to the local database first and succeed
   immediately, regardless of connectivity.
2. **Local reads.** Lists, items, and history are read from the local database.
3. **Pending-change tracking.** Writes that need to reach the server are marked pending
   (dirty flag / operation log) for later synchronization.
4. **Connectivity loss.** Operations continue locally; the UI may indicate unsynced state.
5. **Connectivity return.** Pending changes are pushed and remote changes pulled;
   conflicts are resolved per [`SYNCHRONIZATION.md`](SYNCHRONIZATION.md).
6. **Operations that require a server:** authentication/sign-in, and any server-only
   feature (none defined yet). These must degrade gracefully when offline.
7. **Error surfacing.** Sync failures are non-destructive and surfaced to the user;
   local data is not lost.

## 4. Current limitations

- No local database, so no transactional offline store.
- No pending-operation model, so nothing to sync.
- No conflict handling.
- No connectivity detection.
- `AsyncStorage` cannot satisfy the intended contract (see
  [`DATABASE_AND_MIGRATIONS.md`](DATABASE_AND_MIGRATIONS.md) §3).

## 5. Acceptance criteria for "offline-first" (to be met later)

- [ ] A user can create/edit a list and items with no network.
- [ ] Purchases can be recorded with no network.
- [ ] Data survives app restart (real DB, not in-memory).
- [ ] Pending changes sync automatically when connectivity returns.
- [ ] Conflicts are detected and resolved deterministically.
- [ ] Failures never cause silent data loss.

## Related documents

- [`SYNCHRONIZATION.md`](SYNCHRONIZATION.md)
- [`DATABASE_AND_MIGRATIONS.md`](DATABASE_AND_MIGRATIONS.md)
- [`testing/OFFLINE_TESTING.md`](testing/OFFLINE_TESTING.md)
