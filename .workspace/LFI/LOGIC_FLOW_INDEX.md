# Logic Flow Index (LFI) — EarnSetu Basket

> **Kind:** Committed project reference system (behavioural).
> **Authority:** Descriptive of the current implementation. If behaviour changes, this must
> change with it. The code is the final arbiter.
> **Companion:** `.workspace/PRI/PROJECT_REFERENCE_INDEX.md` (structure).
> **Status of the app:** prototype scaffold — most product behaviour does **not** exist.

## Stable flow IDs

| ID | Flow | Trigger | Status |
|----|------|---------|--------|
| `LF-001` | App bootstrap & provider mount | App launch | Implemented |
| `LF-002` | Notification permission & push token | `App` mount effect | Implemented (token unused) |
| `LF-003` | First-launch detection | `OnBoardingNavigation` mount | Implemented |
| `LF-004` | Onboarding tour / completion | "Next" / "Get Started" / "Skip" tap | Implemented (UI) |
| `LF-005` | Auth gate (login vs app) | `AuthNavigation` render | Implemented (mock) |
| `LF-006` | Mock login submit | Login button | Implemented (mock) |
| `LF-007` | Signup submit | Create Account button | **Not wired** (no-op) |
| `LF-008` | Tab + in-app navigation | Tab bar / buttons / rows / header icon | Implemented (routing only) |
| `LF-009` | Clear local data | Settings → Developer → "Clear local data" | Implemented (relocated) |
| `LF-010` | Domain flows (lists/items/purchases) | — | **Not implemented** |
| `LF-011` | Forgot-password request | Auth → "Forgot Password?" → Send | Implemented (UI only; logs) |
| `LF-012` | Theme selection | Settings → Appearance option tap | Partial (writes `userData.theme`; not applied) |
| `LF-013` | Notification preference toggles | Settings → Notifications switches | Implemented (local state only) |

---

## LF-001 — App bootstrap & provider mount

1. `index.ts` imports `global.css`, calls `registerRootComponent(App)`.
2. `App` mounts; runs the notification effect (LF-002).
3. `App` renders `<AppProvider><OnBoardingContainer/></AppProvider>`.
4. `AppProvider` renders `Suspense` → `ThemeProvider` → `UserProvider` →
   `NavigationContainer` → children + `<StatusBar hidden/>`.

Files: `index.ts`, `App.tsx`, `src/context/AppProvider.tsx`.

## LF-002 — Notification permission & push token

1. On mount, `App` calls `Notifications.requestPermissionsAsync()`.
2. If status ≠ `granted`, it returns silently.
3. If granted, calls `Notifications.getExpoPushTokenAsync()` and `console.log`s the token.
4. The token is **not stored or sent anywhere**.

Files: `App.tsx`. Note: the async IIFE is not awaited and has no `catch`.

## LF-003 — First-launch detection

1. `OnBoardingNavigation` mounts; reads `storage.get<boolean>("hasLaunched")`.
2. Calls `updateLaunch(firstTime === null)` on the `UserProvider` context.
3. `isFirstLaunch` defaults to `true` and is updated after the async read.

Files: `src/navigation/OnBoardingNavigation.tsx`, `src/context/UserProvider.tsx`,
`src/lib/storage.ts`.

## LF-004 — Onboarding tour / completion

1. On first launch the root gate renders `OnboardingScreen` (a 3-page structural tour).
2. "Next" advances the page; "Get Started" (last page) and "Skip" both complete onboarding.
3. Completion calls `storage.set("hasLaunched", true)` (through the JSON `storage` wrapper)
   then `updateLaunch(false)` → the root gate swaps to `AuthContainer`.

Files: `src/screens/OnboardingScreen.tsx`, `src/navigation/OnBoardingNavigation.tsx`,
`src/lib/storage.ts`.
> Resolved nuance: both the read (LF-003) and the write now go through the `storage`
> wrapper, so the earlier raw-string/JSON mismatch no longer exists. `SplashScreen.tsx` is
> retained but no longer used in the flow.

## LF-005 — Auth gate

1. `AuthNavigation` reads `isAuthenticated` from context.
2. `isAuthenticated` is `!!userData`.
3. If authenticated → `AppNavigationContainer`; else → `AuthScreen`. The `ForgotPassword`
   route is always registered.

Files: `src/navigation/AuthNavigation.tsx`, `src/context/UserProvider.tsx`.

## LF-006 — Mock login submit

1. User submits `LoginForm` → `setUserData({ id, userName, name, clerkId, isLogged,
   image? })` (fabricated; no validation, no network).
2. `userData` becomes defined → `isAuthenticated` true → `AuthNavigation` renders the app.

Files: `src/components/auth/LoginForm.tsx`, `src/context/UserProvider.tsx`.
> Despite the `clerkId` field, **no Clerk integration exists**.

## LF-007 — Signup submit (NOT wired)

`SignupForm`'s "Create Account" button has **no `onPress`** and its inputs are uncontrolled.
Signup does nothing. Files: `src/components/auth/SignupForm.tsx`.

## LF-008 — Tab + in-app navigation

The authenticated shell is a bottom-tab navigator with four tabs (`AppNavigation`), each
owning a stack:

- **HomeTab** (`HomeNavigation`): `Home`, `ProductItem`.
- **PurchaseTab** (`PurchaseNavigation`): `Purchase`, `PurchaseDetail`, `RecordPurchase`,
  `ProductItem`.
- **ProfileTab** (`ProfileNavigation`): `Profile`, `EditProfile`.
- **SettingsTab** (`SettingsNavigation`): `Settings`, `Account`, `Appearance`,
  `NotificationSettings`, `Help`, `About`, `Terms`, `Privacy`, `Licenses`.

Navigation wiring:

- `HomeScreen` "Record purchase" → parent tab `PurchaseTab`; "Browse items" → `ProductItem`.
- `PurchaseScreen` "Record a purchase" / empty-state CTA → `RecordPurchase`.
- `SettingScreen` rows → their named settings screens.
- `ProfileScreen` "Edit profile" → `EditProfile`.
- `LoginForm` "Forgot Password?" → `ForgotPassword` (auth stack).
- `HeaderComponent` settings icon → `SettingsTab` (hard-coded; shown on every stack screen).

Files: `src/navigation/*` (incl. `types.ts`), `src/screens/HomeScreen.tsx`,
`src/screens/PurchaseScreen.tsx`, `src/screens/SettingScreen.tsx`,
`src/screens/ProfileScreen.tsx`, `src/components/Header.tsx`,
`src/components/auth/LoginForm.tsx`.
> All routing is wired; the target screens are structural skeletons (no data/design).

## LF-009 — Clear local data (relocated)

1. `SettingScreen` → Developer → "Clear local data" opens a confirmation `Alert`.
2. Confirming calls `storage.clear()` (clears **all** `AsyncStorage`).

Files: `src/screens/SettingScreen.tsx`, `src/lib/storage.ts`.
> Relocated from the old `HomeScreen` "Clean Logs" button during the screen scaffold
> (ADR-0003); the capability and its effect are unchanged. It still erases `hasLaunched`,
> so the next launch shows onboarding again.

## LF-010 — Domain flows (NOT IMPLEMENTED)

Shopping-list, item, and purchase flows do not exist. Their screens are structural
skeletons only. See `docs/FEATURE_STATUS.md`.

## LF-011 — Forgot-password request (UI only)

1. `LoginForm` "Forgot Password?" → `ForgotPassword` screen.
2. Entering an identifier and tapping "Send reset link" only `console.log`s the value — no
   request is made; "Back to sign in" calls `navigation.goBack()`.

Files: `src/screens/ForgotPasswordScreen.tsx`, `src/components/auth/LoginForm.tsx`.

## LF-012 — Theme selection (partial)

1. `SettingScreen` → Appearance lists Light/Dark/System.
2. Selecting one calls `updateTheme(key)` → writes `userData.theme` (only if a user exists).

Files: `src/screens/AppearanceScreen.tsx`, `src/context/UserProvider.tsx`.
> The theme value is stored but **not applied** anywhere — `ThemeProvider` is still not
> consumed and NativeWind has no dark-mode wiring here.

## LF-013 — Notification preference toggles (local only)

1. `SettingScreen` → Notifications shows three `Switch`es held in component state.
2. Nothing is persisted and nothing schedules notifications.

Files: `src/screens/NotificationSettingsScreen.tsx`.

## Flow index maintenance

- Add an ID when a new behavioural flow is implemented.
- Update the steps and files when behaviour changes.
- Mark flows `Not implemented` rather than omitting planned ones.

## Related documents

- `docs/ARCHITECTURE.md`
- `docs/FEATURE_STATUS.md`
- `.workspace/LFI/DIAGRAMS.md`
- `.workspace/LFI/COMPONENT_INTERACTIONS.md`
- `.workspace/LFI/ERROR_PATHS.md`
