# ADR-0002: EarnSetu Basket is a specialized child/extension app of EarnSetu

- **Status:** Accepted
- **Date:** 2026-10-11
- **Deciders:** Project maintainer (direction, stated 2026-10-11); AI agent (documentation)
- **Related:** [`../../AGENTS.md`](../../AGENTS.md),
  [`../architecture/INTEGRATION_BOUNDARIES.md`](../architecture/INTEGRATION_BOUNDARIES.md),
  [`../architecture/SYSTEM_CONTEXT.md`](../architecture/SYSTEM_CONTEXT.md),
  [`../PRODUCT_SCOPE.md`](../PRODUCT_SCOPE.md), [`README.md`](README.md)

## Context

The project brief describes EarnSetu Basket as a mobile-first shopping-list &
purchase-recording app "within the EarnSetu ecosystem". The parent relationship was
previously documented as **UNVERIFIABLE**: an earlier documentation pass cited
`C:\Code_Works\Docs\Projects\EarnSetu` — a three-file placeholder stating
"Architecture: Not started" / "NOT YET DESIGNED" — and concluded the parent had no
published architecture.

On 2026-10-11 the maintainer clarified that EarnSetu Basket **will be a child/extension
app** of the much larger **EarnSetu** project, located at `../../website/LocalCart/`: a
focused, specialized part for users who want only that capability and not the whole app.

Inspection of that location (repo `git@github.com:coderooz/EarnSetu.git`, branch `dev`)
shows the real parent is mature:

- **Website** (`website/`): Next.js 16 (App Router), React 19, Tailwind 4, MongoDB + Mongoose,
  Redis, custom HMAC session auth, Razorpay/PhonePe, Cloudinary, Resend, Sentry; 35+ API
  routes.
- **Mobile app** (`application/`): **Expo SDK 57**, React Native 0.86.3, React 19.2.3,
  NativeWind v4, React Navigation v7, `@clerk/clerk-expo`, `expo-sqlite`, Zustand.
- **Roadmap**: V0 Field Pilot → V1 EarnSetu App → V2 Sync Integration → V3 Full Ecosystem.

Two facts shape the decision:

1. The parent's mobile stack is **the same family as Basket's** (Expo 57, React Navigation,
   NativeWind v4), so integration/code-sharing is technically viable.
2. The parent repository **does not reference "Basket"** anywhere — the child relationship
   is planned, not yet implemented, and no Basket-facing contract exists.

## Decision

EarnSetu Basket is a **separate repository** that is a **specialized child/extension app**
of the parent **EarnSetu** platform (`coderooz/EarnSetu`). Concretely:

- Basket remains a standalone Expo app (it is **not** a subfolder/module of the parent
  monorepo), and owns only the shopping-list and purchase-recording concern.
- Basket **stays stack-aligned** with the parent mobile app (Expo SDK, React Navigation,
  NativeWind) so integration and eventual code-sharing remain possible.
- Basket will **reuse** parent auth/API/sync **only when a Basket-facing contract exists**;
  until then, no integration code is written and no integration is claimed as verified.
- Documentation must describe the parent as **existing and mature**, with the *Basket-facing
  contract* being the missing piece — not the parent architecture.

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Treat Basket as a module/subpackage inside the parent monorepo | Maintainer described a separate child project; no monorepo tooling exists in the parent; would couple release cycles prematurely |
| Fork the parent mobile app and strip it down | Duplicates a large surface (auth, sync, SQLite, Clerk) that Basket should reuse, not copy |
| Merge Basket screens into the parent's mobile app | Contradicts the goal of a small, specialized app for users who want only this capability |
| Keep documenting the parent as "undesigned" | Factually wrong; the parent is mature, and the placeholder docs are not the parent repo |

## Consequences

**Positive**
- Documentation now reflects reality: parent exists; the gap is a **Basket-facing** contract.
- Stack alignment with the parent mobile app is an explicit constraint, reducing future
  integration cost.
- Resolves open decision #1 ("Standalone Expo app vs. shared EarnSetu mobile codebase?") in
  favour of *standalone app that is a specialized child project*.

**Negative / risks**
- Basket cannot deliver ecosystem features (auth, sync, backend) until the parent defines a
  Basket-facing contract.
- Stack drift (e.g. a future SDK bump on either side) must be managed deliberately.

**Neutral / follow-ups**
- Obtain a Basket-facing API/auth/data contract from the parent before writing integration
  code (tracked in [`../architecture/INTEGRATION_BOUNDARIES.md`](../architecture/INTEGRATION_BOUNDARIES.md),
  KL-20).
- Confirm app identifiers: Basket currently uses `com.coderooz.earnsetubasket`; the parent
  mobile app uses `com.earnsetu.localcart`. Revisit before any store submission.

## Compliance & implementation notes

- Corrected: `AGENTS.md`, `README.md`, `docs/ARCHITECTURE.md`,
  `docs/architecture/INTEGRATION_BOUNDARIES.md`,
  `docs/architecture/SYSTEM_CONTEXT.md`, `docs/API_INTEGRATION.md`,
  `docs/AUTHENTICATION.md`, `docs/PROJECT_OVERVIEW.md`, `docs/PRODUCT_SCOPE.md`,
  `docs/ROADMAP.md`, `docs/SYNCHRONIZATION.md`, `docs/KNOWN_LIMITATIONS.md` (KL-20),
  `.workspace/PRI/PROJECT_REFERENCE_INDEX.md`.
- No code, dependency, or behaviour changes are part of this ADR.

## Superseded / supersedes

- Supersedes: None (this corrects earlier *undocumented* assumptions in the docs).
- Superseded by: None
