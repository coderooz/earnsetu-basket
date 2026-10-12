# Contributing to EarnSetu Basket

Thanks for your interest in improving EarnSetu Basket. This project is an early
prototype, so conventions are still forming — please keep changes small, explained, and
consistent with the existing code.

## Before you start

1. Read [`README.md`](README.md) and the documentation index at [`docs/README.md`](docs/README.md).
2. Read [`docs/DEVELOPMENT_SETUP.md`](docs/DEVELOPMENT_SETUP.md) to get a working environment.
3. Check [`docs/KNOWN_LIMITATIONS.md`](docs/KNOWN_LIMITATIONS.md) before assuming something is broken.
4. For AI coding agents, also read [`AGENTS.md`](AGENTS.md).

## Development workflow

```bash
npm install          # installs dependencies (runs expo install --fix)
npm start            # start the Expo dev server
```

Create a feature branch, make your change, and validate it before opening a PR:

```bash
git checkout -b feat/<short-description>
npx tsc --noEmit     # type check — must pass
npx expo-doctor      # dependency/config health — should pass
npm run lint         # linter — must pass (0 problems)
```

> **Lint passes.** `npm run lint` reports 0 problems (fixed 2026-10-11 via
> [ADR-0004](docs/decisions/ADR-0004_eslint-parser-hoist.md)); keep it green.

## Conventions

- **TypeScript strict mode** is enabled. Prefer `interface` for object shapes.
- Use `const`, optional chaining (`?.`) and nullish coalescing (`??`). Never `var`.
- Use **React Navigation** for navigation (the project does not use Expo Router).
- Style with **NativeWind** (`className`) consistent with existing components.
- Follow **Conventional Commits**: `type(scope): message`
  (e.g. `feat(lists): add item reordering`).
- Keep shared UI in `src/components`, domain logic in `src/lib`, screens in `src/screens`.

## What not to do without an approved decision

Do **not** unilaterally:

- Add a new backend, API framework, or external service.
- Add or change an authentication provider.
- Change the state-management or persistence strategy.
- Change database schemas or migrations.
- Upgrade major dependencies (Expo SDK, React Native, React) outside a dedicated task.
- Restructure the project layout.

These require an Architecture Decision Record (ADR) — see
[`docs/decisions/README.md`](docs/decisions/README.md).

## Documentation

- Update the relevant document under `docs/` when behaviour, structure, or setup changes.
- Keep the documentation index ([`docs/README.md`](docs/README.md)) in sync when files
  are added or removed.
- Do not create report/analysis files in the repository root.

## Commits and pull requests

- Do **not** commit secrets, credentials, tokens, or personal data.
- Keep PRs focused and describe the rationale.
- Reference related issues or ADRs where applicable.

## License

By contributing, you agree that your contributions are licensed under the project's
[MIT License](LICENSE).
