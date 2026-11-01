/** @format */

import { itemService } from "../services/item.service";

export async function deleteItemAction(id: string): Promise<void> {
  await itemService.remove(id);
}
