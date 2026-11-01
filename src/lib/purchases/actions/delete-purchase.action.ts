/** @format */

import { purchaseService } from "../services/purchase.service";

export async function deletePurchaseAction(id: string): Promise<void> {
  await purchaseService.remove(id);
}
