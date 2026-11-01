# Logic Flow Index (LFI)

**Project:** EarnSetu Basket (earnsetu-basket-v2)  
**Version:** 1.0  
**Status:** active  
**Created:** 2026-11-01  
**Last verified:** 2026-11-01  
**Verification scope:** full  
**Canonical location:** `.workspace/LFI/LOGIC_FLOW_INDEX.md`

> PRI = structural map ("what exists and where"). LFI = behavioral map ("what happens and how").
> They must never be combined. See `.workspace/PRI/PROJECT_REFERENCE_INDEX.md` for structure.

---

## reference

```yaml
name: LOGIC_FLOW_INDEX
version: 1.0
status: active
created: 2026-11-01
last_verified: 2026-11-01
verification_scope: full
```

---

## 1. System Overview

### What This Project Does

EarnSetu Basket is a personal shopping planner and purchase-recording application. Its core lifecycle:

1. Create or reuse items.
2. Organize items into shopping lists (a plan).
3. Associate shops and expected prices with items.
4. Go shopping.
5. Record actual purchases (explicit operation — checking an item never creates a purchase).
6. Maintain price and purchase history derived from the shared product identity.

Mandatory product rules:
- Planning and purchasing remain separate.
- A product has one identity (normalised name) across list entries, shop associations, and purchase history.
- All information except the item name is optional (name-only items are valid).
- Offline-first: all writes commit locally first; sync is opportunistic and never blocks local use.

### Primary Entry Points

| Entry Point | Trigger | File:Line |
|-------------|---------|-----------|
| App bootstrap | app launch | `App.tsx:20` |
| Database open | `App.start()` | `src/db/index.ts:13` |
| List create/edit | `ListForm.submit` | `src/components/forms/ListForm.tsx` |
| Item add | `ItemForm.submit` | `src/components/forms/ItemForm.tsx` |
| Item toggle | `toggleItemCheckedAction` | `src/lib/items/actions/toggle-item.action.ts` |
| Purchase record | `PurchaseForm.submit` | `src/components/forms/PurchaseForm.tsx` |
| Sync run | `BasketProvider.syncNow` | `src/context/BasketProvider.tsx` |
| Backup export | `SettingsScreen.handleExport` | `src/screens/SettingsScreen.tsx` |
| Backup import | `SettingsScreen.handleImport` | `src/screens/SettingsScreen.tsx` |

### Data Flow Summary

```
UI action (screen/form)
        |
        v
Domain Action (src/lib/<domain>/actions/*.action.ts)
        |
        v
Domain Service (src/lib/<domain>/services/*.service.ts)
        |
        v
Domain Repository (src/lib/<domain>/repositories/*.repository.ts)
        |
        v
src/db/local-store  (atomic: record write + outbox op in one transaction)
        |
        v
Expo SQLite (WAL, user_version migrations)
        |
        v
Sync client (src/lib/sync/services/sync.service.ts)
   push outbox -> POST /api/basket/sync
   pull resources -> GET /api/basket/:resource
```

---

## 2. Execution Paths

### A. Create / edit a shopping list

**Entry:** `src/components/forms/ListForm.tsx:submit`  
**Trigger:** user saves a list in the New/Edit list sheet

```
Step 1: validateListDraft(draft) (src/lib/lists/services/list.service.ts:22)
  =>
Step 2: listRepository.save({...}) (src/lib/lists/repositories/list.repository.ts)
  =>
Step 3: local-store.persistRecord("lists", record) (src/db/local-store.ts:191)
   - writes record with syncStatus="pending"
   - queues upsert operation in sync_outbox (same transaction)
  =>
Step 4: BasketProvider.load() refreshes derived catalogue/stats
```

**Error path:** Validation throws `ValidationError` -> form shows error message; input preserved.

---

### B. Add / edit a list item

**Entry:** `src/components/forms/ItemForm.tsx:submit`  
**Trigger:** user saves an item in the Add/Edit item sheet

```
Step 1: validateItemDraft(draft) (src/lib/items/services/item.service.ts:46)
   - requires existing listId
   - resolves shopName from shopId if needed
   - normalises currency, defaults quantity/unit
  =>
Step 2: itemRepository.save({...})
  =>
Step 3: local-store.persistRecord("items", record) (atomic write + outbox upsert)
  =>
Step 4: BasketProvider.load() refreshes
```

**Error path:** missing list / shop throws `ValidationError`; form error shown, input preserved.

---

### C. Toggle item checked state

**Entry:** `src/components/items/actions/toggle-item.action.ts` (via ItemRow onToggle)  
**Trigger:** user checks/unchecks a list item checkbox

```
Step 1: itemService.toggleChecked(id) (src/lib/items/services/item.service.ts:126)
  =>
Step 2: itemRepository.save({checked: !existing.checked})
  =>
Step 3: local-store.persistRecord("items", record) (atomic write + outbox upsert)
```

**Important:** checking an item never creates a purchase. It only updates the plan.

---

### D. Record a purchase

**Entry:** `src/components/forms/PurchaseForm.tsx:submit`  
**Trigger:** user saves the Record a purchase sheet

```
Step 1: validatePurchaseDraft(draft) (src/lib/purchases/services/purchase.service.ts:44)
   - requires quantity > 0, unitPriceMinor >= 0
   - computes totalMinor = unitPriceMinor * quantity
   - normalises currency, paymentMethod default "Cash"
   - purchasedAt stored at local noon (atLocalNoon)
  =>
Step 2: purchaseRepository.save({...})
  =>
Step 3: local-store.persistRecord("purchases", record) (atomic write + outbox upsert)
  =>
Step 4: BasketProvider.load() refreshes catalogue/stats
```

**Important:** only this explicit form creates a purchase. Checking a list item never does.

---

### E. Sync cycle (push + pull)

**Entry:** `src/context/BasketProvider.tsx:syncNow`  
**Trigger:** opportunistic (launch + foreground resume) or manual "Sync now"

```
Step 1: syncAll() (src/lib/sync/services/sync.service.ts)
   A. Push: for each outbox operation (created_at order):
        - POST /api/basket/sync with idempotency receipt id
        - on 2xx: acknowledgeOperation (delete outbox op + mark record synced)
        - on rejected: keep op queued, record failure, continue
        - on retryable/auth: abort run, report status
   B. Pull: for each resource (lists/items/shops/purchases):
        - GET /api/basket/:resource?limit=&cursor= (paginated)
        - shouldApplyRemoteRecord: apply only if no local copy OR local is synced
          (local-wins; pending local edits never overwritten)
        - saveSyncedRecord (no outbox op queued)
   C. setMeta lastSyncedAt
```

**Merge policy:** local-wins. Remote record applied only when local is absent or already synced.  
**Idempotency:** operation `id` is the receipt; at-least-once delivery, remove only after ack.

---

### F. Backup export / import

**Entry:** `src/screens/SettingsScreen.tsx` (handleExport / handleImport)  
**Trigger:** user taps Export backup / Import backup

Export:
```
Step 1: backup.service.exportBackup()
   - buildBackup(collections) -> BackupFile JSON
   - write to expo-file-system cache dir
   - Sharing.shareAsync (platform share sheet)
```
Import:
```
Step 1: DocumentPicker.getDocumentAsync (application/json)
Step 2: backup.helpers.parseBackup(payload)  -- validates WHOLE file first
   - rejects non-earnsetu, missing ids, invalid names/items/purchases
Step 3: if valid, persistRecord each collection (all-or-nothing)
Step 4: BasketProvider.load() refreshes
```

**Error path:** invalid backup rejected before any write; partial imports never occur.

---

## 3. State Management

| State | Description | Transitions |
|-------|-------------|-------------|
| boot: loading | App initializing database | -> ready on success; -> error on failure |
| boot: ready | providers + navigation mounted | stable until app restarts |
| boot: error | DB open failed | -> loading on retry |
| Basket: ready=false | initial load in flight | -> ready=true on load success |
| Basket: refreshing | manual reload | -> false when load completes |
| Basket: syncing | sync run in flight | -> false when sync completes/fails |
| Outbox op | pending | -> removed after backend ack (upsert -> record synced) |
| Record syncStatus | local | pending | synced | local -> pending on write; pending -> synced on ack |
| Theme mode | system | light | dark | user toggles via Settings; applied via Appearance.setColorScheme |
| hasLaunched | false | true | set true after onboarding done |

---

## 4. External Interactions

### API Calls (Outbound)

| Endpoint | Method | Purpose | File:Line |
|----------|--------|---------|-----------|
| `/api/basket/:resource` | GET | paginated remote records (pull) | `src/lib/sync/helpers/remote.helpers.ts` |
| `/api/basket/sync` | POST | push outbox ops with idempotency receipt | `src/lib/sync/services/sync.service.ts` |

No other backend endpoints are used. No invented endpoints.

### File / Sharing (Outbound)

| Capability | API | Purpose | File:Line |
|------------|-----|---------|-----------|
| expo-file-system | write/read cache | backup export file | `src/lib/backup/services/backup.service.ts` |
| expo-sharing | shareAsync | platform share sheet (backup export) | `src/lib/backup/services/backup.service.ts` |
| expo-document-picker | getDocumentAsync | pick backup JSON to import | `src/lib/backup/services/backup.service.ts` |

---

## 5. Error Paths

| Error Type | Handling | Recovery | File:Line |
|------------|----------|----------|-----------|
| DB open failure | App shows ErrorScreen with retry | retry `start()` | `App.tsx` |
| Validation failure | form shows `ValidationError.message` | user corrects input | each service validate* |
| Sync rejected op | keep op queued + record failure | op retried on next sync | `sync.service.ts` |
| Sync retryable / auth | abort run, report `offline`/`authFailed` | retry when connectivity/session returns | `sync.service.ts` |
| Invalid backup | reject before any write | user picks valid file | `backup.helpers.ts` |
| Missing auth session | sync returns `no-session`, local mode | data stays local | `sync.service.ts` |
| Theme read failure | fall back to system mode | no user impact | `ThemeProvider.tsx` |
