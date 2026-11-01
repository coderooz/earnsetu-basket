/** @format */

/**
 * Schema v1.
 *
 * Records are stored as JSON documents (`data_json`) with a small number of
 * projected columns for filtering and indexing. This keeps the local shape
 * identical to the documented backend payload while still allowing cheap
 * list/purchase queries.
 */
export const DATABASE_SCHEMA = `
  CREATE TABLE IF NOT EXISTS lists (
    id TEXT PRIMARY KEY NOT NULL,
    data_json TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'local'
  );

  CREATE TABLE IF NOT EXISTS items (
    id TEXT PRIMARY KEY NOT NULL,
    list_id TEXT,
    data_json TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'local'
  );

  CREATE INDEX IF NOT EXISTS idx_items_list
  ON items(list_id);

  CREATE TABLE IF NOT EXISTS shops (
    id TEXT PRIMARY KEY NOT NULL,
    data_json TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'local'
  );

  CREATE TABLE IF NOT EXISTS purchases (
    id TEXT PRIMARY KEY NOT NULL,
    purchased_at TEXT,
    data_json TEXT NOT NULL,
    created_at TEXT,
    updated_at TEXT,
    sync_status TEXT NOT NULL DEFAULT 'local'
  );

  CREATE INDEX IF NOT EXISTS idx_purchases_date
  ON purchases(purchased_at);

  CREATE TABLE IF NOT EXISTS sync_outbox (
    id TEXT PRIMARY KEY NOT NULL,
    resource TEXT NOT NULL,
    action TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    payload_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    last_error TEXT
  );

  CREATE INDEX IF NOT EXISTS idx_outbox_created
  ON sync_outbox(created_at);

  CREATE INDEX IF NOT EXISTS idx_outbox_entity
  ON sync_outbox(resource, entity_id);

  CREATE TABLE IF NOT EXISTS app_meta (
    key TEXT PRIMARY KEY NOT NULL,
    value_json TEXT
  );
`;
