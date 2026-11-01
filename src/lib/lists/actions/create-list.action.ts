/** @format */

import type { ListDraft, ShoppingList } from "@/types/basket.types";

import { listService } from "../services/list.service";

export async function createListAction(draft: ListDraft): Promise<ShoppingList> {
  return listService.create(draft);
}
