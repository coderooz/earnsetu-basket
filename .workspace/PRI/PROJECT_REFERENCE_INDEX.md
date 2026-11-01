# Project Reference Index (PRI)

**Project:** EarnSetu Basket (earnsetu-basket-v2)  
**Version:** 2.0.0 (native re-scaffold)  
**Status:** active  
**Last verified:** 2026-11-01  
**Verification scope:** full  
**Canonical location:** `.workspace/PRI/PROJECT_REFERENCE_INDEX.md`

---

## 1. Project Identity

| Field | Value |
|-------|-------|
| Name | EarnSetu Basket |
| Slug / package | earnsetu-basket / com.coderooz.earnsetubasket |
| Author / Brand | Ranit Saha / Coderooz |
| Contact | contact@coderooz.in |
| License | MIT |
| Entity | Individual (not a company) |

### Related projects (from author profile)
- DocMint (Live, SaaS PDF generation)
- Portfolio (Live, CMS + Portfolio site)
- IndexFusion (Later, SaaS SEO automation)
- EarnSetu (Later, hyperlocal commerce — parent of this basket app)

---

## 2. Technical Stack

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| Framework | Expo (managed) | ~58.0.22 | SDK 58, Continuous Native Generation |
| UI | React Native | 0.88.1 | Hermes |
| Language | TypeScript | ~6.0.3 | strict mode |
| Styling | NativeWind + Tailwind CSS | 5.0.0-rc.0 / 4.3.3 | `global.css`, `nativewind-env.d.ts` |
| Navigation | React Navigation | ^7.x | Stack + bottom tabs (NOT Expo Router) |
| Database | expo-sqlite | ~58.0.15 | SQLite, WAL mode, `user_version` migrations |
| Icons | lucide-react-native | ^1.66.0 | SVG via react-native-svg |
| Crypto | expo-crypto | ~58.0.7 | `randomUUID()` |
| Network | expo-network | ~58.0.4 | connectivity |
| File / share / picker | expo-file-system, expo-sharing, expo-document-picker | ~58.x | backup export/import |
| Fonts / splash / status bar | expo-font, expo-splash-screen, expo-status-bar | ~58.x | config plugins |
| Gestures / screens | react-native-gesture-handler, react-native-screens | ~3.3 / ~4.30 | navigation foundation |
| Safe areas | react-native-safe-area-context | ~5.10.1 | insets |
| Tests | Jest + jest-expo + @testing-library/react-native | ~58 / ^14 | `src/**/__tests__` |
| Lint | ESLint + eslint-config-expo | 8.57 / ~58 | `expo lint` |

### Dependencies NOT used (deliberate)
- Expo Router — replaced by React Navigation per target structure (`src/screens`, `@react-navigation/stack`).
- `@appdeploy/client` — absent; no OAuth client id; no auth provider yet.
- Payments / categories domains — not in the browser app; skipped.

---

## 3. Directory Hierarchy (source of truth)

```
earnsetu-basket-v2/
├── App.tsx                      # App root: DB init -> providers -> navigation
├── index.ts                     # Metro entry (registerRootComponent)
├── app.json                     # Expo config (name, scheme, plugins, owner)
├── global.css                   # Tailwind + NativeWind theme
├── metro.config.js              # withNativeWind
├── tsconfig.json                # path aliases @/*, strict
├── jest.config.js               # test match src/**/__tests__
├── eslint.config.js             # expo flat config
├── nativewind-env.d.ts          # *.css module decl + jest types
├── package.json / package-lock.json
├── assets/                      # icon, splash images
├── .expo/                       # ESLint cache (gitignored)
├── .workspace/                  # governance scratch (gitignored except PRI/LFI)
│   ├── PRI/
│   │   └── PROJECT_REFERENCE_INDEX.md   (this file, committed)
│   └── LFI/                       # logic/behavior map
│       ├── LOGIC_FLOW_INDEX.md
│       ├── DIAGRAMS.md
│       ├── COMPONENT_INTERACTIONS.md
│       └── ERROR_PATHS.md
├── .workspace/examples/         # browser reference source (PRESERVED, never deleted)
│   └── source/                  # original browser App.tsx, lib/, backend/, tests/
├── src/                         # native implementation
│   ├── components/
│   │   ├── common/              # UI primitives (Button, Card, TextField, SelectField, Sheet, …)
│   │   ├── basket/              # domain rows (ItemRow, ListCard, PurchaseRow, ShopRow)
│   │   └── forms/               # modal forms (ListForm, ItemForm, ShopForm, PurchaseForm)
│   ├── context/                 # providers (ThemeProvider, ToastProvider, BasketProvider)
│   ├── hooks/                   # useDebouncedValue
│   ├── lib/
│   │   ├── auth/                # session (repository + service, no provider yet)
│   │   ├── backup/              # export/import (service + helpers)
│   │   ├── common/helpers/      # validation
│   │   ├── items/               # actions, repository, service
│   │   ├── lists/               # actions, repository, service
│   │   ├── products/helpers/    # catalogue.helpers (derived read model)
│   │   ├── purchases/           # actions, repository, service
│   │   ├── settings/            # theme mode, launch flag, selected list id
│   │   ├── shops/               # actions, repository, service
│   │   ├── stats/helpers/       # stats.helpers (dashboard + list progress)
│   │   └── sync/                # sync.service + helpers (outbox, remote)
│   ├── navigation/
│   │   ├── AppNavigation.tsx    # stack + bottom tabs
│   │   └── types.ts             # RootStackParamList, RootTabParamList
│   ├── screens/
│   │   ├── HomeScreen, ItemsScreen, ListDetailScreen, ListsScreen
│   │   ├── PurchasesScreen, ShopsScreen, ShopProfileScreen
│   │   ├── ProductProfileScreen, SettingsScreen, OnboardingScreen, ErrorScreen
│   ├── db/
│   │   ├── connections.ts       # SQLite connection registry
│   │   ├── schema.ts            # DATABASE_SCHEMA (v1 tables)
│   │   ├── index.ts             # initializeDatabase (pragma + migrations)
│   │   ├── local-store.ts       # CRUD + outbox + meta (atomic writes)
│   │   └── migrations/
│   │       ├── 001-initial.ts   # v1 schema
│   │       ├── 002-outbox-resilience.ts # v2 outbox attempts/last_error
│   │       └── index.ts         # MIGRATIONS list + runMigrations
│   ├── types/
│   │   ├── basket.types.ts      # domain + write + derived models
│   │   ├── sync.types.ts        # LocalOperation, SyncSummary, AuthSession, BackupFile
│   │   ├── pages.types.ts, shops.types.ts, user.types.ts, product.types.ts, purchases.types.ts
│   │   └── index.ts
│   ├── constants/
│   │   ├── basket.constants.ts  # units, currencies, shop categories, meta keys, API routes
│   │   ├── pages.constants.ts, product.constants.ts, purchases.constants.ts, shops.constants.ts, user.constants.ts
│   │   └── index.ts
│   └── utils/
│       ├── money.ts, date.ts, text.ts, id.ts, cn.ts
├── .github/                     # issue templates + workflows
└── node_modules/, android/, ios/ (CNG, generated — never hand-edited)
```

---

## 4. Module Boundaries & Ownership

`src/db` is a sibling of `src/lib` and must remain so.

| Layer | Responsibility | May import | May be imported by |
|-------|---------------|------------|--------------------|
| `src/db` | connections, schema, migrations, local-store (atomic writes/outbox/meta) | `expo-sqlite`, `expo-crypto`, `@/types` | `src/lib/*/repositories`, `src/lib/*/services` |
| `src/lib/<domain>/repositories` | domain persistence operations | `src/db/local-store`, `@/types` | `src/lib/<domain>/services` |
| `src/lib/<domain>/services` | business logic | repositories, other domain services (via interface), utils | `src/lib/<domain>/actions`, screens/hooks |
| `src/lib/<domain>/actions` | UI-facing operations | services | screens, components |
| `src/lib/sync` | outbox push/pull, remote merge, idempotency | `src/db/local-store`, `src/lib/auth` | BasketProvider, screens |
| Screens / Components | UI | actions, context, components | — |

Rules enforced:
- Screens do not import `src/db` connections directly.
- Components do not execute database queries.
- Actions contain no extensive business logic.
- Services do not depend on UI/components/React state.
- Repositories do not import UI, screens, or hooks.
- No cross-domain repository access; use domain service interfaces.

---

## 5. Data Model (domain)

Resources: `lists`, `items`, `shops`, `purchases` + `sync_outbox` + `app_meta`.

- `ShoppingList`: id, name, description?, plannedFor?, archived, color?, timestamps, syncStatus.
- `ListItem`: id, listId, name, quantity, unit, notes?, shopId?, shopName?, expectedPriceMinor?, currency?, checked, position, timestamps, syncStatus.
- `Shop`: id, name, category, phone?, address?, notes?, favorite?, soldItems?, timestamps, syncStatus.
- `Purchase`: id, itemName, quantity, unit, unitPriceMinor, totalMinor, currency, shopId?, shopName?, paymentMethod, notes?, purchasedAt, sourceItemId?, timestamps, syncStatus.
- `LocalOperation`: id, resource, action (upsert\|delete), entityId, payload, createdAt, attempts, lastError?.
- `app_meta`: key/value_json (theme, themeMode, selectedListId, hasLaunched, lastSyncedAt, authSession, onboardingVersion).

Derived read model (NOT a synced table): `ProductSummary`/`ProductProfile` keyed by normalised item name across list entries, purchases, and shop catalogues.

Money: integer minor units. Currency default INR. Purchases stored at local noon for correct calendar buckets.

---

## 6. Navigation Structure

React Navigation (stack + 5 bottom tabs), NOT Expo Router.

Tabs: Home, Lists, Items, Shops, Purchases.
Stack screens (modal for Settings): Tabs, ListDetail (`listId`), ProductProfile (`name`), ShopProfile (`shopId`), Settings.

---

## 7. Configuration & Entry Points

| File | Purpose |
|------|---------|
| `index.ts` | `registerRootComponent(App)`, imports `./global.css` |
| `App.tsx` | DB init gate -> providers -> `AppNavigator` / `OnboardingScreen` |
| `app.json` | Expo config, name/scheme/version/owner, config plugins |
| `global.css` | Tailwind + NativeWind imports |
| `metro.config.js` | `withNativeWind(config, { input: './global.css' })` |
| `tsconfig.json` | strict, path aliases `@/*` -> `./src/*`, excludes `.workspace` |
| `jest.config.js` | `jest-expo` preset, testMatch `src/**/__tests__` |

---

## 8. Git & Release

| Field | Value |
|-------|-------|
| Default branch | `master` (unrelated v1 history — do NOT merge) |
| Working branch | `feature/browser-to-expo-native-migration` |
| Baseline commit | `11833db` (snapshot before basket migration) |
| Remote `origin` | `https://github.com/coderooz/earnsetu-basket.git` (added, fetched, NOT pushed) |
| Commit convention | Conventional commits |
| Push policy | Do NOT push without explicit user ask |
| `origin/master` | Read-only reference; v1 SDK 57 / NativeWind 4, unrelated history |

---

## 9. Environment & Secrets

- `EXPO_PUBLIC_API_BASE_URL` — inlined at build time; empty => fully local/guest mode (`SYNC_ENABLED=false`). Never hardcode secrets.
- No auth provider, OAuth client id, or tokens in code.
- `.gitignore` excludes `.workspace/reports/`, `.mcp-runtime.json`, node_modules, android/, ios/, dist/.

---

## 10. Important Constraints & Known Divergences

- **Expo Go compatible**: all dependencies (`expo-sqlite`, `expo-file-system`, `expo-sharing`, `expo-document-picker`, `expo-network`, `expo-crypto`, `react-native-svg`, NativeWind) are JS-only or bundled in Expo Go.
- **Report-location conflict**: governance-mandated `.workspace/reports/{Category}/` + root `REPORT_INDEX.md` vs. requested `.reports/expo-migration/`. Recorded, not silently resolved.
- **Auth limitation**: no provider exists; sync gated on stored `AuthSession`; default local/guest mode.
- **Backend contract**: only `GET /api/basket/:resource` and `POST /api/basket/sync` (idempotency receipts); no invented endpoints.
- **Coalescing rules**: new delete supersedes queued ops for entity; new upsert replaces queued upserts only when no delete queued; upsert after queued delete keeps order.
