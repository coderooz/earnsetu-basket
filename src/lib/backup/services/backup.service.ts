/** @format */

/**
 * @fileOverview backup.service
 * @description Backup export/import using Expo FileSystem and Sharing plus the
 * document picker. Exports a JSON backup to the cache directory and hands it to
 * the platform share sheet; import picks a file, validates the whole payload
 * before writing anything, and persists all four collections atomically per
 * record.
 *
 * Notes:
 *   - Sharing is the closest native equivalent of a browser download.
 *   - Import validates the entire file before any local write (all-or-nothing).
 *
 * @module src/lib/backup/services/backup.service
 * @author Coderooz
 * @see {@link @/lib/backup/helpers/backup.helpers#buildBackup}
 * @see {@link @/lib/backup/helpers/backup.helpers#parseBackup}
 * @see {@link @/db/local-store#persistRecord}
 */

import * as DocumentPicker from "expo-document-picker";
import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import { allRecords, persistRecord } from "@/db/local-store";
import type {
  ListItem,
  PersistedEntity,
  Purchase,
  Shop,
  ShoppingList,
} from "@/types/basket.types";

import {
  buildBackup,
  parseBackup,
  type BackupCollections,
} from "../helpers/backup.helpers";

async function loadCollections(): Promise<BackupCollections> {
  return {
    lists: await allRecords<ShoppingList>("lists"),
    items: await allRecords<ListItem>("items"),
    shops: await allRecords<Shop>("shops"),
    purchases: await allRecords<Purchase>("purchases"),
  };
}

export interface ExportResult {
  uri: string;
  shared: boolean;
}

/**
 * Write a JSON backup to the cache directory, then hand it to the platform
 * share sheet. Sharing is the closest native equivalent of a browser download.
 */
export async function exportBackup(): Promise<ExportResult> {
  const payload = buildBackup(await loadCollections());
  const file = new File(
    Paths.cache,
    `earnsetu-basket-backup-${Date.now()}.json`,
  );

  file.create({ overwrite: true });
  file.write(JSON.stringify(payload, null, 2));

  const canShare = await Sharing.isAvailableAsync();
  if (canShare) {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/json",
      dialogTitle: "Export EarnSetu Basket backup",
      UTI: "public.json",
    });
  }

  return { uri: file.uri, shared: canShare };
}

export interface ImportResult {
  imported: number;
  collections: BackupCollections;
}

/**
 * Pick a backup file, validate it completely, then queue every record for
 * storage. Nothing is written until the whole file validates.
 */
export async function importBackup(): Promise<ImportResult | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
    multiple: false,
  });

  if (picked.canceled || !picked.assets?.length) return null;

  const asset = picked.assets[0];
  if (!asset) return null;

  const text = await new File(asset.uri).text();
  const parsedJson = JSON.parse(text) as unknown;
  const collections = parseBackup(parsedJson);

  let imported = 0;
  for (const resource of [
    "lists",
    "items",
    "shops",
    "purchases",
  ] as const) {
    for (const record of collections[resource]) {
      await persistRecord(resource, record as PersistedEntity);
      imported += 1;
    }
  }

  return { imported, collections };
}
