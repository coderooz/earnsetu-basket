/** @format */

import {
  allRecords,
  getRecord,
  persistRecord,
  removeRecord,
} from "@/db/local-store";
import type { ListItem } from "@/types/basket.types";

export const itemRepository = {
  findAll(): Promise<ListItem[]> {
    return allRecords<ListItem>("items");
  },

  async findByList(listId: string): Promise<ListItem[]> {
    const items = await allRecords<ListItem>("items");
    return items
      .filter((item) => item.listId === listId)
      .sort((a, b) => a.position - b.position);
  },

  findById(id: string): Promise<ListItem | undefined> {
    return getRecord<ListItem>("items", id);
  },

  async save(record: ListItem): Promise<ListItem> {
    const result = await persistRecord<ListItem>("items", record);
    return result.record;
  },

  async remove(id: string): Promise<void> {
    await removeRecord("items", id);
  },
};
