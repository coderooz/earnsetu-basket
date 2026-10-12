# EarnSetu Basket — Documentation Index

This directory is the authoritative documentation for **EarnSetu Basket**.

> **Read this first:** the project is an **early prototype**. Most product features are
> not implemented. Feature claims in these documents are evidence-based; anything
> unverified is marked as such.

## How to use these docs

- New here? Read [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) → [`ARCHITECTURE.md`](ARCHITECTURE.md) → [`DEVELOPMENT_SETUP.md`](DEVELOPMENT_SETUP.md).
- Checking what exists? [`FEATURE_STATUS.md`](FEATURE_STATUS.md).
- Before changing architecture? [`decisions/README.md`](decisions/README.md).

## Governance & authority

Where documents disagree, prefer, in order:

1. Approved ADRs ([`decisions/`](decisions/)) and explicitly authoritative decisions.
2. Authoritative parent **EarnSetu** *Basket-facing* contracts — **not yet defined**; see
   [`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md).
3. Verified current implementation (the code is the source of truth for what is real).
4. Project architecture/design docs (this directory).
5. Development/operational guides.
6. Roadmaps and proposals ([`ROADMAP.md`](ROADMAP.md)).
7. Historical reports and notes.

An implementation that contradicts an authoritative decision is a **finding to
investigate**, not automatic proof the decision is wrong.

## Index

### Product
| Document | Purpose |
|----------|---------|
| [`PROJECT_OVERVIEW.md`](PROJECT_OVERVIEW.md) | What the project is, why it exists, who it's for |
| [`PRODUCT_SCOPE.md`](PRODUCT_SCOPE.md) | In-scope / out-of-scope, boundaries |
| [`FEATURE_STATUS.md`](FEATURE_STATUS.md) | Evidence-backed feature inventory |
| [`ROADMAP.md`](ROADMAP.md) | Intended direction (proposal, not commitment) |
| [`GLOSSARY.md`](GLOSSARY.md) | Terminology |
| [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md) | Known issues and limitations |

### Architecture
| Document | Purpose |
|----------|---------|
| [`ARCHITECTURE.md`](ARCHITECTURE.md) | Current architecture (verified) |
| [`REPOSITORY_STRUCTURE.md`](REPOSITORY_STRUCTURE.md) | Directory/file map |
| [`TECH_STACK.md`](TECH_STACK.md) | Stack + dependency inventory (incl. unused deps) |
| [`architecture/SYSTEM_CONTEXT.md`](architecture/SYSTEM_CONTEXT.md) | System context |
| [`architecture/COMPONENT_BOUNDARIES.md`](architecture/COMPONENT_BOUNDARIES.md) | Component responsibilities |
| [`architecture/DATA_FLOW.md`](architecture/DATA_FLOW.md) | Data flow (current) |
| [`architecture/INTEGRATION_BOUNDARIES.md`](architecture/INTEGRATION_BOUNDARIES.md) | EarnSetu integration boundaries & gaps |

### Development
| Document | Purpose |
|----------|---------|
| [`DEVELOPMENT_SETUP.md`](DEVELOPMENT_SETUP.md) | Reproducible setup guide |
| [`CONFIGURATION.md`](CONFIGURATION.md) | App/tooling configuration |
| [`ENVIRONMENT_VARIABLES.md`](ENVIRONMENT_VARIABLES.md) | Env vars (none required yet) |
| [`development/CODING_STANDARDS.md`](development/CODING_STANDARDS.md) | Conventions |
| [`development/FEATURE_DEVELOPMENT.md`](development/FEATURE_DEVELOPMENT.md) | How to add a feature |
| [`development/DATABASE_MIGRATIONS.md`](development/DATABASE_MIGRATIONS.md) | Migration rules (no DB yet) |
| [`development/DOCUMENTATION_STANDARDS.md`](development/DOCUMENTATION_STANDARDS.md) | Doc rules |

### Domain / data
| Document | Purpose |
|----------|---------|
| [`AUTHENTICATION.md`](AUTHENTICATION.md) | Auth status (not implemented) |
| [`DATA_MODEL.md`](DATA_MODEL.md) | Data model (proposed only) |
| [`DATABASE_AND_MIGRATIONS.md`](DATABASE_AND_MIGRATIONS.md) | Persistence status |
| [`OFFLINE_FIRST.md`](OFFLINE_FIRST.md) | Offline contract (not implemented) |
| [`SYNCHRONIZATION.md`](SYNCHRONIZATION.md) | Sync design (not implemented) |
| [`API_INTEGRATION.md`](API_INTEGRATION.md) | API integration (none exists) |

### Quality & operations
| Document | Purpose |
|----------|---------|
| [`TESTING.md`](TESTING.md) | Testing status (no tests) |
| [`testing/TEST_STRATEGY.md`](testing/TEST_STRATEGY.md) | Proposed test strategy |
| [`testing/TEST_COVERAGE_MAP.md`](testing/TEST_COVERAGE_MAP.md) | Coverage map |
| [`testing/OFFLINE_TESTING.md`](testing/OFFLINE_TESTING.md) | Offline testing plan |
| [`BUILD_AND_RELEASE.md`](BUILD_AND_RELEASE.md) | Build/release status |
| [`ERROR_HANDLING.md`](ERROR_HANDLING.md) | Error handling (current) |
| [`SECURITY_AND_PRIVACY.md`](SECURITY_AND_PRIVACY.md) | Security/privacy |
| [`TROUBLESHOOTING.md`](TROUBLESHOOTING.md) | Common problems |

### Decisions
| Document | Purpose |
|----------|---------|
| [`decisions/README.md`](decisions/README.md) | ADR index |
| [`decisions/ADR_TEMPLATE.md`](decisions/ADR_TEMPLATE.md) | ADR template |

## Reports

Operational reports (discovery, gap analysis, validation) are **not** stored in `docs/`.
Per repository governance they live under `.workspace/reports/` with
`{CATEGORY}_{DESCRIPTOR}_{YYYYMMDD}.md` naming, and are indexed in the root
[`REPORT_INDEX.md`](../REPORT_INDEX.md).

## Maintenance

- Update the relevant document when structure, behaviour, or setup changes.
- Keep this index in sync when files are added or removed.
- Follow [`development/DOCUMENTATION_STANDARDS.md`](development/DOCUMENTATION_STANDARDS.md).
