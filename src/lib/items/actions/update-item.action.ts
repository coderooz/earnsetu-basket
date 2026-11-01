/** @format */

import type { ItemDraft, ListItem } from "@/types/basket.types";

import { itemService } from "../services/item.service";

export async function updateItemAction(
  id: string,
  draft: ItemDraft,
): Promise<ListItem> {
  return itemService.update(id, draft);
}
