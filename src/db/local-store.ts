/** @format */

/**
 * @fileOverview local-store
 * @description Low-level SQLite persistence layer for EarnSetu Basket. Owns the
 * physical database operations for all four basket resources (`lists`, `items`,
 * `shops`, `purchases`), the sync outbox, and `app_meta`.
 *
 * Key invariants:
 *   - A local write and its corresponding outbox operation commit atomically in
 *     a single `withExclusiveTransactionAsync` transaction.
 *   - `syncStatus` is forced to `pending` on write; a record becomes `synced`
 *     only after the backend acknowledges the operation.
 *   - Records already acknowledged (remote pull / restore) are stored without
 *     queueing a sync operation.
 *   - Outbox operations are coalesced on write so a later change supersedes an
 *     unacknowledged earlier one; nothing is discarded before backend ack.
 *
 * Tables: `lists`, `items`, `shops`, `purchases`, `sync_outbox`, `app_meta`.
 *
 * @module src/db/local-store
 * @author Coderooz
 * @see {@link @/db/connections#getDatabase}
 * @see {@link @/db/index#initializeDatabase}
 * @see {@link @/lib/sync/helpers/outbox.helpers}
 */

import { randomUUID } from "expo-crypto";
import type * as SQLite from "expo-sqlite";

import type { BasketResource, PersistedEntity } from "@/types/basket.types";
import type { LocalOperation } from "@/types/sync.types";
import {
  coalesceOutbox,
  supersededOperationIds,
} from "@/lib/sync/helpers/outbox.helpers";

import { getDatabase } from "./connections";
import { initializeDatabase } from "./index";

const RESOURCE_TABLES: Record<BasketResource, string> = {
  lists: "lists",
  items: "items",
  shops: "shops",
  purchases: "purchases",
};

interface StoredRow {
  data_json: string;
  sync_status: string | null;
}

function tableFor(resource: BasketResource): string {
  return RESOURCE_TABLES[resource];
}

/**
 * The projected columns are internal literals, never user input. Building the
 * statement per resource keeps the write path explicit and avoids interpolating
 * anything that could come from a caller.
 */
function projectedColumns(resource: BasketResource): string[] {
  if (resource === "items") return ["list_id"];
  if (resource === "purchases") return ["purchased_at"];
  return [];
}

function projectionValues(
  resource: BasketResource,
  record: PersistedEntity & Record<string, unknown>,
): (string | null)[] {
  if (resource === "items") {
    return [typeof record.listId === "string" ? record.listId : null];
  }
  if (resource === "purchases") {
    return [
      typeof record.purchasedAt === "string" ? record.purchasedAt : null,
    ];
  }
  return [];
}

function buildUpsert(resource: BasketResource): string {
  const table = tableFor(resource);
  const extra = projectedColumns(resource);
  const columns = ["id", ...extra, "data_json", "created_at", "updated_at", "sync_status"];
  const placeholders = columns.map(() => "?").join(", ");
  const updates = ["data_json", "updated_at", "sync_status", ...extra]
    .map((column) => `${column} = excluded.${column}`)
    .join(", ");

  return `
    INSERT INTO ${table} (${columns.join(", ")})
    VALUES (${placeholders})
    ON CONFLICT(id) DO UPDATE SET ${updates}
  `;
}

const UPSERT_SQL: Record<BasketResource, string> = {
  lists: buildUpsert("lists"),
  items: buildUpsert("items"),
  shops: buildUpsert("shops"),
  purchases: buildUpsert("purchases"),
};

function deserializeRecord<T>(row: StoredRow): T {
  const parsed = JSON.parse(row.data_json) as Record<string, unknown>;
  // The indexed column is authoritative: `data_json` may still say "pending"
  // if the row was acknowledged after it was written.
  if (row.sync_status) {
    parsed.syncStatus = row.sync_status;
  }
  return parsed as T;
}

/**
 * Exclusive transactions run on their own connection. Writing through the
 * provided `txn` handle guarantees the record and its outbox entry commit or
 * roll back together.
 */
async function withWriteTransaction(
  task: (txn: SQLite.SQLiteDatabase) => Promise<void>,
): Promise<void> {
  const database = await getDatabase();
  await database.withExclusiveTransactionAsync(async (txn) => {
    await txn.execAsync("PRAGMA busy_timeout = 5000;");
    await task(txn);
  });
}

async function writeRecord(
  txn: SQLite.SQLiteDatabase,
  resource: BasketResource,
  record: PersistedEntity,
): Promise<void> {
  const values = [
    record.id,
    ...projectionValues(resource, record as PersistedEntity & Record<string, unknown>),
    JSON.stringify(record),
    record.createdAt ?? null,
    record.updatedAt ?? null,
    record.syncStatus ?? "local",
  ];

  await txn.runAsync(UPSERT_SQL[resource], values);
}

/* -------------------------------------------------------------------------- */
/* Reads                                                                      */
/* -------------------------------------------------------------------------- */

/**
 * @function allRecords
 * @description Reads every record for a resource from the local store and
 * deserializes them. `syncStatus` is taken from the indexed column so it stays
 * accurate even if `data_json` lags behind an acknowledgement.
 * @template {PersistedEntity} T - The record type.
 * @param {BasketResource} resource - The resource to read (`lists`/`items`/`shops`/`purchases`).
 * @returns {Promise<T[]>} All records for the resource.
 */
export async function allRecords<T extends PersistedEntity>(
  resource: BasketResource,
): Promise<T[]> {
  await initializeDatabase();
  const database = await getDatabase();
  const rows = await database.getAllAsync<StoredRow>(
    `SELECT data_json, sync_status FROM ${tableFor(resource)}`,
  );
  return rows.map((row) => deserializeRecord<T>(row));
}

/**
 * @function getRecord
 * @description Reads a single record by id for a resource. Returns `undefined`
 * when no record exists.
 * @template {PersistedEntity} T - The record type.
 * @param {BasketResource} resource - The resource to read.
 * @param {string} id - The record id.
 * @returns {Promise<T|undefined>} The record, or `undefined` if not found.
 */
export async function getRecord<T extends PersistedEntity>(
  resource: BasketResource,
  id: string,
): Promise<T | undefined> {
  await initializeDatabase();
  const database = await getDatabase();
  const row = await database.getFirstAsync<StoredRow>(
    `SELECT data_json, sync_status FROM ${tableFor(resource)} WHERE id = ?`,
    [id],
  );
  return row ? deserializeRecord<T>(row) : undefined;
}

/* -------------------------------------------------------------------------- */
/* Writes with an outbox entry (the normal app path)                          */
/* -------------------------------------------------------------------------- */

export interface PersistResult<T extends PersistedEntity> {
  record: T;
  operation: LocalOperation;
}

/**
 * Save a record and queue its sync operation atomically.
 *
 * `syncStatus` is forced to `pending`: a record is only marked `synced` after
 * the backend acknowledges the operation.
 */
export async function persistRecord<T extends PersistedEntity>(
  resource: BasketResource,
  record: T,
): Promise<PersistResult<T>> {
  await initializeDatabase();

  const now = new Date().toISOString();
  const stored = {
    ...record,
    createdAt: record.createdAt ?? now,
    updatedAt: record.updatedAt ?? now,
    syncStatus: "pending" as const,
  } as T;

  const operation: LocalOperation = {
    id: randomUUID(),
    resource,
    action: "upsert",
    entityId: record.id,
    payload: stored as unknown as Record<string, unknown>,
    createdAt: now,
    attempts: 0,
  };

  await withWriteTransaction(async (txn) => {
    await writeRecord(txn, resource, stored);

    const pending = await readOutbox(txn);
    const kept = coalesceOutbox(pending, operation);
    const superseded = supersededOperationIds(pending, kept);
    for (const id of superseded) {
      await txn.runAsync("DELETE FROM sync_outbox WHERE id = ?", [id]);
    }
    await insertOperation(txn, operation);
  });

  return { record: stored, operation };
}

/**
 * @function removeRecord
 * @description Deletes a record locally and queues the corresponding remote
 * delete operation atomically in one transaction. Outbox coalescing is applied
 * so a later delete supersedes any unacknowledged earlier op for the entity.
 * @param {BasketResource} resource - The resource to delete from.
 * @param {string} id - The record id.
 * @returns {Promise<LocalOperation>} The queued delete operation.
 */
export async function removeRecord(
  resource: BasketResource,
  id: string,
): Promise<LocalOperation> {
  await initializeDatabase();

  const now = new Date().toISOString();
  const operation: LocalOperation = {
    id: randomUUID(),
    resource,
    action: "delete",
    entityId: id,
    payload: {},
    createdAt: now,
    attempts: 0,
  };

  await withWriteTransaction(async (txn) => {
    await txn.runAsync(`DELETE FROM ${tableFor(resource)} WHERE id = ?`, [id]);

    const pending = await readOutbox(txn);
    const kept = coalesceOutbox(pending, operation);
    const superseded = supersededOperationIds(pending, kept);
    for (const supersededId of superseded) {
      await txn.runAsync("DELETE FROM sync_outbox WHERE id = ?", [supersededId]);
    }
    await insertOperation(txn, operation);
  });

  return operation;
}

/* -------------------------------------------------------------------------- */
/* Writes without an outbox entry (remote pull / restore)                     */
/* -------------------------------------------------------------------------- */

/**
 * @function saveSyncedRecord
 * @description Stores a record that already exists remotely, or that has just
 * been acknowledged by the backend. Never queues a sync operation; marks the
 * record `syncStatus = "synced"`.
 * @template {PersistedEntity} T - The record type.
 * @param {BasketResource} resource - The resource to write to.
 * @param {T} record - The record to store.
 * @returns {Promise<void>}
 */
export async function saveSyncedRecord<T extends PersistedEntity>(
  resource: BasketResource,
  record: T,
): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();
  await writeRecord(database, resource, {
    ...record,
    syncStatus: "synced",
  });
}

/* -------------------------------------------------------------------------- */
/* Outbox                                                                     */
/* -------------------------------------------------------------------------- */

interface OutboxRow {
  id: string;
  resource: BasketResource;
  action: "upsert" | "delete";
  entity_id: string;
  payload_json: string;
  created_at: string;
  attempts: number | null;
  last_error: string | null;
}

function mapOutboxRow(row: OutboxRow): LocalOperation {
  return {
    id: row.id,
    resource: row.resource,
    action: row.action,
    entityId: row.entity_id,
    payload: JSON.parse(row.payload_json) as Record<string, unknown>,
    createdAt: row.created_at,
    attempts: row.attempts ?? 0,
    lastError: row.last_error ?? undefined,
  };
}

async function readOutbox(
  database: SQLite.SQLiteDatabase,
): Promise<LocalOperation[]> {
  const rows = await database.getAllAsync<OutboxRow>(
    `SELECT * FROM sync_outbox ORDER BY created_at ASC, id ASC`,
  );
  return rows.map(mapOutboxRow);
}

async function insertOperation(
  database: SQLite.SQLiteDatabase,
  operation: LocalOperation,
): Promise<void> {
  await database.runAsync(
    `
      INSERT INTO sync_outbox (
        id, resource, action, entity_id, payload_json, created_at, attempts, last_error
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        resource = excluded.resource,
        action = excluded.action,
        entity_id = excluded.entity_id,
        payload_json = excluded.payload_json,
        created_at = excluded.created_at,
        attempts = excluded.attempts,
        last_error = excluded.last_error
    `,
    [
      operation.id,
      operation.resource,
      operation.action,
      operation.entityId,
      JSON.stringify(operation.payload),
      operation.createdAt,
      operation.attempts,
      operation.lastError ?? null,
    ],
  );
}

/**
 * @function getOutbox
 * @description Reads all queued sync operations ordered by creation time.
 * @returns {Promise<LocalOperation[]>} The pending outbox operations.
 */
export async function getOutbox(): Promise<LocalOperation[]> {
  await initializeDatabase();
  const database = await getDatabase();
  return readOutbox(database);
}

/**
 * @function countOutbox
 * @description Returns the number of pending outbox operations.
 * @returns {Promise<number>} The outbox count.
 */
export async function countOutbox(): Promise<number> {
  await initializeDatabase();
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) AS total FROM sync_outbox`,
  );
  return row?.total ?? 0;
}

/**
 * @function acknowledgeOperation
 * @description Called only after the backend acknowledged the operation. Removes
 * the operation from the outbox and, for upserts, marks the local record
 * `syncStatus = "synced"`. Runs in an exclusive transaction.
 * @param {LocalOperation} operation - The acknowledged operation.
 * @returns {Promise<void>}
 */
export async function acknowledgeOperation(
  operation: LocalOperation,
): Promise<void> {
  await initializeDatabase();

  await withWriteTransaction(async (txn) => {
    await txn.runAsync("DELETE FROM sync_outbox WHERE id = ?", [operation.id]);
    if (operation.action === "upsert") {
      await txn.runAsync(
        `UPDATE ${tableFor(operation.resource)} SET sync_status = 'synced' WHERE id = ?`,
        [operation.entityId],
      );
    }
  });
}

/**
 * @function recordOperationFailure
 * @description Keeps the operation queued but records why the latest attempt
 * failed (incrementing `attempts` and truncating `last_error` to 500 chars).
 * @param {string} operationId - The id of the failed operation.
 * @param {string} error - The failure message.
 * @returns {Promise<void>}
 */
export async function recordOperationFailure(
  operationId: string,
  error: string,
): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();
  await database.runAsync(
    `UPDATE sync_outbox SET attempts = attempts + 1, last_error = ? WHERE id = ?`,
    [error.slice(0, 500), operationId],
  );
}

/* -------------------------------------------------------------------------- */
/* Meta                                                                       */
/* -------------------------------------------------------------------------- */

/**
 * @function setMeta
 * @description Upserts a JSON-serialized value into `app_meta` for the given key.
 * @param {string} key - The meta key.
 * @param {unknown} value - The value to persist (JSON-serialized).
 * @returns {Promise<void>}
 */
export async function setMeta(key: string, value: unknown): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();
  await database.runAsync(
    `
      INSERT INTO app_meta (key, value_json)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json
    `,
    [key, JSON.stringify(value)],
  );
}

/**
 * @function getMeta
 * @description Reads and deserializes a JSON value from `app_meta` for the given key.
 * @template T - The expected value type.
 * @param {string} key - The meta key.
 * @returns {Promise<T|undefined>} The stored value, or `undefined` if absent.
 */
export async function getMeta<T = unknown>(key: string): Promise<T | undefined> {
  await initializeDatabase();
  const database = await getDatabase();
  const row = await database.getFirstAsync<{ value_json: string | null }>(
    `SELECT value_json FROM app_meta WHERE key = ?`,
    [key],
  );

  if (!row || row.value_json === null) return undefined;
  return JSON.parse(row.value_json) as T;
}

/**
 * @function removeMeta
 * @description Deletes the `app_meta` entry for the given key.
 * @param {string} key - The meta key.
 * @returns {Promise<void>}
 */
export async function removeMeta(key: string): Promise<void> {
  await initializeDatabase();
  const database = await getDatabase();
  await database.runAsync(`DELETE FROM app_meta WHERE key = ?`, [key]);
}

/**
 * @function clearAllRecords
 * @description Removes every local domain record and queued outbox operation.
 * Cloud data is deliberately untouched, mirroring the browser behaviour.
 * @returns {Promise<void>}
 */
export async function clearAllRecords(): Promise<void> {
  await initializeDatabase();
  await withWriteTransaction(async (txn) => {
    await txn.execAsync(`
      DELETE FROM lists;
      DELETE FROM items;
      DELETE FROM shops;
      DELETE FROM purchases;
      DELETE FROM sync_outbox;
    `);
  });
}

/** Backwards-compatible alias used by existing call sites. */
export const clearAll = clearAllRecords;
