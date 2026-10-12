# Authentication — EarnSetu Basket

> **Status: NOT IMPLEMENTED.** This document records the current reality (mock UI only),
> the intended direction, and the decisions required before real authentication is built.

## 1. Verified current state

| Concern | Reality |
|---------|---------|
| Identity provider | **None** |
| Sign-in / sign-out | **Mock UI only** — `AuthScreen` renders `LoginForm` / `SignupForm`; on submit they fabricate a local user object and flip an `isAuthenticated` flag |
| Token handling | **None** — no tokens, no secure storage |
| API authentication | **None** — no API calls |
| Server-side verification | **None** — no server |
| Customer ownership | **Undefined** — no ownership model |
| Session lifecycle | **None** — state lives in React context (`UserProvider`) |
| Offline auth | **N/A** (no auth) |
| Security limitations | The mock flow provides **no** security; it must not be mistaken for authentication |

Evidence: `src/screens/AuthScreen.tsx`, `src/components/auth/LoginForm.tsx`,
`src/components/auth/SignupForm.tsx`, `src/context/UserProvider.tsx`,
`src/hooks/UserHook.ts`.

## 2. Intended direction (proposed, unverified)

The project brief indicates **Clerk for Expo (`@clerk/expo`)** as the intended
authentication direction. This is consistent with the parent EarnSetu mobile app, which
already uses **`@clerk/clerk-expo`** (verified in `coderooz/EarnSetu`). This is still a
**proposal** for Basket:

- It is **not installed** here (`@clerk/expo` / `@clerk/clerk-expo` absent from
  `package.json`).
- It has **not** been validated as a Basket-facing contract (no shared Clerk instance or
  tenant decision has been recorded for Basket).
- It needs a publishable key (client-visible, `EXPO_PUBLIC_*`) and, for server-verified
  flows, a backend to validate tokens.

## 3. Decisions required before implementation

Record these as ADRs before writing auth code (see [`decisions/README.md`](decisions/README.md)):

1. Which provider/instance (is there a shared EarnSetu Clerk instance?) and which sign-in
   methods (email/password, OTP, OAuth)?
2. How is the user identity mapped to Basket data ownership (user id as owner key)?
3. How are tokens stored on-device (Expo SecureStore) and refreshed?
4. How does the backend verify tokens and authorize access to a user's data?
5. What happens offline when the session expires?
6. What is the sign-out / data-retention behaviour?

## 4. Security expectations (when implemented)

- Never store credentials or tokens in plain `AsyncStorage`; use secure storage.
- Never put secrets in the client bundle.
- Treat the client as untrusted; enforce ownership/authorization on the server.
- Do not introduce a bespoke auth mechanism — reuse ecosystem capabilities.

## 5. Gap summary

| Item | Status |
|------|--------|
| Real authentication | `NOT_IMPLEMENTED` |
| Identity provider integration | `NOT_IMPLEMENTED` |
| Token storage/refresh | `NOT_IMPLEMENTED` |
| Server-side verification | `NOT_IMPLEMENTED` |
| Ownership enforcement | `NOT_IMPLEMENTED` |

## Related documents

- [`SECURITY_AND_PRIVACY.md`](SECURITY_AND_PRIVACY.md)
- [`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md)
- [`decisions/README.md`](decisions/README.md)
