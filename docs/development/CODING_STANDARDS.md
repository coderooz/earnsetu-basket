# Coding Standards — EarnSetu Basket

Conventions for contributing code to this repository. Keep changes small, typed, and
consistent with existing patterns.

## Language & typing

- **TypeScript strict mode** is on. Do not use `any` unless unavoidable and justified.
- Prefer `interface` over `type` for object shapes.
- Prefer `const`; never `var`; avoid `let` unless reassignment is required.
- Use optional chaining (`?.`) and nullish coalescing (`??`) instead of manual checks.
- Give public functions explicit return types where non-obvious.

## React / React Native

- Function components with hooks. No class components.
- Keep components presentational; put logic in hooks/`lib`.
- Avoid inline object/function props in hot paths unless memoised deliberately.
- Handle loading/empty/error states explicitly once features exist.

## Navigation

- Use **React Navigation** (stack) — this project does **not** use Expo Router.
- Define navigators under `src/navigation`, screens under `src/screens`.
- Type route params as the navigation surface grows.

## Styling

- Use **NativeWind** `className`; follow existing component patterns.
- Do not upgrade Tailwind to v4 (NativeWind v4 requires v3).
- Prefer theme tokens over hard-coded values where a theme exists.

## File & naming

- Components/screens: `PascalCase.tsx`.
- Hooks: `useThing.ts` exporting `useThing`.
- Utilities/modules: `camelCase.ts`.
- Keep one primary export per component file.

## Data & state

- Do not build domain persistence on `AsyncStorage` (see
  [`../DATABASE_AND_MIGRATIONS.md`](../DATABASE_AND_MIGRATIONS.md)).
- No direct network calls from components — route through a data-access layer.
- Do not change state/persistence strategy without an ADR.

## Imports

- Use the `@/*` alias for `src/*` imports.
- Avoid deep relative paths.

## Commits

- **Conventional Commits:** `type(scope): message`
  (e.g. `fix(storage): guard against missing key`).
- Keep commits focused; do not bundle unrelated changes.

## Before committing

```bash
npx tsc --noEmit     # must pass
npx expo-doctor      # should pass
npm run lint         # must pass (0 problems)
```

## Prohibited without an ADR + approval

- Adding/changing backend, auth, persistence, state-management, or DB schema.
- Adding dependencies that shape architecture.
- Restructuring the project.
- Editing generated native folders (`ios/`, `android/`) by hand.

## Related documents

- [`FEATURE_DEVELOPMENT.md`](FEATURE_DEVELOPMENT.md)
- [`DOCUMENTATION_STANDARDS.md`](DOCUMENTATION_STANDARDS.md)
- [`../../CONTRIBUTING.md`](../../CONTRIBUTING.md)
