# Repository Structure — EarnSetu Basket

> A structural map, not an exhaustive file inventory. The filesystem is the source of
> truth; this document explains responsibilities and boundaries.

## Top level

| Path | Kind | Responsibility |
|------|------|----------------|
| `index.ts` | handwritten | App entry — imports `global.css`, calls `registerRootComponent(App)` |
| `App.tsx` | handwritten | Root component; notification permission effect; wraps app in `AppProvider` |
| `app.json` | config | Expo app config (name, icon, plugins, platform settings) |
| `package.json` / `package-lock.json` | config | npm manifest + lockfile (npm is the package manager) |
| `tsconfig.json` | config | TypeScript config (strict; `@/*` → `./src/*`) |
| `babel.config.js` | config | Babel preset (`babel-preset-expo`) + NativeWind + Reanimated plugin |
| `metro.config.js` | config | Metro config wrapped with NativeWind |
| `tailwind.config.js` | config | Tailwind v3 theme/content |
| `postcss.config.js` | config | PostCSS (Tailwind) |
| `global.css` | handwritten | Tailwind entry stylesheet, imported by `index.ts` |
| `eslint.config.js` | config | Flat ESLint config extending `eslint-config-expo` |
| `nativewind-env.d.ts` | generated | NativeWind type declarations |
| `AGENTS.md` | docs | AI-agent operating instructions |
| `README.md` | docs | Entry point |
| `CONTRIBUTING.md` / `SECURITY.md` / `CHANGELOG.md` | docs | Project policies/history |
| `LICENSE` | docs | MIT license |
| `template.json` | config | Leftover template metadata from `expo-template-coderooz` |
| `assets/` | binary | App icons/splash images |
| `docs/` | docs | **Authoritative documentation** (this tree) |
| `.workspace/` | governance | PRI/LFI reference systems (committed) + reports (not committed) |
| `.claude/` | config | Claude plugin enablement (`expo` plugin) |
| `.expo/` | generated | Local Expo cache/dev state — **not committed** |
| `node_modules/` | generated | Dependencies — **not committed** |
| `ios/`, `android/` | generated (CNG) | Native projects — **do not exist / never edit by hand** |

## `src/` feature layout

```
src/
├── components/
│   ├── Header.tsx                 # stack header (title + back/settings)
│   ├── Loading.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx          # mock login form (no auth provider)
│   │   └── SignupForm.tsx         # mock signup form
│   ├── common/
│   │   ├── ScreenContainer.tsx    # structural screen wrapper
│   │   ├── SectionCard.tsx        # titled section container
│   │   ├── SettingRow.tsx         # settings-style row
│   │   └── EmptyState.tsx         # empty-state placeholder
│   └── items/
│       └── Button.tsx
├── context/
│   ├── AppProvider.tsx            # composes Theme + User + NavigationContainer
│   ├── ThemeProvider.tsx          # theme context (toggle is a stub; not consumed)
│   ├── UserProvider.tsx           # user context (mock user state)
│   ├── AlertProvider.tsx          # EMPTY (0 bytes) — planned
│   └── ToastProvider.tsx          # EMPTY (0 bytes) — planned
├── hooks/
│   ├── UserHook.ts                # useUserContext
│   └── useStorage.ts              # AsyncStorage-backed state hook
├── lib/
│   ├── storage.ts                 # AsyncStorage wrapper (get/set/update/remove/clear)
│   ├── utils.ts                   # misc helpers (`cn`)
│   ├── connectDb.ts               # EMPTY (0 bytes) — planned DB module
│   └── fetchData.ts               # EMPTY (0 bytes) — planned data-fetch module
├── navigation/
│   ├── types.ts                   # param lists + `*Nav` prop types
│   ├── OnBoardingNavigation.tsx   # root gate: onboarding → auth/app decision
│   ├── AuthNavigation.tsx         # auth gate: Auth/ForgotPassword → app shell
│   ├── AppNavigation.tsx          # bottom tabs (Home/Purchase/Profile/Settings)
│   ├── HomeNavigation.tsx         # Home tab stack
│   ├── PurchaseNavigation.tsx     # Purchase tab stack
│   ├── ProfileNavigation.tsx      # Profile tab stack
│   ├── SettingsNavigation.tsx     # Settings tab stack (+ legal)
│   └── SplashNavigation.tsx       # EMPTY (0 bytes) — superseded
├── screens/                       # 19 routed skeletons + retained SplashScreen
│   ├── OnboardingScreen.tsx       # 3-page first-launch tour
│   ├── SplashScreen.tsx           # retained; no longer routed
│   ├── AuthScreen.tsx             # login/signup container
│   ├── ForgotPasswordScreen.tsx   # reset request (UI only)
│   ├── HomeScreen.tsx             # dashboard skeleton
│   ├── ProductItemScreen.tsx      # product/item detail
│   ├── PurchaseScreen.tsx         # purchase history list
│   ├── PurchaseDetailScreen.tsx   # single purchase
│   ├── RecordPurchaseScreen.tsx   # record-purchase form
│   ├── ProfileScreen.tsx          # profile overview
│   ├── EditProfileScreen.tsx      # edit-profile form
│   ├── SettingScreen.tsx          # settings hub
│   ├── AccountScreen.tsx
│   ├── AppearanceScreen.tsx
│   ├── NotificationSettingsScreen.tsx
│   ├── HelpScreen.tsx
│   ├── AboutScreen.tsx
│   ├── TermsScreen.tsx
│   ├── PrivacyScreen.tsx
│   └── LicensesScreen.tsx
└── types/
    ├── global.d.ts                # ambient types (e.g. `*.css`)
    └── purchase.types.ts          # purchase-type draft (WIP; imported nowhere)
```

## Ownership boundaries (intended, not enforced)

- `src/components` — presentational/shared UI.
- `src/lib` — non-UI logic (storage, utils, future data access).
- `src/screens` + `src/navigation` — routing and screen composition.
- `src/context` — app-wide state.

There is **no `features/` or `domain/` directory**; domain code does not exist yet.

## Generated vs handwritten

| Generated / config-driven | Handwritten |
|---------------------------|-------------|
| `ios/`, `android/` (CNG), `.expo/`, `node_modules/`, `nativewind-env.d.ts`, `package-lock.json` | `index.ts`, `App.tsx`, everything under `src/`, config files, `docs/` |

## Placeholder files (empty, preserved)

`src/context/AlertProvider.tsx`, `src/context/ToastProvider.tsx`,
`src/lib/connectDb.ts`, `src/lib/fetchData.ts`, `src/navigation/SplashNavigation.tsx`.

These are **0-byte** files signalling intended work. They are documented, not deleted.

## Related documents

- [`ARCHITECTURE.md`](ARCHITECTURE.md)
- [`TECH_STACK.md`](TECH_STACK.md)
- `.workspace/PRI/PROJECT_REFERENCE_INDEX.md` (structural reference index)
