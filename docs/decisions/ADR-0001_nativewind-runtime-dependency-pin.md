# ADR-0001: Pin `react-native-css-interop` as a direct dependency (NativeWind v4)

- **Status:** Accepted
- **Date:** 2026-10-11
- **Deciders:** Project maintainer (requested fix); AI agent (implementation)
- **Related:** [`../CONFIGURATION.md`](../CONFIGURATION.md),
  [`../TROUBLESHOOTING.md`](../TROUBLESHOOTING.md),
  [`../KNOWN_LIMITATIONS.md`](../KNOWN_LIMITATIONS.md) (KL-22)

## Context

The app failed to bundle with:

```text
Unable to resolve "react-native-css-interop/jsx-runtime" from "App.tsx"
```

`nativewind@4.2.7` depends on `react-native-css-interop@0.2.7`, which provides the JSX
runtime (`babel.config.js` sets `jsxImportSource: "nativewind"`). npm installed it
**nested** at `node_modules/nativewind/node_modules/react-native-css-interop` with **no
top-level copy**, so Metro (which resolves from the app root) could not find it.

This was reproduced after `npm install`, `npm dedupe`, and a full lockfile regeneration
(delete `package-lock.json` + `npm install`). npm consistently nested the package despite
there being a single dependent and an `install-strategy=hoisted` configuration.

## Decision

We will declare `react-native-css-interop` as an **exact** direct dependency (`0.2.7`, the
version `nativewind@4.2.7` pins), so npm places a single hoisted copy at the project root
that Metro can resolve.

The **exact** pin mirrors NativeWind's own exact pin: a `^0.2.7` range could later resolve
to a newer `0.2.x` while NativeWind still requires `0.2.7`, re-introducing a nested
duplicate.

## Alternatives considered

| Alternative | Why not chosen |
|-------------|----------------|
| Rely on transitive hoisting | Empirically did not hoist; left the app unbundleable |
| Metro `resolver.extraNodeModules` / custom `resolveRequest` | Hides the problem in tooling; harder to reason about |
| Declare it with a `^0.2.7` range | A future `0.2.x` could diverge from NativeWind's exact pin and re-nest |
| Patch `metro.config.js` `nodeModulesPaths` to include the nested path | Fragile; breaks when the nesting path changes |

## Consequences

**Positive**
- Metro bundles successfully (`expo export --platform android` exits 0).
- Deterministic resolution independent of npm's hoisting behaviour.

**Negative / risks**
- An internal NativeWind runtime package now appears in `dependencies`; it must be kept in
  sync with the version `nativewind` expects when NativeWind is upgraded.

**Neutral / follow-ups**
- Re-verify on the next NativeWind/Tailwind upgrade; if npm begins hoisting the package
  natively, this direct dependency may become removable.

## Compliance & implementation notes

- `package.json`: `"react-native-css-interop": "0.2.7"` (exact).
- Clear the Metro cache after the change: `npx expo start -c`.
- Documented in `CONFIGURATION.md`, `TROUBLESHOOTING.md`, `KNOWN_LIMITATIONS.md` (KL-22) and
  `CHANGELOG.md`.

## Superseded / supersedes

- Supersedes: None
- Superseded by: None
