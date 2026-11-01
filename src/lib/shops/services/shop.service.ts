/** @format */

/**
 * @fileOverview shop.service
 * @description Business logic for the shop directory. Creates, updates, and
 * deletes shop entries, and merges manually listed sold items into a shop's
 * catalogue. Adding a shop or listing sold items never records a purchase.
 *
 * Notes:
 *   - Shops are optional directory entries; purchases are independent.
 *   - `soldItems` is the user's own note, not inferred from purchase history.
 *
 * @module src/lib/shops/services/shop.service
 * @author Coderooz
 * @see {@link @/lib/shops/repositories/shop.repository}
 * @see {@link @/lib/purchases/services/purchase.service}
 */

import { DEFAULT_SHOP_CATEGORY } from "@/constants/basket.constants";
import {
  optionalText,
  requireIdentifier,
  requireText,
  ValidationError,
} from "@/lib/common/helpers/validation";
import type { Shop, ShopDraft } from "@/types/basket.types";
import { newId } from "@/utils/id";
import { uniqueNames } from "@/utils/text";

import { shopRepository } from "../repositories/shop.repository";

export interface ValidatedShopDraft {
  name: string;
  category: string;
  phone?: string;
  address?: string;
  notes?: string;
  soldItems: string[];
}

export function validateShopDraft(draft: ShopDraft): ValidatedShopDraft {
  return {
    name: requireText(draft.name, "a shop name"),
    category:
      requireText(draft.category || DEFAULT_SHOP_CATEGORY, "a category", 50) ||
      DEFAULT_SHOP_CATEGORY,
    phone: optionalText(draft.phone, 30),
    address: optionalText(draft.address, 200),
    notes: optionalText(draft.notes, 500),
    soldItems: uniqueNames(draft.soldItems ?? []),
  };
}

export const shopService = {
  async getAll(): Promise<Shop[]> {
    const shops = await shopRepository.findAll();
    return shops.sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string): Promise<Shop | undefined> {
    return shopRepository.findById(id);
  },

  async create(draft: ShopDraft): Promise<Shop> {
    const validated = validateShopDraft(draft);
    const now = new Date().toISOString();

    return shopRepository.save({
      id: draft.id ?? newId(),
      ...validated,
      favorite: draft.favorite ?? false,
      createdAt: now,
      updatedAt: now,
    });
  },

  async update(id: string, draft: ShopDraft): Promise<Shop> {
    requireIdentifier(id, "a shop");
    const existing = await shopRepository.findById(id);
    if (!existing) throw new ValidationError("This shop no longer exists.");

    const validated = validateShopDraft({ ...draft, name: draft.name });

    return shopRepository.save({
      ...existing,
      ...validated,
      favorite: draft.favorite ?? existing.favorite ?? false,
      updatedAt: new Date().toISOString(),
    });
  },

  /** Merge items into the shop's manual catalogue without touching purchases. */
  async addSoldItems(id: string, names: readonly string[]): Promise<Shop> {
    const existing = await shopRepository.findById(id);
    if (!existing) throw new ValidationError("This shop no longer exists.");

    return shopRepository.save({
      ...existing,
      soldItems: uniqueNames([...(existing.soldItems ?? []), ...names]),
      updatedAt: new Date().toISOString(),
    });
  },

  async remove(id: string): Promise<void> {
    await shopRepository.remove(id);
  },
};
