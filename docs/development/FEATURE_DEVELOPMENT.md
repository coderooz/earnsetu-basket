# Feature Development — EarnSetu Basket

How to add a feature to this project, end to end.

## 0. Prerequisites

- Read [`../ARCHITECTURE.md`](../ARCHITECTURE.md) and [`../FEATURE_STATUS.md`](../FEATURE_STATUS.md).
- For architecture-shaping work (auth, database, backend, state), write an **ADR** first
  ([`../decisions/README.md`](../decisions/README.md)).

## 1. Decide the boundary

Identify where the feature belongs:

- **UI** → `src/components` (presentational) / `src/screens` (composition).
- **Logic** → `src/hooks` or `src/lib`.
- **Domain** → *does not exist yet*; introducing it is an architectural decision (ADR).
- **Data access** → a data-access layer, not screens.

## 2. Model it

- Define types for the data involved (prefer `interface`).
- If it needs storage, confirm the persistence approach is decided (see
  [`../DATABASE_AND_MIGRATIONS.md`](../DATABASE_AND_MIGRATIONS.md)). Do not improvise
  schema on `AsyncStorage`.

## 3. Implement

- Keep the change minimal and consistent with existing patterns
  ([`CODING_STANDARDS.md`](CODING_STANDARDS.md)).
- Use `@/*` imports.
- Handle loading/empty/error states.
- Do not add dependencies casually; if needed, use `npx expo install` and justify it.

## 4. Test

- No test runner exists yet ([`../TESTING.md`](../TESTING.md)). If your feature adds logic,
  note that tests are pending and, where feasible, add them once tooling exists.
- At minimum, verify manually on a device/emulator and document what you ran.

## 5. Document

- Update the affected `docs/` file(s) and the index ([`../README.md`](../README.md)).
- Update [`../FEATURE_STATUS.md`](../FEATURE_STATUS.md) with the feature's status and
  evidence (file paths).
- If the change alters structure or behaviour, note it in [`../../CHANGELOG.md`](../../CHANGELOG.md).

## 6. Validate & commit

```bash
npx tsc --noEmit     # must pass
npx expo-doctor      # should pass
npm run lint         # must pass (0 problems)
git add … && git commit    # conventional commit
```

## Checklist

- [ ] Boundary chosen correctly
- [ ] Types defined
- [ ] No forbidden architectural change without an ADR
- [ ] Loading/empty/error states handled
- [ ] Docs + FEATURE_STATUS updated
- [ ] `tsc --noEmit` and `npm run lint` pass
