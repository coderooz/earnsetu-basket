/** @format */

/**
 * @fileOverview item.service
 * @description Business logic for list items (planned entries). Validates
 * drafts against an existing list and optional shop, persists items via the
 * item repository, and supports bulk add, toggle, update, and removal.
 *
 * Notes:
 *   - An item is a plan entry only; checking an item never creates a purchase.
 *   - A shop is optional and never required to plan.
 *   - Expected price is optional; when provided it is stored in minor units.
 *
 * @module src/lib/items/services/item.service
 * @author Coderooz
 * @see {@link @/lib/items/repositories/item.repository}
 * @see {@link @/lib/lists/services/list.service}
 * @see {@link @/lib/shops/services/shop.service}
 */

import {
  CURRENCIES,
  DEFAULT_CURRENCY,
  DEFAULT_UNIT,
} from "@/constants/basket.constants";
import {
  optionalText,
  requireIdentifier,
  requireNonNegativeMinor,
  requirePositiveNumber,
  requireText,
  ValidationError,
} from "@/lib/common/helpers/validation";
import { listService } from "@/lib/lists/services/list.service";
import { shopService } from "@/lib/shops/services/shop.service";
import type { ItemDraft, ListItem } from "@/types/basket.types";
import { newId } from "@/utils/id";

import { itemRepository } from "../repositories/item.repository";

const MAX_NOTES_LENGTH = 500;

export interface ValidatedItemDraft {
  listId: string;
  name: string;
  quantity: number;
  unit: string;
  notes?: string;
  shopId?: string;
  shopName?: string;
  expectedPriceMinor?: number;
  currency: string;
  checked: boolean;
  position: number;
}

function normaliseCurrency(value: string | undefined): string {
  const candidate = (value ?? DEFAULT_CURRENCY).toUpperCase();
  return (CURRENCIES as readonly string[]).includes(candidate)
    ? candidate
    : DEFAULT_CURRENCY;
}

export async function validateItemDraft(
  draft: ItemDraft,
): Promise<ValidatedItemDraft> {
  const listId = requireIdentifier(draft.listId, "a shopping list");
  const list = await listService.getById(listId);
  if (!list) throw new ValidationError("Choose an existing shopping list.");

  const shopId = draft.shopId?.trim() || undefined;
  let shopName = draft.shopName?.trim() || undefined;
  if (shopId && !shopName) {
    const shop = await shopService.getById(shopId);
    if (!shop) throw new ValidationError("Choose an existing shop.");
    shopName = shop.name;
  }

  const hasPrice =
    draft.expectedPriceMinor !== undefined &&
    draft.expectedPriceMinor !== null &&
    `${draft.expectedPriceMinor}` !== "";

  return {
    listId,
    name: requireText(draft.name, "an item name"),
    quantity: requirePositiveNumber(draft.quantity, "Quantity"),
    unit: (draft.unit ?? DEFAULT_UNIT).trim() || DEFAULT_UNIT,
    notes: optionalText(draft.notes, MAX_NOTES_LENGTH),
    shopId,
    shopName,
    expectedPriceMinor: hasPrice
      ? requireNonNegativeMinor(draft.expectedPriceMinor, "expected price")
      : undefined,
    currency: normaliseCurrency(draft.currency),
    checked: draft.checked ?? false,
    position: draft.position ?? Date.now(),
  };
}

export const itemService = {
  async getAll(): Promise<ListItem[]> {
    const items = await itemRepository.findAll();
    return items.sort((a, b) => a.position - b.position);
  },

  async getByList(listId: string): Promise<ListItem[]> {
    return itemRepository.findByList(listId);
  },

  async getById(id: string): Promise<ListItem | undefined> {
    return itemRepository.findById(id);
  },

  async create(draft: ItemDraft): Promise<ListItem> {
    const validated = await validateItemDraft(draft);
    const now = new Date().toISOString();

    return itemRepository.save({
      id: draft.id ?? newId(),
      ...validated,
      createdAt: now,
      updatedAt: now,
    });
  },

  async update(id: string, draft: ItemDraft): Promise<ListItem> {
    const existing = await itemRepository.findById(id);
    if (!existing) throw new ValidationError("This item no longer exists.");

    const validated = await validateItemDraft({
      ...draft,
      checked: draft.checked ?? existing.checked,
      position: draft.position ?? existing.position,
    });

    return itemRepository.save({
      ...existing,
      ...validated,
      updatedAt: new Date().toISOString(),
    });
  },

  async toggleChecked(id: string): Promise<ListItem> {
    const existing = await itemRepository.findById(id);
    if (!existing) throw new ValidationError("This item no longer exists.");

    return itemRepository.save({
      ...existing,
      checked: !existing.checked,
      updatedAt: new Date().toISOString(),
    });
  },

  /** Add several saved names to a list in one user action. */
  async addMany(
    listId: string,
    names: readonly string[],
    quantity: number,
    unit: string,
  ): Promise<ListItem[]> {
    const created: ListItem[] = [];
    for (const name of names) {
      const item = await this.create({
        listId,
        name,
        quantity,
        unit,
        checked: false,
      });
      created.push(item);
    }
    return created;
  },

  async remove(id: string): Promise<void> {
    await itemRepository.remove(id);
  },

  async removeByList(listId: string): Promise<void> {
    const items = await itemRepository.findByList(listId);
    for (const item of items) {
      await itemRepository.remove(item.id);
    }
  },
};
