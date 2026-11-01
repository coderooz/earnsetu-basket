/** @format */

import type { Shop } from "@/types/basket.types";

import { shopService } from "../services/shop.service";

/**
 * Adds names to a shop's manual catalogue. This is deliberately separate from
 * recording a purchase.
 */
export async function addShopItemsAction(
  shopId: string,
  names: readonly string[],
): Promise<Shop> {
  return shopService.addSoldItems(shopId, names);
}
