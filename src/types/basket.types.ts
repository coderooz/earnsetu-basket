/** @format */

/**
 * Core domain model for EarnSetu Basket.
 *
 * The browser reference stored records as loosely typed objects with an index
 * signature. The native app keeps the same persisted shape (so the documented
 * backend contract stays valid) but gives every record an explicit type.
 *
 * Money is always an integer number of minor units (paise/cents). Rounding
 * happens once, at the input boundary, and never in display code.
 */

export type BasketResource = "lists" | "items" | "shops" | "purchases";

export const BASKET_RESOURCES: readonly BasketResource[] = [
  "lists",
  "items",
  "shops",
  "purchases",
] as const;

export type SyncStatus = "local" | "pending" | "synced";

export interface PersistedEntity {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: SyncStatus;
}

/** A plan. Lists never create purchases. */
export interface ShoppingList extends PersistedEntity {
  name: string;
  description?: string;
  plannedFor?: string;
  archived: boolean;
  color?: string;
}

/** A single planned entry inside a list. */
export interface ListItem extends PersistedEntity {
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  shopId?: string;
  /** Denormalised shop name so the record stays meaningful without a join. */
  shopName?: string;
  expectedPriceMinor?: number;
  currency?: string;
  checked: boolean;
  position: number;
}

/** A personal shop directory entry. Shops do not require purchases. */
export interface Shop extends PersistedEntity {
  name: string;
  category: string;
  phone?: string;
  address?: string;
  notes?: string;
  favorite?: boolean;
  /** Items the user says this shop sells (never derived from a purchase). */
  soldItems?: string[];
}

/** An explicitly recorded purchase. */
export interface Purchase extends PersistedEntity {
  itemName: string;
  quantity: number;
  unit: string;
  unitPriceMinor: number;
  totalMinor: number;
  currency: string;
  shopId?: string;
  shopName?: string;
  paymentMethod: string;
  notes?: string;
  purchasedAt: string;
  /** Set when the purchase was recorded from a list item. */
  sourceItemId?: string;
}

export interface BasketRecordMap {
  lists: ShoppingList;
  items: ListItem;
  shops: Shop;
  purchases: Purchase;
}

/* -------------------------------------------------------------------------- */
/* Write models                                                               */
/* -------------------------------------------------------------------------- */

export interface ListDraft {
  id?: string;
  name: string;
  description?: string;
  plannedFor?: string;
  archived?: boolean;
  color?: string;
}

export interface ItemDraft {
  id?: string;
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  shopId?: string;
  shopName?: string;
  expectedPriceMinor?: number | null;
  currency?: string;
  checked?: boolean;
  position?: number;
}

export interface ShopDraft {
  id?: string;
  name: string;
  category: string;
  phone?: string;
  address?: string;
  notes?: string;
  favorite?: boolean;
  soldItems?: string[];
}

export type PurchaseDraft = {
  id?: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPriceMinor: number;
  currency: string;
  shopId?: string;
  shopName?: string;
  paymentMethod: string;
  notes?: string;
  purchasedAt: string;
  sourceItemId?: string;
};

/* -------------------------------------------------------------------------- */
/* Derived read models                                                        */
/* -------------------------------------------------------------------------- */

export interface ProductSummary {
  /** Normalised identity key (trimmed, collapsed, lower-cased). */
  key: string;
  name: string;
  listEntryCount: number;
  purchaseCount: number;
  lastPurchasedAt?: string;
  lastUnitPriceMinor?: number;
  currency?: string;
}

export interface ProductProfile {
  summary: ProductSummary;
  listEntries: ListItem[];
  purchases: Purchase[];
  shops: Shop[];
}

export interface DashboardStats {
  activeLists: number;
  uncheckedItems: number;
  estimatedPendingMinor: number;
  monthSpendMinor: number;
  monthPurchaseCount: number;
  todaySpendMinor: number;
  currency: string;
}
