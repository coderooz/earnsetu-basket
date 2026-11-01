/** @format */

/**
 * @fileOverview purchase.service
 * @description Business logic for recording purchases. This is the only path
 * that creates a purchase. Validates quantity, unit price, currency, optional
 * shop association, and payment method, then persists via the purchase
 * repository. Purchases are stored at local noon so calendar buckets stay
 * correct for users east of UTC.
 *
 * Notes:
 *   - Checking a list item never creates a purchase; purchases are explicit.
 *   - Expected price (planning) and actual price (purchase) remain separate.
 *   - `totalMinor` is computed as `unitPriceMinor * quantity`.
 *
 * @module src/lib/purchases/services/purchase.service
 * @author Coderooz
 * @see {@link @/lib/purchases/repositories/purchase.repository}
 * @see {@link @/lib/shops/services/shop.service}
 * @see {@link @/utils/date#atLocalNoon}
 */

import {
  optionalText,
  requireNonNegativeMinor,
  requirePositiveNumber,
  requireText,
  ValidationError,
} from "@/lib/common/helpers/validation";
import { shopService } from "@/lib/shops/services/shop.service";
import type { Purchase, PurchaseDraft } from "@/types/basket.types";
import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_UNIT,
} from "@/constants/basket.constants";
import { normaliseIsoTimestamp } from "@/utils/date";
import { newId } from "@/utils/id";

import { purchaseRepository } from "../repositories/purchase.repository";

function normaliseCurrency(value: string | undefined): string {
  const candidate = (value ?? DEFAULT_CURRENCY).toUpperCase();
  return (CURRENCIES as readonly string[]).includes(candidate)
    ? candidate
    : DEFAULT_CURRENCY;
}

export interface ValidatedPurchaseDraft {
  itemName: string;
  quantity: number;
  unit: string;
  unitPriceMinor: number;
  totalMinor: number;
  currency: string;
  shopId?: string;
  shopName?: string;
  paymentMethod: string;
  notes?: string;
  purchasedAt: string;
  sourceItemId?: string;
}

export async function validatePurchaseDraft(
  draft: PurchaseDraft,
): Promise<ValidatedPurchaseDraft> {
  const quantity = requirePositiveNumber(draft.quantity, "Quantity");
  const unitPriceMinor = requireNonNegativeMinor(
    draft.unitPriceMinor,
    "unit price",
  );

  const shopId = draft.shopId?.trim() || undefined;
  let shopName = draft.shopName?.trim() || undefined;
  if (shopId && !shopName) {
    const shop = await shopService.getById(shopId);
    if (!shop) throw new ValidationError("Choose an existing shop.");
    shopName = shop.name;
  }

  return {
    itemName: requireText(draft.itemName, "an item name"),
    quantity,
    unit: (draft.unit ?? DEFAULT_UNIT).trim() || DEFAULT_UNIT,
    unitPriceMinor,
    totalMinor: Math.round(unitPriceMinor * quantity),
    currency: normaliseCurrency(draft.currency),
    shopId,
    shopName,
    paymentMethod: (draft.paymentMethod ?? "Cash").trim() || "Cash",
    notes: optionalText(draft.notes, 500),
    purchasedAt:
      normaliseIsoTimestamp(draft.purchasedAt) ?? new Date().toISOString(),
    sourceItemId: draft.sourceItemId,
  };
}

export const purchaseService = {
  async getAll(): Promise<Purchase[]> {
    const purchases = await purchaseRepository.findAll();
    return purchases.sort((a, b) =>
      b.purchasedAt.localeCompare(a.purchasedAt),
    );
  },

  async getById(id: string): Promise<Purchase | undefined> {
    return purchaseRepository.findById(id);
  },

  async record(draft: PurchaseDraft): Promise<Purchase> {
    const validated = await validatePurchaseDraft(draft);
    const now = new Date().toISOString();

    return purchaseRepository.save({
      id: draft.id ?? newId(),
      ...validated,
      createdAt: now,
      updatedAt: now,
    });
  },

  async remove(id: string): Promise<void> {
    await purchaseRepository.remove(id);
  },
};
