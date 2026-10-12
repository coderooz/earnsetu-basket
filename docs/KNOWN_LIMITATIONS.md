# Known Limitations — EarnSetu Basket

> Do not "fix" the items below blindly — several are tracked intentional states or
> decisions pending an ADR. This list is evidence-based (see each document for detail).

## Product / functional

| ID | Limitation | Detail |
|----|-----------|--------|
| KL-01 | No shopping-list domain | No lists, items, or purchases exist ([`FEATURE_STATUS.md`](FEATURE_STATUS.md)) |
| KL-02 | No persistence beyond AsyncStorage | No local DB, no schema, no migrations ([`DATABASE_AND_MIGRATIONS.md`](DATABASE_AND_MIGRATIONS.md)) |
| KL-03 | Not actually offline-first | No offline data contract ([`OFFLINE_FIRST.md`](OFFLINE_FIRST.md)) |
| KL-04 | No authentication | Mock UI only ([`AUTHENTICATION.md`](AUTHENTICATION.md)) |
| KL-05 | No backend/API | Zero integration ([`API_INTEGRATION.md`](API_INTEGRATION.md)) |
| KL-06 | No synchronization | No sync engine ([`SYNCHRONIZATION.md`](SYNCHRONIZATION.md)) |
| KL-07 | Five empty placeholder files | `AlertProvider`, `ToastProvider`, `connectDb`, `fetchData`, `SplashNavigation` (0 bytes) — preserved intentionally |

## Tooling / quality

| ID | Limitation | Detail |
|----|-----------|--------|
| KL-08 | ~~Lint fails~~ **Resolved (2026-10-11)** | `@typescript-eslint/parser` was only nested under `eslint-config-expo`; it is now hoisted as a direct devDependency and `npx eslint .` passes with **0 errors / 0 warnings** ([ADR-0004](decisions/ADR-0004_eslint-parser-hoist.md)) |
| KL-09 | No tests | No runner, no files, no coverage ([`TESTING.md`](TESTING.md)) |
| KL-10 | CI is minimal | Typecheck + doctor + lint required; Prettier advisory; no test job ([`TESTING.md`](TESTING.md)) |
| KL-11 | No error boundary / logging | `console.log` only ([`ERROR_HANDLING.md`](ERROR_HANDLING.md)) |

## Configuration / release

| ID | Limitation | Detail |
|----|-----------|--------|
| KL-12 | ~~No app identifiers~~ **Resolved (2026-10-11)** | `android.package` / `ios.bundleIdentifier` set to `com.coderooz.earnsetubasket` |
| KL-13 | No EAS/`eas.json` | No release path ([`BUILD_AND_RELEASE.md`](BUILD_AND_RELEASE.md)) |
| KL-14 | `expo-updates` installed but unused | No OTA strategy |
| KL-15 | Version mismatch | `app.json` `1.0.2` vs `package.json` `1.0.0` |
| KL-16 | Stale `package.json` metadata | `bugs`/`homepage`/`keywords` point at the template repo ([`CONFIGURATION.md`](CONFIGURATION.md)) |
| KL-17 | No GitHub remote | Repository is local-only |
| KL-18 | README/AGENTS were template-oriented | Rewritten in this documentation pass |

## Dependencies

| ID | Limitation | Detail |
|----|-----------|--------|
| KL-19 | Unused dependencies | Several nav/native packages installed but unused; `expo-sqlite` configured but unused; `prettier-plugin-tailwindcss` listed as a runtime dep ([`TECH_STACK.md`](TECH_STACK.md)) |
| KL-22 | NativeWind runtime dep must be pinned | `react-native-css-interop` is declared as an **exact** direct dependency; npm otherwise nests it under `nativewind`, breaking Metro resolution ([ADR-0001](decisions/ADR-0001_nativewind-runtime-dependency-pin.md)) |
| KL-23 | ESLint parser must stay hoisted | `@typescript-eslint/parser` is a direct devDependency so `eslint-module-utils` can resolve it; it must stay version-aligned with `eslint-config-expo` ([ADR-0004](decisions/ADR-0004_eslint-parser-hoist.md)) |

## Ecosystem / documentation

| ID | Limitation | Detail |
|----|-----------|--------|
| KL-20 | Basket-facing integration contract undefined | Parent EarnSetu exists (`coderooz/EarnSetu`, Expo 57 + Next.js) but no Basket-facing API/auth/data contract exists and the parent does not yet reference Basket ([`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md)) |
| KL-21 | Runtime behaviour unverified | No emulator/simulator run performed during documentation |

## Related documents

- [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md)
- [`FEATURE_STATUS.md`](FEATURE_STATUS.md)
- [`TECH_STACK.md`](TECH_STACK.md)
