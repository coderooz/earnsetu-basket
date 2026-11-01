/** @format */

/**
 * @fileOverview list.service
 * @description Business logic for shopping lists. Validates drafts, persists
 * records via the list repository, and exposes archive/restore/remove
 * operations. All writes flow through `listRepository.save`, which commits the
 * record and its sync operation atomically.
 *
 * Notes:
 *   - Lists are plans: creating/editing a list never creates a purchase.
 *   - `plannedFor` is normalised to local noon ISO so calendar buckets stay
 *     correct for users east of UTC.
 *   - Archive/restore are soft deletes (the `archived` flag); hard delete is
 *     offered only for archived lists via `deleteListAction`.
 *
 * @module src/lib/lists/services/list.service
 * @author Coderooz
 * @see {@link @/lib/lists/repositories/list.repository}
 * @see {@link @/lib/lists/actions/create-list.action}
 * @see {@link @/lib/common/helpers/validation}
 */

import {
  optionalText,
  requireIdentifier,
  requireText,
  ValidationError,
} from "@/lib/common/helpers/validation";
import type { ListDraft, ShoppingList } from "@/types/basket.types";
import { newId } from "@/utils/id";

import { listRepository } from "../repositories/list.repository";

/**
 * @interface ValidatedListDraft
 * @description A list draft after validation and sanitisation.
 * @property {string} name - Trimmed, collapsed list name (1-100 chars).
 * @property {string|undefined} description - Optional notes (max 500 chars).
 * @property {string|undefined} plannedFor - Normalised local-noon ISO timestamp.
 */
interface ValidatedListDraft {
  name: string;
  description?: string;
  plannedFor?: string;
}

/** Maximum description length in characters. @const {number} */
const MAX_DESCRIPTION_LENGTH = 500;

/**
 * @function validateListDraft
 * @description Validates and sanitises a `ListDraft`. Throws `ValidationError`
 * for missing or over-long names.
 * @param {ListDraft} draft - The raw draft.
 * @returns {ValidatedListDraft} The sanitised draft.
 */
export function validateListDraft(draft: ListDraft): ValidatedListDraft {
  return {
    name: requireText(draft.name, "a list name"),
    description: optionalText(draft.description, MAX_DESCRIPTION_LENGTH),
    plannedFor: normaliseTimestamp(draft.plannedFor),
  };
}

/**
 * @function normaliseTimestamp
 * @description Accepts either a `YYYY-MM-DD` key or a full ISO timestamp and
 * returns a normalised ISO timestamp (date keys are treated as local noon).
 * Returns `undefined` for empty or unparsable input.
 * @param {string|undefined} value - The raw timestamp value.
 * @returns {string|undefined} The normalised ISO timestamp, or `undefined`.
 */
export function normaliseTimestamp(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const candidate =
    /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00` : value;
  const parsed = new Date(candidate);
  if (Number.isNaN(parsed.getTime())) return undefined;
  return parsed.toISOString();
}

/**
 * @constant {Object} listService
 * @description Business-logic service for shopping lists.
 * @property {() => Promise<ShoppingList[]>} getAll - All lists, sorted by name.
 * @property {() => Promise<ShoppingList[]>} getActive - Non-archived lists.
 * @property {(id: string) => Promise<ShoppingList|undefined>} getById - Find a list by id.
 * @property {(draft: ListDraft) => Promise<ShoppingList>} create - Create a new list.
 * @property {(id: string, draft: ListDraft) => Promise<ShoppingList>} update - Update an existing list.
 * @property {(id: string, archived: boolean) => Promise<ShoppingList>} setArchived - Archive or restore a list.
 * @property {(id: string) => Promise<void>} remove - Permanently delete a list.
 */
export const listService = {
  /**
   * @function listService.getAll
   * @returns {Promise<ShoppingList[]>} All lists sorted by name.
   */
  async getAll(): Promise<ShoppingList[]> {
    const lists = await listRepository.findAll();
    return lists.sort((a, b) => a.name.localeCompare(b.name));
  },

  /**
   * @function listService.getActive
   * @returns {Promise<ShoppingList[]>} Non-archived lists sorted by name.
   */
  async getActive(): Promise<ShoppingList[]> {
    const lists = await this.getAll();
    return lists.filter((list) => !list.archived);
  },

  /**
   * @function listService.getById
   * @param {string} id - The list id.
   * @returns {Promise<ShoppingList|undefined>} The list, or `undefined`.
   */
  async getById(id: string): Promise<ShoppingList | undefined> {
    return listRepository.findById(id);
  },

  /**
   * @function listService.create
   * @param {ListDraft} draft - The list draft.
   * @returns {Promise<ShoppingList>} The created list.
   */
  async create(draft: ListDraft): Promise<ShoppingList> {
    const validated = validateListDraft(draft);
    const now = new Date().toISOString();

    return listRepository.save({
      id: draft.id ?? newId(),
      name: validated.name,
      description: validated.description,
      plannedFor: validated.plannedFor ?? now,
      archived: draft.archived ?? false,
      color: draft.color,
      createdAt: now,
      updatedAt: now,
    });
  },

  /**
   * @function listService.update
   * @param {string} id - The list id.
   * @param {ListDraft} draft - The updated draft.
   * @returns {Promise<ShoppingList>} The updated list.
   * @throws {ValidationError} If the list no longer exists.
   */
  async update(id: string, draft: ListDraft): Promise<ShoppingList> {
    requireIdentifier(id, "a list");
    const existing = await listRepository.findById(id);
    if (!existing) throw new ValidationError("This list no longer exists.");

    const validated = validateListDraft({ ...draft, name: draft.name });

    return listRepository.save({
      ...existing,
      name: validated.name,
      description: validated.description,
      plannedFor: validated.plannedFor ?? existing.plannedFor,
      archived: draft.archived ?? existing.archived,
      color: draft.color ?? existing.color,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * @function listService.setArchived
   * @param {string} id - The list id.
   * @param {boolean} archived - Whether to archive or restore.
   * @returns {Promise<ShoppingList>} The updated list.
   * @throws {ValidationError} If the list no longer exists.
   */
  async setArchived(id: string, archived: boolean): Promise<ShoppingList> {
    const existing = await listRepository.findById(id);
    if (!existing) throw new ValidationError("This list no longer exists.");

    return listRepository.save({
      ...existing,
      archived,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * @function listService.remove
   * @param {string} id - The list id.
   * @returns {Promise<void>}
   */
  async remove(id: string): Promise<void> {
    await listRepository.remove(id);
  },
};
