# LFI — Error Paths

Error handling in the current implementation. The codebase is minimal, so observable error
paths are few; this documents them honestly and notes the gaps.

## Observed error paths (current code)

| ID | Location | Condition | Behaviour |
|----|----------|-----------|-----------|
| `EP-001` | `App.tsx` (LF-002) | Notification permission denied | Silent `return`; no user feedback |
| `EP-002` | `App.tsx` (LF-002) | `getExpoPushTokenAsync` rejects | **Unhandled** — async IIFE has no `catch`; may surface as an unhandled promise rejection |
| `EP-003` | `src/lib/storage.ts` | Any `AsyncStorage` op throws | Caught and `console.error`ed; `get` returns `null`, `set/update/remove/clear` resolve silently (caller cannot tell it failed) |
| `EP-004` | `src/hooks/UserHook.ts` | `useUserContext` used outside `UserProvider` | `throw new Error(...)` — surfaces as a render error |
| `EP-005` | `HomeScreen.handleClearLogs` | `storage.clear()` throws | `Alert.alert("Error", ...)` + `console.log` |

## Not present (gaps)

| Missing mechanism | Consequence | Status |
|-------------------|-------------|--------|
| Global error boundary | A render error shows a blank/red screen | **Not implemented** |
| Toast/Alert system | No reusable transient feedback (`ToastProvider`, `AlertProvider` are **empty files**) | **Not implemented** |
| Network error handling | N/A (no network calls) | N/A |
| Validation errors | Forms do not validate | **Not implemented** |
| Retry / backoff | N/A | N/A |
| Crash reporting | No visibility into production errors | **Not implemented** |

## Storage error contract (detail — EP-003)

`storage.get` returns `null` on error **and** when the key is absent — callers cannot
distinguish "missing" from "failed read". `set/update/remove/clear` swallow errors after
logging. This is acceptable for the current non-critical flags but is **not** acceptable for
domain data (silent write failure = data loss). Revisit before adding the data layer.

## Rules for new code

- Never swallow errors silently in domain paths.
- Distinguish recoverable vs fatal errors.
- Never log secrets/tokens/personal data.
- Local domain data must not be lost on an error path.

## Related documents

- `docs/ERROR_HANDLING.md`
- `.workspace/LFI/LOGIC_FLOW_INDEX.md`
- `docs/SECURITY_AND_PRIVACY.md`
