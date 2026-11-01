# Component Interactions

**Project:** EarnSetu Basket (earnsetu-basket-v2)  
**Status:** active  
**Last verified:** 2026-11-01

---

## Component Registry

| Component | Purpose | File:Line |
|-----------|---------|-----------|
| App | Root: DB init, providers, navigation gate | `App.tsx:20` |
| AppNavigation | Stack + bottom tabs navigator | `src/navigation/AppNavigation.tsx:77` |
| Tabs | Bottom tab navigator (Home/Lists/Items/Shops/Purchases) | `src/navigation/AppNavigation.tsx:44` |
| HomeScreen | Dashboard: focus list, open items, recent purchases, stats | `src/screens/HomeScreen.tsx` |
| ListsScreen | List index: filter, search, create | `src/screens/ListsScreen.tsx` |
| ListDetailScreen | Single list: progress, items, actions | `src/screens/ListDetailScreen.tsx` |
| ItemsScreen | Product catalogue index | `src/screens/ItemsScreen.tsx` |
| ProductProfileScreen | Product history & associations | `src/screens/ProductProfileScreen.tsx` |
| ShopsScreen | Shop directory index | `src/screens/ShopsScreen.tsx` |
| ShopProfileScreen | Shop details, sold items, purchases | `src/screens/ShopProfileScreen.tsx` |
| PurchasesScreen | Purchase history index | `src/screens/PurchasesScreen.tsx` |
| SettingsScreen | Appearance, sync, backup, clear data | `src/screens/SettingsScreen.tsx` |
| OnboardingScreen | First-launch: model explain + restore | `src/screens/OnboardingScreen.tsx` |
| ErrorScreen | DB-open failure fallback | `src/screens/ErrorScreen.tsx` |
| ListForm | Create/edit shopping list (sheet) | `src/components/forms/ListForm.tsx` |
| ItemForm | Add/edit list item (sheet) | `src/components/forms/ItemForm.tsx` |
| ShopForm | Create/edit shop (sheet) | `src/components/forms/ShopForm.tsx` |
| PurchaseForm | Record purchase (sheet) | `src/components/forms/PurchaseForm.tsx` |
| ItemRow | Single list item row (toggle/buy/edit/delete) | `src/components/basket/ItemRow.tsx` |
| ListCard | Single list card | `src/components/basket/ListCard.tsx` |
| PurchaseRow | Single purchase row | `src/components/basket/PurchaseRow.tsx` |
| ShopRow | Single shop row | `src/components/basket/ShopRow.tsx` |
| Screen / ScreenHeader / Sheet | page layout primitives | `src/components/common/` |
| Button / TextField / SelectField / DateField / SearchField / SegmentedControl / Badge / Card / CheckToggle / EmptyState / StatCard / TextAction / IconButton | UI primitives | `src/components/common/` |

---

## Provider Interactions

### ThemeProvider

**Purpose:** manage appearance theme (system/light/dark) via `Appearance.setColorScheme`.  
**Source:** `src/context/ThemeProvider.tsx`  
**Consumed by:** `AppNavigation` (theme colors), `SettingsScreen` (segmented control).  
**Inputs:** persisted theme mode (`settingsService.getThemeMode`).  
**Outputs:** `mode`, `isDark`, `setMode` via context.

### ToastProvider

**Purpose:** ephemeral bottom toasts.  
**Source:** `src/context/ToastProvider.tsx`  
**Consumed by:** `BasketProvider` (sync/clear data messages), screens/forms.  
**Inputs:** `showToast(message, tone)`.  
**Outputs:** rendered toast element.

### BasketProvider

**Purpose:** central data provider; loads records, derives catalogue/stats, exposes actions + sync.  
**Source:** `src/context/BasketProvider.tsx`  
**Consumed by:** all screens via `useBasket()`.  
**Inputs:** `listService`, `itemService`, `shopService`, `purchaseService`, `syncAll`, `getSyncSnapshot`, `settingsService`, `authService`.  
**Outputs:** `lists/items/shops/purchases`, `catalogue`, `stats`, `refresh`, `syncNow`, `clearLocalData`, `signOut`, `ready`, `refreshing`, `syncing`, `pending`.  
**Error behavior:** renders `ErrorScreen` on DB failure; loading spinner while not ready.

---

## Cross-Domain Service Calls

| Calling service | Called service | Purpose | File:Line |
|-----------------|---------------|---------|-----------|
| itemService | listService | validate listId exists | `item.service.ts:50` |
| itemService | shopService | resolve shopName from shopId | `item.service.ts:56` |
| purchaseService | shopService | resolve shopName from shopId | `purchase.service.ts:56` |
| BasketProvider | buildCatalogue (products) | derive product catalogue | `BasketProvider.tsx:197` |
| BasketProvider | computeDashboardStats (stats) | derive dashboard stats | `BasketProvider.tsx:202` |
| syncService | authService | get session token | `sync.service.ts` |
| backupService | local-store | persist imported records | `backup.service.ts` |
