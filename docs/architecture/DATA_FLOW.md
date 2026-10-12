# Data Flow — EarnSetu Basket

## 1. Current data flow (verified)

The app has very little real data flow. The observed flows are:

```mermaid
flowchart LR
    subgraph Startup
        A[App.tsx mount] --> B[requestPermissionsAsync]
        B --> C{granted?}
        C -- no --> D[return]
        C -- yes --> E[getExpoPushTokenAsync]
        E --> F[console.log token]
    end
```

```mermaid
flowchart LR
    subgraph Onboarding
        S[OnboardingScreen] --> G["storage: hasLaunched"]
        G --> H[AsyncStorage read/write]
        S --> N[navigate to Auth or App]
    end
```

```mermaid
flowchart LR
    subgraph Mock auth
        AF[LoginForm / SignupForm submit] --> U[UserProvider state]
        U --> FL[isAuthenticated flag]
        FL --> N[navigate to App]
    end
```

### Summary

| Flow | Source → Sink | Persistence |
|------|---------------|-------------|
| Notification token | `App.tsx` → Expo → console | none |
| Onboarding flag | `OnboardingScreen` → `storage` wrapper → `AsyncStorage` | AsyncStorage |
| Mock user | auth forms → `UserProvider` context | in-memory only |
| Navigation | screens → navigators | in-memory |

There is **no domain data flow** (no lists/items/purchases) and **no network data flow**.

## 2. Intended data flow (proposed — NOT implemented)

```mermaid
flowchart TD
    UI[Screens/Components] --> DL[Domain layer<br/>lists · items · purchases]
    DL --> Repo[Data access / repositories]
    Repo --> LDB[(Local database<br/>offline-first, source of truth)]
    Repo -. when online .-> Sync[Sync engine]
    Sync -.-> API[[EarnSetu backend]]
    LDB --> DL
    DL --> UI

    classDef planned stroke-dasharray: 5 5,fill:#fff,color:#888;
    class Sync,API planned;
```

Key intended properties (to be ratified as ADRs): local-first writes, local reads, pending
change tracking, and conflict-aware sync. See [`../OFFLINE_FIRST.md`](../OFFLINE_FIRST.md)
and [`../SYNCHRONIZATION.md`](../SYNCHRONIZATION.md).

## 3. Data ownership

Undefined today. Intended: each user owns their own lists/purchases; ownership enforced
server-side once auth and a backend exist.

## Related documents

- [`SYSTEM_CONTEXT.md`](SYSTEM_CONTEXT.md)
- [`../ARCHITECTURE.md`](../ARCHITECTURE.md)
- [`../DATA_MODEL.md`](../DATA_MODEL.md)
