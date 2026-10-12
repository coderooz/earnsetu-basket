# AGENTS.md — EarnSetu Basket

This file provides operating instructions for AI coding agents working in this
repository. Keep it concise; detailed knowledge lives in [`docs/`](docs/README.md).

## Project identity

- **Application:** EarnSetu Basket — a mobile-first shopping-list & purchase-recording app.
- **Ecosystem:** EarnSetu (parent) — a mature repo at `../../website/LocalCart`
  (GitHub `coderooz/EarnSetu`). Basket is a planned **specialized child/extension app**.
  The parent has real architecture/auth/API, but **no Basket-facing contract exists yet** —
  do not assume shared contracts exist.
- **Status:** Early prototype / pre-alpha scaffold. The shopping-list domain is **not
  implemented**. See [`docs/FEATURE_STATUS.md`](docs/FEATURE_STATUS.md).

## Read before you change anything

1. [`README.md`](README.md) — entry point and status.
2. [`docs/FEATURE_STATUS.md`](docs/FEATURE_STATUS.md) — what actually exists (evidence-based).
3. [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) and [`docs/REPOSITORY_STRUCTURE.md`](docs/REPOSITORY_STRUCTURE.md).
4. [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md) — do not "fix" known, tracked issues blindly.
5. Reference systems: `.workspace/PRI/PROJECT_REFERENCE_INDEX.md` (structure) and `.workspace/LFI/` (behaviour). Load them for navigation; treat the filesystem as truth.

Do not trust training-data memory for Expo/React Native APIs — this project uses
**Expo SDK 57**. Fetch the matching docs (`https://docs.expo.dev/versions/v57.0.0/` or
`https://docs.expo.dev/llms.txt`) before using an API.

## Verified facts you must not contradict

- Navigation is **React Navigation (stack)** — **not** Expo Router. Routes live in
  `src/navigation/*`, screens in `src/screens/*`.
- Styling is **NativeWind** (`className`), Tailwind CSS **v3** (`^3.4.19`). Do not
  upgrade Tailwind to v4 — NativeWind v4 does not support it.
- Local storage is the thin `src/lib/storage.ts` wrapper over `AsyncStorage`. **SQLite is
  installed and configured in `app.json` but not used in code.**
- There is **no** backend, API client, real authentication, or synchronization.
- Entry point is `index.ts` → `App.tsx` → `AppProvider` → `OnBoardingContainer`.

## Commands

Use `npm` (the project has `package-lock.json`; do not switch package managers).

```bash
npm install              # install (runs expo install --fix)
npm start                # Expo dev server
npm run android          # native Android build/run
npm run ios              # native iOS build/run
npm run web              # web target
npx tsc --noEmit         # type check  (must pass)
npx expo-doctor          # dependency/config health (must pass)
npm run lint             # ESLint (must pass — 0 problems)
npx expo install <pkg>   # ALWAYS use this to add a dependency (SDK-compatible versions)
```

Run `npx tsc --noEmit`, `npx expo-doctor`, and `npm run lint` before declaring any task done.

## Rules

- If `ios/` / `android/` directories do not exist, they are generated (CNG). Never edit
  native folders by hand — configure via `app.json` / config plugins.
- Prefer Expo-recommended modules over third-party libraries.
- Do not add dependencies, change auth, change persistence/state strategy, change DB
  schema, or restructure the project without an ADR and explicit approval
  ([`docs/decisions/README.md`](docs/decisions/README.md)).
- Do not commit secrets or `.env` files. Never use `EXPO_PUBLIC_*` for server secrets.
- Follow the repository governance: no report/analysis files in the repository root;
  generated reports go under `.workspace/reports/` with `{CATEGORY}_{DESCRIPTOR}_{YYYYMMDD}.md`
  naming and are indexed in `REPORT_INDEX.md`.
- Update the relevant `docs/` file and the documentation index when you change structure,
  behaviour, or setup.
- Record durable decisions in an ADR; do not present proposals as implemented.
