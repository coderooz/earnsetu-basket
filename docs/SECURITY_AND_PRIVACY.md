# Security & Privacy — EarnSetu Basket

> **Status: PROTOTYPE.** This documents the current (minimal) security posture, the
> intended requirements, and known gaps. It does **not** claim compliance with any
> standard.

## 1. Current posture

| Concern | Reality |
|---------|---------|
| Backend | None |
| Authentication | None (mock UI only) |
| Authorization/ownership | None |
| Secrets in repository | **None found** (no `.env`, no keys, no tokens) |
| Data stored on device | Onboarding flag + mock state via `AsyncStorage` (unencrypted) |
| Network exposure | None (no app API calls) |
| Input validation | None (mock forms) |
| Logging of sensitive data | Push token is `console.log`ged (device token; low sensitivity but should not be logged in production) |
| Dependency risk | Several unused native packages increase surface without benefit |
| Data retention/deletion | Undefined |

## 2. Threat-relevant gaps (for when features arrive)

| Gap | Impact | Priority |
|-----|--------|----------|
| No authentication/ownership | Any future local data would be unprotected; no server authorization to enforce | CRITICAL (before real data) |
| Local data not encrypted | On a compromised/rooted device, local data is readable | HIGH |
| No token storage strategy | Tokens must use secure storage, never plain `AsyncStorage` | HIGH |
| No server-side authorization | Client cannot be trusted for ownership checks | HIGH |
| Unused native modules | Broader native surface than necessary | MEDIUM |
| Push token logged | Avoid logging tokens in production | LOW |

## 3. Requirements (intended)

- **Authentication:** reuse the ecosystem provider (Clerk direction); do not build bespoke
  auth. See [`AUTHENTICATION.md`](AUTHENTICATION.md).
- **Authorization:** enforce ownership on the server; never rely on client checks alone.
- **Secret handling:** no secrets in the repo or the client bundle; use `EXPO_PUBLIC_*`
  only for non-secret values. See [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md).
- **Local data:** evaluate encryption-at-rest for sensitive fields; store credentials only
  in secure storage (Expo SecureStore).
- **Input validation:** validate all user input on both client and server.
- **Logging:** never log secrets, tokens, or personal data; add crash reporting only with a
  privacy review.
- **Data deletion/retention:** define what is deleted on sign-out and how deletion
  propagates to the server.
- **Dependencies:** keep the dependency set minimal; review additions (each new native
  module is part of the attack surface).

## 4. Secret-handling rules

- Never commit `.env`, API keys, private keys, or tokens.
- If a secret is committed, treat it as compromised: rotate it and purge history.
- `EXPO_PUBLIC_*` values are **not secret** — they are embedded in the client bundle.

## 5. Privacy

- The app currently collects no personal data (no analytics, no accounts).
- When accounts/analytics are introduced, document: what data is collected, where it is
  stored, how long, and how users can delete it.

## 6. Reporting

See [`../SECURITY.md`](../SECURITY.md) for how to report vulnerabilities privately.

## Related documents

- [`AUTHENTICATION.md`](AUTHENTICATION.md)
- [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md)
- [`ERROR_HANDLING.md`](ERROR_HANDLING.md)
