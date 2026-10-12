# ADR-0004: Hoist `@typescript-eslint/parser` to fix the ESLint parse errors

- **Status:** Accepted
- **Date:** 2026-10-11
- **Deciders:** Project maintainer (requested the error be fixed, 2026-10-11); AI agent
  (implementation)
- **Related:** [`../../AGENTS.md`](../../AGENTS.md), [`../TECH_STACK.md`](../TECH_STACK.md),
  [`../TROUBLESHOOTING.md`](../TROUBLESHOOTING.md),
  [`../KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md) (KL-08)

## Context

`npm run lint` (and the editor's ESLint integration) failed with, for every TypeScript
import:

```
Parse errors in imported module '@/…': Cannot find module '@typescript-eslint/parser'
    Require stack:
    - node_modules/eslint-module-utils/module-require.js
    - node_modules/eslint-module-utils/parse.js
    - node_modules/eslint-config-expo/node_modules/eslint-plugin-import/lib/exportMap/builder.js
    …
```

Root cause (verified): `eslint-config-expo@57.0.2` pulls in `@typescript-eslint/parser`
and `eslint-plugin-import`, but npm installed **`@typescript-eslint/parser` nested** at
`node_modules/eslint-config-expo/node_modules/@typescript-eslint/parser` with **no top-level
copy**, while `eslint-module-utils` was hoisted to the top level. `eslint-module-utils`'
`module-require` resolves `@typescript-eslint/parser` **from the top level**, where it did
not exist — so `eslint-plugin-import` could not parse `.ts`/`.tsx` modules. This was the
cause of KL-08's parse-error half.

## Decision

Declare `@typescript-eslint/parser` as a **direct devDependency** at the version
`eslint-config-expo` already resolves (`^8.71.1`), so npm hoists a single top-level copy
that `eslint-module-utils` can resolve.

```bash
npm install --save-dev "@typescript-eslint/parser@^8.71.1"
```

No other dependency, rule, or config change is made. `eslint.config.js` is unchanged.

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| `npm dedupe` only | Does not guarantee a top-level copy when ranges differ; not durable across installs/CI |
| Add an `overrides` entry | Works, but a direct devDependency is simpler, explicit, and self-documenting |
| Copy `@typescript-eslint/parser` into the repo | Never vendor `node_modules` artefacts |
| Disable the `import/*` rules | Silences genuine unresolved-import detection; treats the symptom |
| Pin a different ESLint config | Out of scope; the config is Expo's SDK-57 preset |

## Consequences

**Positive**
- ESLint resolves TypeScript modules; `npx eslint .` now passes with **0 errors and 0
  warnings** (verified 2026-10-11).
- The editor no longer reports `import/namespace` / `import/no-named-as-default*` parse
  errors on every import.

**Negative / risks**
- One additional **devDependency**. It is version-aligned with `eslint-config-expo`
  (`8.71.1`); a future `eslint-config-expo` bump may require re-aligning the range.
- `@typescript-eslint/parser` is not an Expo-managed package, so it is outside
  `expo install`'s SDK-57 pinning; it only affects linting, not the app runtime.

**Neutral**
- No runtime dependency, no app behaviour change, no bundle change.

## Compliance & implementation notes

- `package.json` → `devDependencies` gains `"@typescript-eslint/parser": "^8.71.1"`;
  `package-lock.json` updated.
- Verified: `npx eslint .` → exit 0, no output; `npx tsc --noEmit` → exit 0;
  `npx expo-doctor` → 21/21; `npx expo export --platform android` → exit 0.
- KL-08 is resolved and updated in [`../KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md).

## Superseded / supersedes

- Supersedes: None.
- Superseded by: None.
