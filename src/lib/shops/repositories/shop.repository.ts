/** @format */

import {
  allRecords,
  getRecord,
  persistRecord,
  removeRecord,
} from "@/db/local-store";
import type { Shop } from "@/types/basket.types";

export const shopRepository = {
  findAll(): Promise<Shop[]> {
    return allRecords<Shop>("shops");
  },

  findById(id: string): Promise<Shop | undefined> {
    return getRecord<Shop>("shops", id);
  },

  async save(record: Shop): Promise<Shop> {
    const result = await persistRecord<Shop>("shops", record);
    return result.record;
  },

  async remove(id: string): Promise<void> {
    await removeRecord("shops", id);
  },
};
