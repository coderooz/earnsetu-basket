/** @format */

import { getDatabase } from "./connections";
import { initializeDatabase } from "./index";

export type BasketResource = "lists" | "items" | "shops" | "purchases";

export type BasketRecord = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: "local" | "pending" | "synced";
  [key: string]: unknown;
};

export type LocalOperation = {
  id: string;
  resource: BasketResource;
  action: "upsert" | "delete";
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

const RESOURCE_TABLES: Record<BasketResource, string> = {
  lists: "lists",
  items: "items",
  shops: "shops",
  purchases: "purchases",
};

function serialize(value: unknown): string {
  return JSON.stringify(value);
}

function deserialize<T>(value: string): T {
  return JSON.parse(value) as T;
}

export async function allRecords<T extends BasketRecord>(
  resource: BasketResource,
): Promise<T[]> {
  await initializeDatabase();

  const database = await getDatabase();
  const table = RESOURCE_TABLES[resource];

  const rows = await database.getAllAsync<{ data_json: string }>(
    `SELECT data_json FROM ${table}`,
  );

  return rows.map((row) => deserialize<T>(row.data_json));
}

export async function putLocalRecord(
  resource: BasketResource,
  record: BasketRecord,
): Promise<void> {
  await initializeDatabase();

  const database = await getDatabase();
  const table = RESOURCE_TABLES[resource];

  const data = serialize(record);

  const listId =
    resource === "items" && typeof record.listId === "string"
      ? record.listId
      : null;

  const purchasedAt =
    resource === "purchases" && typeof record.purchasedAt === "string"
      ? record.purchasedAt
      : null;

  await database.runAsync(
    `
      INSERT INTO ${table} (
        id,
        ${resource === "items" ? "list_id," : ""}
        ${resource === "purchases" ? "purchased_at," : ""}
        data_json,
        created_at,
        updated_at,
        sync_status
      )
      VALUES (
        ?,
        ${resource === "items" ? "?," : ""}
        ${resource === "purchases" ? "?," : ""}
        ?,
        ?,
        ?,
        ?
      )
      ON CONFLICT(id) DO UPDATE SET
        ${resource === "items" ? "list_id = excluded.list_id," : ""}
        ${resource === "purchases" ? "purchased_at = excluded.purchased_at," : ""}
        data_json = excluded.data_json,
        updated_at = excluded.updated_at,
        sync_status = excluded.sync_status
    `,
    ...[
      record.id,
      ...(resource === "items" ? [listId] : []),
      ...(resource === "purchases" ? [purchasedAt] : []),
      data,
      record.createdAt ?? null,
      record.updatedAt ?? null,
      record.syncStatus ?? "local",
    ],
  );
}

export async function deleteLocalRecord(
  resource: BasketResource,
  id: string,
): Promise<void> {
  await initializeDatabase();

  const database = await getDatabase();
  const table = RESOURCE_TABLES[resource];

  await database.runAsync(`DELETE FROM ${table} WHERE id = ?`, id);
}

export async function addOutbox(operation: LocalOperation): Promise<void> {
  await initializeDatabase();

  const database = await getDatabase();

  await database.runAsync(
    `
      INSERT INTO sync_outbox (
        id,
        resource,
        action,
        entity_id,
        payload_json,
        created_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        resource = excluded.resource,
        action = excluded.action,
        entity_id = excluded.entity_id,
        payload_json = excluded.payload_json,
        created_at = excluded.created_at
    `,
    operation.id,
    operation.resource,
    operation.action,
    operation.entityId,
    serialize(operation.payload),
    operation.createdAt,
  );
}

export async function getOutbox(): Promise<LocalOperation[]> {
  await initializeDatabase();

  const database = await getDatabase();

  const rows = await database.getAllAsync<{
    id: string;
    resource: BasketResource;
    action: "upsert" | "delete";
    entity_id: string;
    payload_json: string;
    created_at: string;
  }>(`SELECT * FROM sync_outbox ORDER BY created_at ASC`);

  return rows.map((row) => ({
    id: row.id,
    resource: row.resource,
    action: row.action,
    entityId: row.entity_id,
    payload: deserialize<Record<string, unknown>>(row.payload_json),
    createdAt: row.created_at,
  }));
}

export async function removeOutbox(id: string): Promise<void> {
  await initializeDatabase();

  const database = await getDatabase();

  await database.runAsync(`DELETE FROM sync_outbox WHERE id = ?`, id);
}

export async function setMeta(key: string, value: unknown): Promise<void> {
  await initializeDatabase();

  const database = await getDatabase();

  await database.runAsync(
    `
      INSERT INTO app_meta (key, value_json)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json
    `,
    key,
    serialize(value),
  );
}

export async function getMeta<T = unknown>(
  key: string,
): Promise<T | undefined> {
  await initializeDatabase();

  const database = await getDatabase();

  const row = await database.getFirstAsync<{
    value_json: string | null;
  }>(`SELECT value_json FROM app_meta WHERE key = ?`, key);

  if (!row || row.value_json === null) {
    return undefined;
  }

  return deserialize<T>(row.value_json);
}

export async function clearAll(): Promise<void> {
  await initializeDatabase();

  const database = await getDatabase();

  await database.withTransactionAsync(async () => {
    await database.execAsync(`
      DELETE FROM lists;
      DELETE FROM items;
      DELETE FROM shops;
      DELETE FROM purchases;
      DELETE FROM sync_outbox;
    `);
  });
}
