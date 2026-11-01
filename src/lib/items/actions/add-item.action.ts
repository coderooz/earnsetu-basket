/** @format */

import type { ItemDraft, ListItem } from "@/types/basket.types";

import { itemService } from "../services/item.service";

export async function addItemAction(draft: ItemDraft): Promise<ListItem> {
  return itemService.create(draft);
}

export async function addItemsAction(
  listId: string,
  names: readonly string[],
  quantity: number,
  unit: string,
): Promise<ListItem[]> {
  return itemService.addMany(listId, names, quantity, unit);
}
