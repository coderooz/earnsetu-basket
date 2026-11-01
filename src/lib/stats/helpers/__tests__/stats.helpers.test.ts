/** @format */

import type { ListItem, Purchase, ShoppingList } from "@/types/basket.types";
import { computeDashboardStats, computeListProgress } from "../stats.helpers";

const now = new Date(2026, 5, 15, 12, 0, 0); // local

const lists: ShoppingList[] = [
  { id: "l1", name: "Active", archived: false },
  { id: "l2", name: "Archived", archived: true },
];
const items: ListItem[] = [
  { id: "i1", listId: "l1", name: "A", quantity: 1, unit: "pcs", checked: false, position: 1 },
  { id: "i2", listId: "l1", name: "B", quantity: 1, unit: "pcs", checked: true, position: 2 },
  { id: "i3", listId: "l2", name: "C", quantity: 1, unit: "pcs", checked: false, position: 1 },
];
const purchases: Purchase[] = [
  {
    id: "p1",
    itemName: "A",
    quantity: 1,
    unit: "pcs",
    unitPriceMinor: 1000,
    totalMinor: 1000,
    currency: "INR",
    paymentMethod: "Cash",
    purchasedAt: "2026-06-15T12:00:00Z",
  },
  {
    id: "p2",
    itemName: "B",
    quantity: 2,
    unit: "pcs",
    unitPriceMinor: 500,
    totalMinor: 1000,
    currency: "INR",
    paymentMethod: "Cash",
    purchasedAt: "2026-06-01T12:00:00Z",
  },
];

describe("stats helpers", () => {
  describe("computeDashboardStats", () => {
    it("computes dashboard numbers", () => {
      const stats = computeDashboardStats(lists, items, purchases, now);
      expect(stats.activeLists).toBe(1);
      expect(stats.uncheckedItems).toBe(1);
      expect(stats.monthSpendMinor).toBe(2000);
      expect(stats.monthPurchaseCount).toBe(2);
      expect(stats.currency).toBe("INR");
    });

    it("uses default currency when there are no purchases", () => {
      const stats = computeDashboardStats(lists, items, [], now);
      expect(stats.currency).toBe("INR");
    });
  });

  describe("computeListProgress", () => {
    it("computes progress for a list", () => {
      const progress = computeListProgress(items, "l1");
      expect(progress.total).toBe(2);
      expect(progress.checked).toBe(1);
      expect(progress.percent).toBe(50);
    });

    it("returns zero progress for an empty list", () => {
      const progress = computeListProgress(items, "empty");
      expect(progress.total).toBe(0);
      expect(progress.checked).toBe(0);
      expect(progress.percent).toBe(0);
    });
  });
});
