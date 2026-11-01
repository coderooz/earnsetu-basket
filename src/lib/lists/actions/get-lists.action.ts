/** @format */

import type { ShoppingList } from "@/types/basket.types";

import { listService } from "../services/list.service";

export async function getListsAction(): Promise<ShoppingList[]> {
  return listService.getAll();
}

export async function getActiveListsAction(): Promise<ShoppingList[]> {
  return listService.getActive();
}

export interface GroupedLists {
  active: ShoppingList[];
  archived: ShoppingList[];
}

export async function getGroupedListsAction(): Promise<GroupedLists> {
  const lists = await listService.getAll();
  return {
    active: lists.filter((list) => !list.archived),
    archived: lists.filter((list) => list.archived),
  };
}
