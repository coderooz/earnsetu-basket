# Error Handling — EarnSetu Basket

> **Status: MINIMAL.** There is no error boundary, no logging framework, and no
> user-facing error system.

## 1. Verified current behaviour

| Concern | Reality |
|---------|---------|
| Global error boundary | **None** |
| Logging | `console.log` only (e.g. push token in `App.tsx`) |
| Crash reporting | **None** |
| User-facing alerts/toasts | **None** — `AlertProvider.tsx` and `ToastProvider.tsx` are **0-byte** placeholders |
| Network error handling | N/A (no network calls) |
| Validation errors | N/A (no forms with real validation) |
| Retry logic | **None** |

## 2. Observed patterns

- **Notification permission:** `App.tsx` silently returns if permission is not granted;
  a failure in `getExpoPushTokenAsync` is not caught (it runs in an unawaited async IIFE),
  so a rejection could surface as an unhandled rejection.
- **Mock auth:** the submit handlers fabricate a user without validation or error paths.

## 3. Intended error handling (proposed — NOT implemented)

1. A **top-level error boundary** that shows a recoverable fallback instead of a blank
   screen.
2. A lightweight **toast/alert system** (the empty `ToastProvider`/`AlertProvider` files
   suggest this intent) for transient feedback and recoverable errors.
3. **Domain error typing** (e.g. validation, conflict, network, auth) once features exist.
4. **Structured logging** with no sensitive data; crash reporting added deliberately
   (with privacy review) rather than by default.
5. **Graceful degradation** for server-dependent operations when offline.

## 4. Rules to adopt

- Never swallow errors silently in domain code.
- Never log secrets, tokens, or personal data.
- Local data must never be lost due to an error path.
- Distinguish **recoverable** (retry/notify) from **fatal** (boundary) errors.

## 5. Gaps

| Gap | Severity |
|-----|----------|
| No error boundary | HIGH (when features arrive) |
| No logging/observability | MEDIUM |
| Empty toast/alert providers | LOW (planned) |
| Unhandled notification promise | LOW |

## Related documents

- [`SECURITY_AND_PRIVACY.md`](SECURITY_AND_PRIVACY.md)
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
