/** @format */

import type { ListDraft, ShoppingList } from "@/types/basket.types";

import { listService } from "../services/list.service";

export async function updateListAction(
  id: string,
  draft: ListDraft,
): Promise<ShoppingList> {
  return listService.update(id, draft);
}

export async function archiveListAction(
  id: string,
): Promise<ShoppingList> {
  return listService.setArchived(id, true);
}

export async function restoreListAction(
  id: string,
): Promise<ShoppingList> {
  return listService.setArchived(id, false);
}
