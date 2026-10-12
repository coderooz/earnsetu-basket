# LFI — Diagrams

Behavioural diagrams for the current implementation. All diagrams reflect **verified
code** unless marked `PROPOSED`.

## Navigation decision graph

```mermaid
flowchart TD
    Start([App launch]) --> APP[App.tsx]
    APP --> AP[AppProvider]
    AP --> ONB[OnBoardingNavigation]
    ONB --> Q1{isFirstLaunch?}
    Q1 -- true --> Onb[OnboardingScreen<br/>3-page tour]
    Q1 -- false --> AuthNav[AuthNavigation]
    Onb -- "Get Started / Skip" --> SetFlag["storage.set('hasLaunched', true)"]
    SetFlag --> Q1
    AuthNav --> Q2{isAuthenticated?}
    Q2 -- false --> AuthScreen[AuthScreen<br/>login/signup tabs]
    AuthScreen --> Forgot[ForgotPasswordScreen]
    Q2 -- true --> AppNav[AppNavigation<br/>bottom tabs]
    AppNav --> HomeTab[HomeTab: Home / ProductItem]
    AppNav --> PurchaseTab[PurchaseTab: Purchase / Detail / Record]
    AppNav --> ProfileTab[ProfileTab: Profile / EditProfile]
    AppNav --> SettingsTab[SettingsTab: Settings / Account / Appearance / legal]
```

## Bootstrap sequence

```mermaid
sequenceDiagram
    participant idx as index.ts
    participant app as App.tsx
    participant ns as expo-notifications
    participant ap as AppProvider
    participant onb as OnBoardingNavigation
    participant st as storage (AsyncStorage)

    idx->>app: registerRootComponent(App)
    app->>ns: requestPermissionsAsync()
    alt granted
        app->>ns: getExpoPushTokenAsync()
        ns-->>app: token (console.log)
    else denied
        app-->>app: return
    end
    app->>ap: render <AppProvider>
    ap->>onb: render children
    onb->>st: get("hasLaunched")
    st-->>onb: true | null
    onb->>onb: updateLaunch(firstTime === null)
```

## Login (mock) sequence

```mermaid
sequenceDiagram
    participant u as User
    participant lf as LoginForm
    participant uc as UserContext
    participant an as AuthNavigation

    u->>lf: submit login
    lf->>uc: setUserData(fabricated user)
    uc-->>an: isAuthenticated = true
    an-->>u: render AppNavigation
```

## Storage wrapper contract

```mermaid
flowchart LR
    Hook[useStorage] --> S[lib/storage]
    Onb[OnboardingScreen] --> S
    Nav[OnBoardingNavigation] --> S
    Set[SettingScreen] --> S
    S --> AS[(AsyncStorage)]
    S -. "JSON.stringify / JSON.parse" .-> AS
```

> All current access goes through the `storage` wrapper; the earlier direct-`AsyncStorage`
> write in `SplashScreen` was removed when onboarding moved to `OnboardingScreen`
> (see LF-004).

## Proposed domain data flow

See `docs/architecture/DATA_FLOW.md` (marked `PROPOSED`).

## Related documents

- `.workspace/LFI/LOGIC_FLOW_INDEX.md`
- `.workspace/LFI/COMPONENT_INTERACTIONS.md`
- `docs/architecture/DATA_FLOW.md`
