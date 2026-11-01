/** @format */

/**
 * @fileOverview stats.helpers
 * @description Derived dashboard and list-progress statistics computed from the
 * same records the user sees (nothing cached separately). Currency is derived
 * from the most recent purchase in the current month, falling back to the
 * default currency.
 *
 * Provides:
 *   - `computeDashboardStats` - active lists, unchecked items, estimated
 *     pending value, month/today spend and counts.
 *   - `computeListProgress` - total/checked/percent for a single list.
 *
 * @module src/lib/stats/helpers/stats.helpers
 * @author Coderooz
 * @see {@link @/utils/date#dateKeyOf}
 */

import { DEFAULT_CURRENCY } from "@/constants/basket.constants";
import type {
  DashboardStats,
  ListItem,
  Purchase,
  ShoppingList,
} from "@/types/basket.types";
import { dateKeyOf, toDateKey } from "@/utils/date";

export interface ListProgress {
  total: number;
  checked: number;
  percent: number;
}

/** Progress of one list, derived from its entries. */
export function computeListProgress(
  items: readonly ListItem[],
  listId: string,
): ListProgress {
  const related = items.filter((item) => item.listId === listId);
  const checked = related.filter((item) => item.checked).length;
  return {
    total: related.length,
    checked,
    percent: related.length ? Math.round((checked / related.length) * 100) : 0,
  };
}

/**
 * Dashboard numbers are derived from the same records the user sees; nothing is
 * cached separately, so a local edit is reflected immediately.
 */
export function computeDashboardStats(
  lists: readonly ShoppingList[],
  items: readonly ListItem[],
  purchases: readonly Purchase[],
  now: Date = new Date(),
): DashboardStats {
  const activeLists = lists.filter((list) => !list.archived);
  const activeListIds = new Set(activeLists.map((list) => list.id));
  const activeItems = items.filter((item) => activeListIds.has(item.listId));
  const uncheckedItems = activeItems.filter((item) => !item.checked);

  const todayKey = toDateKey(now);
  const monthKey = todayKey.slice(0, 7);

  const monthPurchases = purchases.filter(
    (purchase) => dateKeyOf(purchase.purchasedAt).slice(0, 7) === monthKey,
  );
  const todayPurchases = purchases.filter(
    (purchase) => dateKeyOf(purchase.purchasedAt) === todayKey,
  );

  const currency =
    monthPurchases[0]?.currency ??
    purchases[0]?.currency ??
    DEFAULT_CURRENCY;

  return {
    activeLists: activeLists.length,
    uncheckedItems: uncheckedItems.length,
    estimatedPendingMinor: uncheckedItems.reduce(
      (sum, item) => sum + (item.expectedPriceMinor ?? 0) * item.quantity,
      0,
    ),
    monthSpendMinor: monthPurchases.reduce(
      (sum, purchase) => sum + purchase.totalMinor,
      0,
    ),
    monthPurchaseCount: monthPurchases.length,
    todaySpendMinor: todayPurchases.reduce(
      (sum, purchase) => sum + purchase.totalMinor,
      0,
    ),
    currency,
  };
}
