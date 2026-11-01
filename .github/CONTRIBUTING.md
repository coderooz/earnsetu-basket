# Contributing to EarnSetu Basket

## Development
- This is an Expo SDK 58 + React Native + TypeScript + NativeWind app.
- Use `npx expo install <package>` to add dependencies (resolves SDK-compatible versions).
- Run `npx tsc --noEmit`, `npx expo lint`, and `npm test` before declaring work done.
- Commits use conventional commits (`type(scope): message`).
- Do not push without explicit request.

## Architecture
- Domain layer: `src/lib/<domain>/{actions,services,repositories}`.
- Persistence: `src/db` (Expo SQLite, versioned migrations, atomic writes + outbox).
- UI: `src/screens`, `src/components/{common,forms,basket}`.
- State: `src/context/{BasketProvider,ThemeProvider,ToastProvider}`.
- Navigation: React Navigation (stack + bottom tabs), not Expo Router.

## Governance
- Reports go to `.workspace/reports/{Category}/` + root `REPORT_INDEX.md` (never repo root).
- PRI/LFI live in `.workspace/PRI/` and `.workspace/LFI/` (committed).
- Browser reference source in `.workspace/examples/` is preserved and never deleted.
- No secrets in code, reports, or MCP memory.
