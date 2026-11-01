/** @format */

import { itemService } from "@/lib/items/services/item.service";

import { listService } from "../services/list.service";

/**
 * Permanently removes a list and its entries.
 *
 * Only offered for archived lists: the normal flow archives instead, matching
 * the browser application. Each removed entry queues its own delete operation.
 */
export async function deleteListAction(id: string): Promise<void> {
  await itemService.removeByList(id);
  await listService.remove(id);
}
