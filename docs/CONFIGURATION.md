# Configuration — EarnSetu Basket

This document describes the project's configuration surface **without exposing secrets**.
There are currently no secrets in the repository.

## 1. Expo app configuration — `app.json`

| Key | Value | Meaning |
|-----|-------|---------|
| `expo.name` | `earnsetu-basket` | Display name (consider "EarnSetu Basket" later) |
| `expo.slug` | `earnsetu-basket` | Expo project slug |
| `expo.version` | `1.0.2` | App version (note: `package.json` says `1.0.0`) |
| `expo.orientation` | `portrait` | Locked portrait |
| `expo.userInterfaceStyle` | `automatic` | Follows system light/dark |
| `expo.icon` | `./assets/icon.png` | App icon |
| `expo.ios.supportsTablet` | `true` | iOS tablet support |
| `expo.ios.bundleIdentifier` | `com.coderooz.earnsetubasket` | iOS bundle id (added 2026-10-11) |
| `expo.android.package` | `com.coderooz.earnsetubasket` | Android application id (added 2026-10-11) |
| `expo.android.adaptiveIcon` | foreground + `#ffffff` bg | Android adaptive icon |
| `expo.android.predictiveBackGestureEnabled` | `false` | Predictive back off |
| `expo.web.favicon` / `expo.web.bundler` | favicon / `metro` | Web target |
| `expo.plugins` | `expo-sqlite`, `expo-font`, `expo-splash-screen` | Config plugins |

### Notable absences (configuration gaps)

- ~~No `android.package` / `ios.bundleIdentifier`~~ — **resolved (2026-10-11)**: both are set
  to `com.coderooz.earnsetubasket`, required for development/native builds. This is a
  provisional application id and may be changed before the first store submission.
- **No `scheme`** — deep linking is not configured.
- **No `expo.updates`** block, and no EAS project id.
- **No `extra`** / runtime config.
- The `expo-sqlite` plugin is enabled, but SQLite is **not used in code**.

> The `app.json` was corrected during this documentation pass to the **SDK 57** schema
> (moved splash into the `expo-splash-screen` plugin; removed obsolete keys such as
> `newArchEnabled`, `jsEngine`, top-level `splash`, `ios.jsEngine`,
> `android.edgeToEdgeEnabled`). See [`CHANGELOG.md`](../CHANGELOG.md).

## 2. TypeScript — `tsconfig.json`

- `strict` mode enabled.
- Path alias `@/*` → `./src/*` (relative paths; the deprecated `baseUrl` was removed for
  TypeScript 6 compatibility).
- Includes an ambient declaration for `*.css` (`src/types/global.d.ts`) so the
  `import "./global.css"` side-effect import type-checks.

## 3. Babel — `babel.config.js`

- Preset: `babel-preset-expo`.
- NativeWind JSX import source: `nativewind/babel`.
- `react-native-reanimated/plugin` (worklets transform).

## 4. Metro — `metro.config.js`

- Wrapped with `withNativeWind(config, { input: "./global.css" })`.

## 5. Tailwind — `tailwind.config.js` / `postcss.config.js`

- Tailwind **v3**. Content globs cover app source. Do **not** upgrade to v4 (NativeWind v4
  incompatibility).

## 6. ESLint — `eslint.config.js`

- Flat config extending `eslint-config-expo`.
- **Passing** (0 problems). Requires `@typescript-eslint/parser` to stay hoisted as a
  direct devDependency. See [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) and
  [ADR-0004](decisions/ADR-0004_eslint-parser-hoist.md).

## 7. Package manager / Node

- npm with `package-lock.json`. No `engines` field is declared (no enforced Node version).
- `package.json` `prepare` script: `expo install --fix`.
- `react-native-css-interop` is declared as an **exact** direct dependency (`0.2.7`). npm
  otherwise places it **nested** under `node_modules/nativewind/…`, which breaks Metro
  resolution of `react-native-css-interop/jsx-runtime`. See
  [`decisions/ADR-0001`](decisions/ADR-0001_nativewind-runtime-dependency-pin.md).

## 8. Stale metadata (known issue)

`package.json` still carries template metadata that is **incorrect for this project**:

| Field | Current value | Problem |
|-------|---------------|---------|
| `bugs.url` | `…/expo-template-coderooz/issues` | Points at the upstream template |
| `homepage` | `…/expo-template-coderooz#readme` | Points at the upstream template |
| `keywords` | template keywords | Not Basket-specific |
| `author` | `Coderooz <coderooz.dev@gmail.com>` | Verify against official contact |
| `files` | template file list | Relevant only if published (project is `private`) |

Recorded as a finding; correcting it is repository hygiene, not application behaviour.

## 9. Editor & repository automation

| File | Purpose |
|------|---------|
| `.editorconfig` | Cross-editor whitespace/encoding rules (LF, 2-space, final newline) |
| `.gitattributes` | Normalize line endings to LF in-repo; mark binaries/generated files |
| `.prettierrc` / `.prettierignore` | Formatting rules (Prettier + Tailwind class sorting) |
| `.nvmrc` | Node version hint (`22`) |
| `.vscode/*` | Shared editor settings, recommended extensions, debug configs, tasks |
| `.idea/*` | Android Studio (IntelliJ) shared code style + inspection profiles; per-user files ignored |
| `.github/workflows/ci.yml` | CI: typecheck + `expo-doctor` (required), lint + Prettier (advisory) |
| `.github/dependabot.yml` | Weekly dependency + GitHub Actions updates (grouped) |
| `.github/ISSUE_TEMPLATE/*`, `.github/PULL_REQUEST_TEMPLATE.md` | Contribution templates |
| `.github/CODEOWNERS`, `.github/CODE_OF_CONDUCT.md` | Ownership and community policy |
| `.github/assets/banner.svg` | Repository banner used in the README |

See [`DEVELOPMENT_SETUP.md`](DEVELOPMENT_SETUP.md) for editor setup and
[`TESTING.md`](TESTING.md) for the CI behaviour.

## Related documents

- [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md)
- [`DEVELOPMENT_SETUP.md`](DEVELOPMENT_SETUP.md)
- [`BUILD_AND_RELEASE.md`](BUILD_AND_RELEASE.md)
