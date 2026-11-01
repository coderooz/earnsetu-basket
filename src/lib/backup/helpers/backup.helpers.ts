/** @format */

/**
 * @fileOverview backup.helpers
 * @description Backup file construction and validation. `buildBackup` assembles
 * the four collections into a versioned `BackupFile`; `parseBackup` validates
 * the whole payload before anything is written locally (rejects malformed data,
 * missing ids, invalid names, and non-earnsetu payloads).
 *
 * @module src/lib/backup/helpers/backup.helpers
 * @author Coderooz
 * @see {@link @/types/sync.types#BackupFile}
 */

import type {
  ListItem,
  Purchase,
  Shop,
  ShoppingList,
} from "@/types/basket.types";
import type { BackupFile } from "@/types/sync.types";
import { APP_SCHEMA_VERSION } from "@/config/env";

export interface BackupCollections {
  lists: ShoppingList[];
  items: ListItem[];
  shops: Shop[];
  purchases: Purchase[];
}

export function buildBackup(
  collections: BackupCollections,
  exportedAt: string = new Date().toISOString(),
): BackupFile {
  return {
    app: "earnsetu-basket",
    exportedAt,
    version: APP_SCHEMA_VERSION,
    lists: collections.lists,
    items: collections.items,
    shops: collections.shops,
    purchases: collections.purchases,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requireArray(
  payload: Record<string, unknown>,
  resource: keyof BackupCollections,
): unknown[] {
  const value = payload[resource] ?? [];
  if (!Array.isArray(value)) {
    throw new Error(`The backup contains an invalid ${resource} collection.`);
  }
  return value;
}

function validateRecordShape(
  resource: keyof BackupCollections,
  record: Record<string, unknown>,
): void {
  if (typeof record.id !== "string" || !record.id.trim()) {
    throw new Error("The backup contains a record without a valid ID.");
  }

  switch (resource) {
    case "lists":
      if (typeof record.name !== "string" || !record.name.trim()) {
        throw new Error("The backup contains a list without a name.");
      }
      break;
    case "items":
      if (
        typeof record.name !== "string" ||
        !record.name.trim() ||
        typeof record.listId !== "string" ||
        !record.listId.trim() ||
        !(Number(record.quantity) > 0)
      ) {
        throw new Error("The backup contains an invalid list item.");
      }
      break;
    case "shops":
      if (typeof record.name !== "string" || !record.name.trim()) {
        throw new Error("The backup contains a shop without a name.");
      }
      break;
    case "purchases":
      if (
        typeof record.itemName !== "string" ||
        !record.itemName.trim() ||
        !Number.isFinite(Number(record.totalMinor))
      ) {
        throw new Error("The backup contains an invalid purchase record.");
      }
      break;
  }
}

/**
 * Validate and normalise a backup file before anything is written locally.
 *
 * The whole payload is checked first, so a malformed file never leaves the
 * device half-imported.
 */
export function parseBackup(payload: unknown): BackupCollections {
  if (!isRecord(payload) || payload.app !== "earnsetu-basket") {
    throw new Error("This is not an EarnSetu Basket backup.");
  }

  const result: BackupCollections = {
    lists: [],
    items: [],
    shops: [],
    purchases: [],
  };

  for (const resource of [
    "lists",
    "items",
    "shops",
    "purchases",
  ] as const) {
    const records = requireArray(payload, resource);
    for (const candidate of records) {
      if (!isRecord(candidate)) {
        throw new Error("The backup contains a record without a valid ID.");
      }
      validateRecordShape(resource, candidate);
    }
    // The shape checks above guarantee these are safe to treat as domain
    // records; unknown extra fields are preserved for forward compatibility.
    (result[resource] as unknown[]) = records;
  }

  return result;
}
