/** @format */

import type { Shop, ShopDraft } from "@/types/basket.types";

import { shopService } from "../services/shop.service";

export async function updateShopAction(
  id: string,
  draft: ShopDraft,
): Promise<Shop> {
  return shopService.update(id, draft);
}
