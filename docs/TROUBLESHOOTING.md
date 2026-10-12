# Troubleshooting — EarnSetu Basket

Common problems and their resolutions.

## Lint passes (resolved 2026-10-11)

**History:** `npm run lint` (and the editor's ESLint) previously reported, on every
TypeScript import:

```
Parse errors in imported module '@/…': Cannot find module '@typescript-eslint/parser'
  Require stack: …/eslint-module-utils/module-require.js → …/eslint-plugin-import/lib/exportMap/builder.js
```

**Cause:** `eslint-config-expo@57.0.2` pulls in `@typescript-eslint/parser` and
`eslint-plugin-import`, but npm installed **`@typescript-eslint/parser` nested** under
`node_modules/eslint-config-expo/node_modules/…` with no top-level copy, while
`eslint-module-utils` was hoisted. The util resolves the parser from the top level, so it
was not found.

**Fix:** declare the parser as a direct devDependency at the same version:

```bash
npm install --save-dev "@typescript-eslint/parser@^8.71.1"
```

**Verified:** `npm run lint` and `npx eslint .` → exit 0, **0 errors / 0 warnings**;
`npx tsc --noEmit` → exit 0. See
[`decisions/ADR-0004`](decisions/ADR-0004_eslint-parser-hoist.md).

**Note — stale ESLint cache (important):** `npm run lint` (`expo lint`) caches results to
`.expo/cache/eslint/`. If lint *re-reports* the `Cannot find module
'@typescript-eslint/parser'` error **after** the fix, it is replaying a stale cache entry
from an earlier run — not a real regression. Clear the cache and re-run:

```powershell
Remove-Item -Recurse -Force .expo/cache/eslint   # Windows PowerShell
npm run lint                                     # -> 0 problems
```

`.expo/` is gitignored, so the cache is local-only. (`npx eslint .` does not use this cache
by default, which is why it can pass while a cached `npm run lint` still fails.)

## `expo-doctor` reports config/plugin problems

**Symptom:** doctor fails checks about `app.json` schema or missing plugins.

**Cause:** invalid/obsolete Expo config keys, or a missing peer plugin.

**Fix:** compare `app.json` against the **SDK 57** schema; ensure config plugins are listed
(e.g. `expo-splash-screen`, `expo-font`); run `npx expo install --fix`. (The repo was
corrected to pass 21/21 during this documentation pass.)

## Dependency version mismatch warnings

**Cause:** packages drifted from the SDK's expected versions.

**Fix:** `npx expo install --fix` (also runs via `npm install` → `prepare`).

## Bundling fails: `Unable to resolve "react-native-css-interop/jsx-runtime"`

**Symptom:** Metro / `expo start` / `expo export` fails with `Unable to resolve
"react-native-css-interop/jsx-runtime" from "App.tsx"` (NativeWind v4).

**Cause:** npm installed `react-native-css-interop` **nested** under
`node_modules/nativewind/…` with no top-level copy, so Metro cannot resolve it from the app
entry point.

**Fix:** declare it as an exact direct dependency at the version NativeWind pins, then clear
the Metro cache:

```bash
npm install react-native-css-interop@0.2.7 --save-exact
npx expo start -c
```

See [`decisions/ADR-0001`](decisions/ADR-0001_nativewind-runtime-dependency-pin.md).

## `CommandError: Required property 'android.package' is not found in the project app.json`

**Symptom:** `expo start` / a development build reports a missing `android.package` (or
`ios.bundleIdentifier`).

**Cause:** a development build (`expo-dev-client`) requires a stable application id that
`app.json` did not define.

**Fix:** set both identifiers in `app.json` (`expo.android.package`,
`expo.ios.bundleIdentifier`); both are now `com.coderooz.earnsetubasket`.

## `@/*` imports unresolved in the editor

**Cause:** TypeScript path mapping vs. editor/ESLint resolver.

**Fix:** confirm `tsconfig.json` has `paths` mapping `@/*` → `./src/*` (no deprecated
`baseUrl`) and that the editor uses the workspace TypeScript.

## Tailwind classes not applied

**Cause:** NativeWind/Tailwind config or the CSS import.

**Check:** `babel.config.js` (nativewind preset), `metro.config.js`
(`withNativeWind`), `global.css` imported in `index.ts`, and `tailwind.config.js` content
globs. Do **not** upgrade Tailwind to v4 (NativeWind v4 needs v3).

## Native build fails / `ios`/`android` mismatch

**Cause:** stale or hand-edited native folders, or missing platform toolchain.

**Fix:** native folders are generated (CNG). Delete and regenerate rather than editing by
hand; verify Android SDK / Xcode is installed.

## App shows a blank screen

Not investigated (no runtime run performed). Candidate causes: navigation not mounted in
a `NavigationContainer`, a throwing provider, or a missing error boundary. Document actual
reproduction before fixing.

## Related documents

- [`DEVELOPMENT_SETUP.md`](DEVELOPMENT_SETUP.md)
- [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md)
- [`CONFIGURATION.md`](CONFIGURATION.md)
