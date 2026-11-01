# Error Paths

**Project:** EarnSetu Basket (earnsetu-basket-v2)  
**Status:** active  
**Last verified:** 2026-11-01

---

| Error Type | Detection | Handling | Recovery | File:Line |
|------------|-----------|----------|----------|-----------|
| SQLite open / migration failure | `initializeDatabase()` rejects | App renders `ErrorScreen` with retry button | user taps retry -> `start()` re-runs | `App.tsx`, `src/db/index.ts` |
| Validation failure (`ValidationError`) | service `validate*()` throws | Form catches, shows `toUserMessage`, preserves input | user corrects and resubmits | `src/lib/*/services/*.service.ts` |
| Missing referenced list/shop | service looks up record, not found | throws `ValidationError` ("Choose an existing...") | user picks valid reference | `item.service.ts`, `purchase.service.ts` |
| Sync op rejected (non-retryable HTTP) | `assertOkStatus` throws `SyncRejectedError` | op kept queued, failure recorded, run continues | op retried on next sync | `src/lib/sync/services/sync.service.ts` |
| Sync retryable (5xx/429/408) | `classifyHttpStatus` = "retryable" | sync run aborted, status `offline`/`retryable` | retry when connectivity returns | `sync.service.ts` |
| Sync auth (401/403) | `classifyHttpStatus` = "auth" | `SyncAuthError`, status `authFailed`, session cleared | user signs in again (provider pending) | `sync.service.ts`, `auth.service.ts` |
| Sync transport failure (network) | `fetch` throws / abort | `SyncTransportError`, status `offline`, retryable=true | retry when online | `sync.service.ts` |
| Invalid backup file | `parseBackup` throws | import aborted BEFORE any local write | user selects valid backup | `src/lib/backup/helpers/backup.helpers.ts` |
| Missing auth session | `authService.getSession()` returns undefined | sync returns `no-session`, local mode | data stays local; provider pending | `sync.service.ts` |
| Theme meta read failure | `settingsService.getThemeMode()` catches | fall back to "system" mode | no user impact | `ThemeProvider.tsx` |
| Concurrent sync | `syncingRef` guard | second `syncNow` returns `null` | no-op until first completes | `BasketProvider.tsx` |

---

## Guarantees (error-related)

- A local write and its outbox op commit atomically: a crash never leaves a write without a queued sync op.
- Nothing is discarded from the outbox before backend acknowledgement.
- Local-wins merge: remote never overwrites a locally pending record.
- Import validates the entire payload before any write: no partial/corrupt imports.
- Offline use is always available: sync failures never block local reads/writes.
