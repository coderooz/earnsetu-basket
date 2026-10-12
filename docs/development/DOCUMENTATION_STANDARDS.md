# Documentation Standards — EarnSetu Basket

Rules for writing and maintaining documentation in this repository.

## Principles

1. **Evidence over assumption.** State only what the repository supports. Mark
   implemented vs. proposed vs. unverified explicitly.
2. **No secrets.** Never include real tokens, keys, credentials, `.env` contents, or
   personal data. Use placeholders.
3. **One source of truth.** Do not duplicate content across documents; link instead.
4. **Status honesty.** Do not present proposals as implemented, and do not invent
   API/DB/architecture facts.
5. **Keep it current.** Update docs in the same change as the code they describe.
6. **Proportionate.** Create documents that carry real information; avoid empty
   placeholders.

## Required structure per document

- A title (`#`) and a one-line purpose.
- A status/verification note where claims about implementation are made.
- Sections that are self-contained but cross-link related docs.

## Links

- Use **relative** links between docs (portable across clones).
- Link to code paths as inline code (`` `src/lib/storage.ts` ``).
- Verify links resolve before committing.

## Status vocabulary

Use the shared feature-status labels: `IMPLEMENTED`, `PARTIALLY_IMPLEMENTED`,
`NOT_IMPLEMENTED`, `BLOCKED`, `NOT_APPLICABLE`, `UNVERIFIED`. Mark proposals as
`PROPOSED`.

## Where things go

| Content | Location |
|---------|----------|
| Durable project documentation | `docs/` |
| Architecture decisions | `docs/decisions/` |
| Structural reference index (governance) | `.workspace/PRI/` |
| Behavioural reference index (governance) | `.workspace/LFI/` |
| Operational/analysis reports (not committed) | `.workspace/reports/{Category}/` |
| Report index | root `REPORT_INDEX.md` |

**Do not** create report/analysis files in the repository root.

## Naming

- Docs: `SCREAMING_SNAKE_CASE.md` for top-level docs; `kebab`/`snake` consistent within a
  folder.
- Reports: `{CATEGORY}_{DESCRIPTOR}_{YYYYMMDD}.md`, category matching the directory.

## When code changes

- Update the specific doc(s) for that area.
- Update [`../FEATURE_STATUS.md`](../FEATURE_STATUS.md) if feature status changes.
- Update the index [`../README.md`](../README.md) if files are added/removed.
- Note structural/behavioural changes in [`../../CHANGELOG.md`](../../CHANGELOG.md).

## Review checklist

- [ ] Claims are evidence-based or labelled as proposals
- [ ] No secrets or personal data
- [ ] Relative links resolve
- [ ] No duplicated sources of truth
- [ ] Index updated
- [ ] Status labels used consistently

## Related documents

- [`../../AGENTS.md`](../../AGENTS.md)
- [`../decisions/README.md`](../decisions/README.md)
