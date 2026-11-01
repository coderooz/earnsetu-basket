/** @format */

/**
 * @fileOverview catalogue.helpers
 * @description Derived read-model helpers for products. Products are not a
 * synced table; identity is the normalised item name so "Rice", "rice ", and
 * "RICE" share one history across list entries, shop catalogues, and purchases.
 *
 * Provides:
 *   - `buildCatalogue` - aggregates list entries and purchases by normalised name.
 *   - `catalogueNames` - unique display names across items and purchases.
 *   - `findRelatedShops` - shops linked to a product via catalogue or purchase.
 *   - `buildProductProfile` - full profile (summary, entries, purchases, shops).
 *
 * @module src/lib/products/helpers/catalogue.helpers
 * @author Coderooz
 * @see {@link @/lib/products/helpers/catalogue.helpers#buildCatalogue}
 * @see {@link @/utils/text#normaliseNameKey}
 */

import type {
  ListItem,
  ProductProfile,
  ProductSummary,
  Purchase,
  Shop,
} from "@/types/basket.types";
import { normaliseNameKey, uniqueNames } from "@/utils/text";

interface Accumulator {
  key: string;
  name: string;
  listEntryCount: number;
  purchaseCount: number;
  lastPurchasedAt?: string;
  lastUnitPriceMinor?: number;
  currency?: string;
}

function toSummary(accumulator: Accumulator): ProductSummary {
  return { ...accumulator };
}

/**
 * Products are a derived read model, not a synced table.
 *
 * Identity is the normalised name, so "Rice", "rice " and "RICE" are the same
 * product across list entries, shop catalogues and purchases. Renaming one
 * spelling does not split the identity.
 */
export function buildCatalogue(
  items: readonly ListItem[],
  purchases: readonly Purchase[],
): ProductSummary[] {
  const byKey = new Map<string, Accumulator>();

  const ensure = (name: string): Accumulator | undefined => {
    const key = normaliseNameKey(name);
    if (!key) return undefined;
    const existing = byKey.get(key);
    if (existing) return existing;
    const created: Accumulator = {
      key,
      name: name.trim(),
      listEntryCount: 0,
      purchaseCount: 0,
    };
    byKey.set(key, created);
    return created;
  };

  for (const item of items) {
    const entry = ensure(item.name);
    if (entry) entry.listEntryCount += 1;
  }

  for (const purchase of purchases) {
    const entry = ensure(purchase.itemName);
    if (!entry) continue;
    entry.purchaseCount += 1;
    if (
      !entry.lastPurchasedAt ||
      purchase.purchasedAt > entry.lastPurchasedAt
    ) {
      entry.lastPurchasedAt = purchase.purchasedAt;
      entry.lastUnitPriceMinor = purchase.unitPriceMinor;
      entry.currency = purchase.currency;
    }
  }

  return [...byKey.values()]
    .map(toSummary)
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Names available for the "Select items" picker. */
export function catalogueNames(
  items: readonly ListItem[],
  purchases: readonly Purchase[],
): string[] {
  return uniqueNames([
    ...items.map((item) => item.name),
    ...purchases.map((purchase) => purchase.itemName),
  ]);
}

/** Shops linked to a product by manual catalogue entry or a recorded purchase. */
export function findRelatedShops(
  name: string,
  purchases: readonly Purchase[],
  shops: readonly Shop[],
): Shop[] {
  const key = normaliseNameKey(name);
  const purchasedShopIds = new Set(
    purchases
      .filter((purchase) => normaliseNameKey(purchase.itemName) === key)
      .map((purchase) => purchase.shopId)
      .filter((id): id is string => Boolean(id)),
  );
  const purchasedShopNames = new Set(
    purchases
      .filter((purchase) => normaliseNameKey(purchase.itemName) === key)
      .map((purchase) => normaliseNameKey(purchase.shopName ?? ""))
      .filter(Boolean),
  );

  return shops.filter(
    (shop) =>
      (shop.soldItems ?? []).some(
        (soldItem) => normaliseNameKey(soldItem) === key,
      ) ||
      purchasedShopIds.has(shop.id) ||
      purchasedShopNames.has(normaliseNameKey(shop.name)),
  );
}

export function buildProductProfile(
  name: string,
  items: readonly ListItem[],
  purchases: readonly Purchase[],
  shops: readonly Shop[],
): ProductProfile {
  const key = normaliseNameKey(name);
  const summary = buildCatalogue(items, purchases).find(
    (entry) => entry.key === key,
  ) ?? {
    key,
    name: name.trim(),
    listEntryCount: 0,
    purchaseCount: 0,
  };

  return {
    summary,
    listEntries: items.filter((item) => normaliseNameKey(item.name) === key),
    purchases: purchases
      .filter((purchase) => normaliseNameKey(purchase.itemName) === key)
      .sort((a, b) => b.purchasedAt.localeCompare(a.purchasedAt)),
    shops: findRelatedShops(name, purchases, shops),
  };
}
