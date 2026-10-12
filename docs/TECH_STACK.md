# Tech Stack — EarnSetu Basket

> Versions are the **installed/declared** versions from `package.json` as inspected on
> **2026-10-11**. The app targets **Expo SDK 57**.

## Core stack

| Concern | Technology | Version | Notes |
|---------|-----------|---------|-------|
| Framework | Expo (managed) | `~57.0.27` | CNG — native projects generated |
| UI runtime | React Native | `0.86.3` | |
| UI library | React | `19.2.3` | |
| Language | TypeScript | `~6.0.3` | strict mode |
| React types | `@types/react` | `~19.2.4` | |
| Babel preset | `babel-preset-expo` | `~57.0.14` | |
| Styling | NativeWind | `^4.2.7` | `className`-based |
| CSS engine | Tailwind CSS | `^3.4.19` | **v3 pinned** (NativeWind v4 requires v3) |
| Tailwind plugin | `tailwindcss-animate` | `^1.0.7` | |
| Tailwind formatter | `prettier-plugin-tailwindcss` | `~0.8.1` | class sorting |
| Navigation | `@react-navigation/native` + `stack` + `bottom-tabs` | `^7.5.0` / `^7.12.0` / `^7.20.0` | bottom tabs with per-tab stacks ([ADR-0003](decisions/ADR-0003_navigation-structure.md)) |
| Local storage | `@react-native-async-storage/async-storage` | `2.2.0` | key/value only |
| Notifications | `expo-notifications` | `~57.0.22` | permission + token only |
| Icons | `@expo/vector-icons` | `^15.1.1` | |
| Status bar | `expo-status-bar` | `~57.0.1` | |
| Splash | `expo-splash-screen` | `~57.0.9` | configured via `app.json` plugin |
| Fonts | `expo-font` | `~57.0.4` | plugin (peer of vector-icons) |
| Animations | `react-native-reanimated` | `4.5.1` | |
| Worklets | `react-native-worklets` | `0.10.1` | Reanimated 4 dependency |
| Gestures | `react-native-gesture-handler` | `~2.32.0` | installed |
| Safe area | `react-native-safe-area-context` | `~5.7.0` | installed |
| Screens | `react-native-screens` | `~4.26.0` | installed |
| Web runtime | `@expo/metro-runtime` | `~57.0.16` | for `web` target |
| Package manager | npm | lockfile `package-lock.json` | |

## Development tooling

| Tool | Version | Purpose |
|------|---------|---------|
| `eslint` | `^9.39.5` | Linting (flat config). **Pinned to 9.x** — ESLint 10 breaks `eslint-plugin-react` peers. |
| `eslint-config-expo` | `~57.0.2` | Expo ESLint preset |
| `@typescript-eslint/parser` | `^8.71.1` | Hoisted so the import plugin can parse TypeScript ([ADR-0004](decisions/ADR-0004_eslint-parser-hoist.md)) |
| `eslint-import-resolver-typescript` | `^4.4.5` | `@/*` alias resolution (also forced via `overrides`) |

There is **no** test runner. Formatting uses the committed `.prettierrc` (Prettier itself
is only present transitively via `prettier-plugin-tailwindcss`, not as a direct
dependency), enforced as advisory in CI (`.github/workflows/ci.yml`), which also runs
typecheck, `expo-doctor`, and lint as required checks.

## Dependency inventory by category

### Required runtime dependencies (used in code or config)

- `expo`, `react`, `react-native`, `babel-preset-expo`
- `nativewind`, `tailwindcss`, `tailwindcss-animate`
- `@react-navigation/native`, `@react-navigation/stack`, `@react-navigation/bottom-tabs`
- `@react-native-async-storage/async-storage`
- `expo-notifications`, `expo-status-bar`, `expo-splash-screen`, `expo-font`
- `@expo/vector-icons`, `@expo/metro-runtime`
- `react-native-reanimated`, `react-native-worklets`

### Installed but currently UNUSED in code

> Classification based on direct code/config inspection (0 references outside
> `package.json`). These are **not** to be assumed functional.

| Package | Version | Note |
|---------|---------|------|
| `@react-navigation/drawer` | `^7.14.3` | no drawer usage |
| `@react-navigation/native-stack` | `^7.20.0` | `stack` used instead |
| `@react-native-masked-view/masked-view` | `0.3.2` | unused |
| `expo-sqlite` | `~57.0.4` | **configured** in `app.json` plugins but **no code** |
| `expo-updates` | `~57.0.25` | no updates config/usage |
| `expo-application` | `~57.0.3` | unused |
| `expo-auth-session` | `~57.0.14` | unused |
| `expo-crypto` | `~57.0.3` | unused |
| `expo-dev-client` | `~57.0.19` | unused (no dev-client config) |
| `expo-device` | `~57.0.2` | unused |
| `expo-linking` | `~57.0.12` | unused (no deep linking) |
| `expo-navigation-bar` | `~57.0.3` | unused |
| `expo-symbols` | `~57.0.3` | unused |
| `react-native-gesture-handler` | `~2.32.0` | no direct import |
| `react-native-safe-area-context` | `~5.7.0` | no direct import |
| `react-native-screens` | `~4.26.0` | no direct import |
| `prettier-plugin-tailwindcss` | `~0.8.1` | listed as a **runtime** dependency, unused/incorrectly placed (should be a devDependency if used) |

> Removing unused dependencies is **out of scope** for the documentation task and would
> require an ADR + verification. Recorded as a finding instead.

## Proposed additions (NOT installed)

The project brief references these directions, but **none are installed or configured**:

| Capability | Proposed technology | Status |
|------------|--------------------|--------|
| Authentication | Clerk (`@clerk/expo`) | Proposed — needs ADR + EarnSetu decision |
| Local database | SQLite (`expo-sqlite`) | Package present but unused; schema undesigned |
| Backend/API client | TBD (depends on EarnSetu backend) | Unresolved |
| Validation | TBD (e.g. Zod) | Not installed |

Any addition must explain the capability provided, why existing packages are insufficient,
and what SDK-compatibility check is required (`npx expo install`). Do not add packages as
part of documentation.

## Compatibility notes

- **Do not upgrade Tailwind to v4** — NativeWind v4 targets Tailwind v3.
- **Do not upgrade ESLint to v10** — `eslint-plugin-react@7.37.5` peer-caps at `^9.7`.
- Add dependencies with `npx expo install <pkg>` to get SDK-57-compatible versions.

## Related documents

- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`DEVELOPMENT_SETUP.md`](DEVELOPMENT_SETUP.md)
- [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md)
