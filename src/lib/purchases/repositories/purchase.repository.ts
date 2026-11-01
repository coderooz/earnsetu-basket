/** @format */

import {
  allRecords,
  getRecord,
  persistRecord,
  removeRecord,
} from "@/db/local-store";
import type { Purchase } from "@/types/basket.types";

export const purchaseRepository = {
  findAll(): Promise<Purchase[]> {
    return allRecords<Purchase>("purchases");
  },

  findById(id: string): Promise<Purchase | undefined> {
    return getRecord<Purchase>("purchases", id);
  },

  async save(record: Purchase): Promise<Purchase> {
    const result = await persistRecord<Purchase>("purchases", record);
    return result.record;
  },

  async remove(id: string): Promise<void> {
    await removeRecord("purchases", id);
  },
};
