# Environment Variables — EarnSetu Basket

## Current state: none required

The application currently reads **no environment variables**. There is:

- **no `.env` file** and **no `.env.example`**;
- **no `app.config.js` / `app.config.ts`** (only static `app.json`);
- **no `process.env.*` usage** in application code;
- **no `extra` block** in Expo config.

Therefore there is nothing to configure to run the app locally.

## Conventions for when variables are introduced

When environment configuration becomes necessary (e.g. an API URL or a Clerk publishable
key), follow these rules.

### Client-visible variables

Expo exposes only variables prefixed with `EXPO_PUBLIC_` to the client bundle:

| Variable | Purpose | Required | Visibility | Consumed where | Example (placeholder) |
|----------|---------|----------|------------|----------------|-----------------------|
| `EXPO_PUBLIC_API_BASE_URL` | Base URL of the EarnSetu backend | proposed | client-visible | future API client | `https://api.example.invalid` |
| `EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key | proposed | client-visible | future auth | `pk_test_xxxxx` |

> **Security rule:** `EXPO_PUBLIC_*` values are embedded in the client bundle and are
> **not secret**. Never place server credentials, private API keys, or database
> connection strings in `EXPO_PUBLIC_*` variables.

### Server-only variables

Server-only values must never ship in the app bundle. If a backend is added, keep its
secrets in the backend's own secret store (not in this repository).

### Handling rules

- Commit a `.env.example` with **placeholder** values only; never commit real values.
- Add `.env*` to `.gitignore` (the project already ignores env files — verify locally).
- Document the purpose, required-ness, visibility, and consumer of each variable here and
  in [`CONFIGURATION.md`](CONFIGURATION.md).
- Validate at startup and fail fast with a clear message when a required variable is
  missing (define this behaviour when the first variable is added).

## Validation behaviour

Not applicable yet — no variables exist. When the first is added, define what happens when
it is missing (currently undefined).

## Related documents

- [`CONFIGURATION.md`](CONFIGURATION.md)
- [`SECURITY_AND_PRIVACY.md`](SECURITY_AND_PRIVACY.md)
