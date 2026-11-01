/** @format */

import type { Purchase, PurchaseDraft } from "@/types/basket.types";

import { purchaseService } from "../services/purchase.service";

/**
 * The only path that creates a purchase. Checking off a list item must never
 * call this.
 */
export async function recordPurchaseAction(
  draft: PurchaseDraft,
): Promise<Purchase> {
  return purchaseService.record(draft);
}
