/** @format */

import type { ListItem, Purchase } from "@/types/basket.types";
import { buildCatalogue, catalogueNames, buildProductProfile, findRelatedShops } from "../catalogue.helpers";

const items: ListItem[] = [
  { id: "i1", listId: "l1", name: "Rice", quantity: 1, unit: "kg", checked: false, position: 1 },
  { id: "i2", listId: "l1", name: "rice ", quantity: 2, unit: "kg", checked: false, position: 2 },
  { id: "i3", listId: "l2", name: "Dal", quantity: 1, unit: "kg", checked: true, position: 1 },
];
const purchases: Purchase[] = [
  {
    id: "p1",
    itemName: "RICE",
    quantity: 1,
    unit: "kg",
    unitPriceMinor: 8000,
    totalMinor: 8000,
    currency: "INR",
    paymentMethod: "Cash",
    purchasedAt: "2026-06-01T12:00:00Z",
  },
];
const shopList: { id: string; name: string; soldItems?: string[] }[] = [
  { id: "s1", name: "Grocery Mart", soldItems: ["Rice", "Dal"] },
];

describe("catalogue helpers", () => {
  describe("buildCatalogue", () => {
    it("merges items and purchases by normalised name", () => {
      const catalogue = buildCatalogue(items, purchases);
      const rice = catalogue.find((entry) => entry.key === "rice");
      expect(rice).toBeDefined();
      expect(rice!.listEntryCount).toBe(2);
      expect(rice!.purchaseCount).toBe(1);
      expect(rice!.name).toBe("Rice");
    });

    it("keeps purchases without matching items", () => {
      const onlyPurchases = buildCatalogue([], [{ ...purchases[0], itemName: "Sugar" }]);
      const sugar = onlyPurchases.find((entry) => entry.key === "sugar");
      expect(sugar).toBeDefined();
      expect(sugar!.purchaseCount).toBe(1);
    });

    it("sorts alphabetically by name", () => {
      const catalogue = buildCatalogue(items, purchases);
      const names = catalogue.map((entry) => entry.name);
      expect(names).toEqual([...names].sort());
    });
  });

  describe("catalogueNames", () => {
    it("returns unique names across items and purchases", () => {
      expect(catalogueNames(items, purchases)).toEqual(["Dal", "RICE"]);
    });
  });

  describe("findRelatedShops", () => {
    it("finds shops that sell the item", () => {
      const related = findRelatedShops("Rice", purchases, shopList as any);
      expect(related.map((s) => s.id)).toEqual(["s1"]);
    });
  });

  describe("buildProductProfile", () => {
    it("builds a full profile for a product", () => {
      const profile = buildProductProfile("rice", items, purchases, shopList as any);
      expect(profile.summary.key).toBe("rice");
      expect(profile.listEntries.length).toBe(2);
      expect(profile.purchases.length).toBe(1);
    });
  });
});
