# Build & Release — EarnSetu Basket

> **Status: NO RELEASE INFRASTRUCTURE EXISTS.** The app can be run locally, but there is
> no defined production build/release path.

## 1. Verified current state

| Concern | Reality |
|---------|---------|
| `eas.json` | **Present** (`development` profile only — dev client + internal APK) |
| EAS project id | **Set** (`b66d6d4c-93b2-4a6d-80ce-993c4a037801`, `@coderooz/earnsetu-basket`) |
| Expo owner | `coderooz` (verified via `eas whoami`) |
| Android `package` | **Set** (`com.coderooz.earnsetubasket`) |
| iOS `bundleIdentifier` | **Set** (`com.coderooz.earnsetubasket`) |
| Schemes / deep links | Not configured |
| Signing credentials | EAS-managed (created on first cloud build); none committed |
| CI/CD | **Basic** (`.github/workflows/ci.yml`: typecheck + doctor + lint required) |
| Store listings | None |
| Versioning | `app.json` `1.0.2` vs `package.json` `1.0.0` (inconsistent) |

## 2. What works locally

| Command | Purpose |
|---------|---------|
| `npm start` | Expo dev server |
| `npm run android` | `expo run:android` — local native Android run |
| `npm run ios` | `expo run:ios` — local native iOS run (macOS) |
| `npm run web` | `expo start --web` |
| `npx eas build --platform android --profile development` | EAS cloud development build (dev client APK, internal distribution) |

Native directories (`ios/`, `android/`) are generated on demand (**CNG**) and are not
committed. Never hand-edit them.

## 3. Release path — missing steps

To define a real release process, the following must be decided/added (as an ADR + task):

1. **Application identifiers** — ✅ done: `android.package` and `ios.bundleIdentifier`
   are `com.coderooz.earnsetubasket` (set 2026-10-11).
2. **EAS project** — ✅ done: `@coderooz/earnsetu-basket`
   (`b66d6d4c-93b2-4a6d-80ce-993c4a037801`), linked 2026-10-12.
3. **`eas.json`** — ✅ partial: `development` profile present (dev client + internal APK).
   `preview`/`production` profiles intentionally not configured (no release path yet).
4. **Versioning strategy** — align `app.json` and `package.json`; define
   `version`/`android.versionCode`/`ios.buildNumber` bump rules (or `autoIncrement`).
5. **Signing** — Android keystore and iOS certificates/profiles (managed by EAS or manual).
6. **Environments** — development vs preview vs production configuration separation
   (see [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md)).
7. **CI/CD** — build/validate pipeline (lint, typecheck, doctor, tests).
8. **Release validation** — smoke tests on device, offline checks, crash monitoring.
9. **Rollback/recovery** — how a bad release is reverted; OTA update strategy
   (`expo-updates` is installed but unused).

## 4. Update strategy (proposed)

`expo-updates` is installed (`~57.0.25`) but **not configured**. OTA updates require an
EAS project and an `expo.updates` configuration block. This is **not** in place.

## 5. Recommendation

Do not attempt a store release until identifiers, EAS project, and signing exist. Track
this as a dedicated task; it is out of scope for the documentation pass.

## Related documents

- [`CONFIGURATION.md`](CONFIGURATION.md)
- [`TECH_STACK.md`](TECH_STACK.md)
- [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md)
