# Security Policy

## Scope and current security posture

EarnSetu Basket is an **early prototype**. It currently:

- runs entirely on-device with no backend or API;
- performs **no real authentication** (the login/signup forms are UI stubs that fabricate
  a local user object);
- stores only mock/development data via `AsyncStorage`;
- ships **no secrets, credentials, or tokens** in the repository.

Because there is no server, no real user accounts, and no sensitive data flow yet, the
current attack surface is minimal. This will change once authentication, a backend, and
synchronization are introduced — see [`docs/SECURITY_AND_PRIVACY.md`](docs/SECURITY_AND_PRIVACY.md).

## Reporting a vulnerability

Please **do not** open a public GitHub issue for security problems.

Report privately to the maintainer:

- **Email:** contact@coderooz.in
- Alternatively, use GitHub private vulnerability reporting if enabled on the repository.

Include: a description, steps to reproduce, affected files/versions, and potential impact.

We will acknowledge receipt as soon as practical. As this is a pre-release prototype,
there is no formal SLA yet.

## Handling secrets

- Never commit `.env` files, API keys, private keys, or tokens.
- Use `EXPO_PUBLIC_*` variables **only** for values that are safe to expose in a client
  bundle. Never place server credentials there.
- If a secret is committed by accident, treat it as compromised: rotate it immediately and
  purge it from history — removing the file in a later commit is not sufficient.
- Report accidental exposure to the maintainer.

## Supported versions

There are no released versions yet. Security fixes, when applicable, will target the
current development line on `master`.
