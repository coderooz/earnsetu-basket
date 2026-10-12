# Development Setup — EarnSetu Basket

Reproducible local setup for the EarnSetu Basket Expo app.

## 1. Supported environment

- **OS:** developed on Windows (PowerShell); the Expo workflow is cross-platform.
- **Node.js:** 20+ (developed on **v24**).
- **npm:** ships with Node (developed on **npm 12**).
- A mobile target: **Android emulator/device** or **iOS simulator** (iOS requires macOS).
  Web (`npm run web`) is available but incidental.

## 2. Required software

| Software | Purpose |
|----------|---------|
| Node.js + npm | tooling and dependencies |
| Android Studio + SDK, **or** Xcode | native dev builds (`expo run:android` / `expo run:ios`) |
| Expo Go (optional) | quick JS-only preview on a device |

## 3. Repository preparation

```bash
git clone <repository-url>
cd earnsetu-basket
```

> The repository currently has **no configured remote**. If you cloned it, use your own
> path; otherwise work in place.

## 4. Dependency installation

```bash
npm install
```

- The **`prepare` script runs `expo install --fix`**, which aligns packages to the
  installed Expo SDK. This needs network access.
- Always use **npm** (a `package-lock.json` exists). Do not switch package managers.
- To add a dependency, use `npx expo install <pkg>` (SDK-compatible versions).

## 5. Environment configuration

**None required.** There is no `.env`, no `.env.example`, and no environment variable is
read by the code. See [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md).

## 6. Start the app

| Command | Purpose |
|---------|---------|
| `npm start` | Start the Expo dev server (then press `a` / `i` / `w`) |
| `npm run android` | Build & run on Android (`expo run:android`) |
| `npm run ios` | Build & run on iOS (`expo run:ios`) |
| `npm run web` | Run web target (`expo start --web`) |

These scripts exist in `package.json` (verified). They were **not executed end-to-end**
during documentation; treat runtime behaviour as unverified.

## 7. Static checks

```bash
npx tsc --noEmit     # type check   (must pass)
npx expo-doctor      # config/dependency health (must pass)
npm run lint         # ESLint (passes — 0 problems)
```

- `tsc --noEmit` — **passes**.
- `expo-doctor` — **passes 21/21**.
- `npm run lint` — **passes** with 0 errors / 0 warnings (fixed 2026-10-11; see
  [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) and
  [ADR-0004](decisions/ADR-0004_eslint-parser-hoist.md)).

## 8. Editor & IDE setup (`.vscode`)

The repository ships **shared VS Code configuration** (committed, so all contributors get
consistent behaviour):

| File | Purpose |
|------|---------|
| `.vscode/settings.json` | Workspace TypeScript SDK, format-on-save (Prettier), ESLint fix-on-save, Tailwind IntelliSense tuned for NativeWind, spell-check dictionary |
| `.vscode/extensions.json` | Recommended extensions (ESLint, Prettier, Tailwind, Expo Tools, React Native, EditorConfig, Code Spell Checker, GitLens, …) |
| `.vscode/launch.json` | Debug configurations (requires the **React Native Tools** extension) |
| `.vscode/tasks.json` | Tasks: **`validate`** (typecheck + doctor, default build task), `expo: start/run …`, `lint`, `format`, `expo-doctor` |

Supporting config: `.editorconfig`, `.prettierrc`, `.prettierignore`, `.gitattributes`,
`.nvmrc`.

- On opening the folder, VS Code prompts to install the recommended extensions.
- Personal overrides belong in `.vscode/settings.local.json` (gitignored).
- Run the default build task with **Ctrl+Shift+B** (`validate`).

> **Note:** Prettier is currently resolved transitively via `prettier-plugin-tailwindcss`.
> Recommended follow-up: add `prettier` as an explicit devDependency so formatting does not
> depend on a transitive package.

### Android Studio (`.idea/`)

Android Studio is IntelliJ-based; its `.vscode/`-equivalent is the **`.idea/`** project
folder. The repository commits **only the portable, shared** settings:

| `.idea/` file | VS Code counterpart | Purpose |
|---------------|---------------------|---------|
| `codeStyles/Project.xml` + `codeStyleConfig.xml` | `.vscode/settings.json` (formatting) | Language code style (JS/TS/Kotlin/JSON) + "use project settings" |
| `inspectionProfiles/Project_Default.xml` + `profiles_settings.xml` | `.vscode/settings.json` (lint) | Inspection profile selection |
| `.gitignore` | — | Ignores per-user/machine files (`workspace.xml`, `shelf/`, `misc.xml`, …); project settings are tracked |

Android Studio **also reads `.editorconfig` natively** (indentation, charset, line endings),
so both editors share those rules.

> **Important:** this is a **CNG / managed Expo** project — there is no `android/` (Gradle)
> module. Android Studio opens the repo as a *generic* project and is most useful **after
> `npx expo prebuild`** (which generates `android/`), or for SDK/emulator tooling. For
> day-to-day JS/TS work, **VS Code remains the primary editor**.
>
> Optional: switch the keymap to match VS Code via
> `Settings → Keymap → Visual Studio Code`.

## 9. Device / emulator setup

- **Android:** start an AVD or connect a device, then `npm run android`.
- **iOS:** macOS with Xcode, then `npm run ios`.
- Native folders (`ios/`, `android/`) are **generated on demand (CNG)**. Do not edit them
  by hand — configure via `app.json` / config plugins.

## 10. Common setup failures

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| Version-mismatch warnings after install | packages out of SDK alignment | `npx expo install --fix` |
| `expo-doctor` reports config schema errors | invalid `app.json` keys | compare with SDK 57 schema |
| Lint resolver errors (resolved) | ESLint parser/resolver config | see [ADR-0004](decisions/ADR-0004_eslint-parser-hoist.md) |
| Native build fails | missing SDK/Xcode or stale native dirs | regenerate; check platform toolchain |
| `@/*` imports unresolved in editor | TS/ESLint path config | ensure `tsconfig.json` `paths` + resolver |

## 11. First-run checklist

1. `npm install` completes without SDK warnings.
2. `npx tsc --noEmit` passes.
3. `npx expo-doctor` passes.
4. `npm start` opens the dev server; the app boots to the onboarding screen.
5. Navigate onboarding → auth → home (mock flow).

## Related documents

- [`CONFIGURATION.md`](CONFIGURATION.md)
- [`TECH_STACK.md`](TECH_STACK.md)
- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
