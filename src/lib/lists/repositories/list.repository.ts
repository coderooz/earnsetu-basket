/** @format */

import {
  allRecords,
  getRecord,
  persistRecord,
  removeRecord,
} from "@/db/local-store";
import type { ShoppingList } from "@/types/basket.types";

export const listRepository = {
  findAll(): Promise<ShoppingList[]> {
    return allRecords<ShoppingList>("lists");
  },

  findById(id: string): Promise<ShoppingList | undefined> {
    return getRecord<ShoppingList>("lists", id);
  },

  async save(record: ShoppingList): Promise<ShoppingList> {
    const result = await persistRecord<ShoppingList>("lists", record);
    return result.record;
  },

  async remove(id: string): Promise<void> {
    await removeRecord("lists", id);
  },
};
