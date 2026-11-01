/** @format */

import type { ListItem } from "@/types/basket.types";

import { itemService } from "../services/item.service";

/** Checking an item only updates the plan; it never creates a purchase. */
export async function toggleItemCheckedAction(id: string): Promise<ListItem> {
  return itemService.toggleChecked(id);
}
