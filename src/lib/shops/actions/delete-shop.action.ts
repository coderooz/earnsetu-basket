/** @format */

import { shopService } from "../services/shop.service";

export async function deleteShopAction(id: string): Promise<void> {
  await shopService.remove(id);
}
