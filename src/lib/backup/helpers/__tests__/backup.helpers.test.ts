/** @format */

import type { BackupCollections } from "../backup.helpers";
import { buildBackup, parseBackup } from "../backup.helpers";

const collections: BackupCollections = {
  lists: [{ id: "l1", name: "Groceries", archived: false }],
  items: [{ id: "i1", listId: "l1", name: "Milk", quantity: 1, unit: "pcs", checked: false, position: 1 }],
  shops: [{ id: "s1", name: "Corner Shop", category: "Grocery" }],
  purchases: [
    {
      id: "p1",
      itemName: "Milk",
      quantity: 1,
      unit: "pcs",
      unitPriceMinor: 4000,
      totalMinor: 4000,
      currency: "INR",
      paymentMethod: "Cash",
      purchasedAt: "2026-01-01T12:00:00Z",
    },
  ],
};

describe("backup helpers", () => {
  describe("buildBackup", () => {
    it("builds a valid backup file", () => {
      const backup = buildBackup(collections);
      expect(backup.app).toBe("earnsetu-basket");
      expect(backup.version).toBe(2);
      expect(backup.lists).toEqual(collections.lists);
      expect(backup.items).toEqual(collections.items);
      expect(backup.shops).toEqual(collections.shops);
      expect(backup.purchases).toEqual(collections.purchases);
      expect(typeof backup.exportedAt).toBe("string");
    });
  });

  describe("parseBackup", () => {
    it("parses a valid backup", () => {
      const backup = buildBackup(collections);
      const parsed = parseBackup(backup);
      expect(parsed.lists).toEqual(collections.lists);
      expect(parsed.items).toEqual(collections.items);
      expect(parsed.shops).toEqual(collections.shops);
      expect(parsed.purchases).toEqual(collections.purchases);
    });

    it("rejects non-earnsetu payloads", () => {
      expect(() => parseBackup({ app: "other", lists: [], items: [], shops: [], purchases: [] })).toThrow(
        "not an EarnSetu Basket backup",
      );
    });

    it("rejects non-object payloads", () => {
      expect(() => parseBackup(null)).toThrow();
      expect(() => parseBackup([1, 2])).toThrow();
    });

    it("rejects invalid record ids", () => {
      const bad = buildBackup({ ...collections, lists: [{ id: "", name: "x", archived: false }] });
      expect(() => parseBackup(bad)).toThrow("valid ID");
    });

    it("rejects invalid list names", () => {
      const bad = buildBackup({ ...collections, lists: [{ id: "l1", name: "   ", archived: false }] });
      expect(() => parseBackup(bad)).toThrow("name");
    });

    it("rejects invalid items", () => {
      const bad = buildBackup({ ...collections, items: [{ id: "i1", name: "", listId: "", quantity: 0, unit: "pcs", checked: false, position: 1 }] });
      expect(() => parseBackup(bad)).toThrow("list item");
    });

    it("rejects invalid purchases", () => {
      const bad = buildBackup({ ...collections, purchases: [{ ...collections.purchases[0], itemName: "" }] });
      expect(() => parseBackup(bad)).toThrow("purchase record");
    });
  });
});
