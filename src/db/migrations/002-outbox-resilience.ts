/** @format */

/**
 * @fileOverview 002-outbox-resilience
 * @description Outbox resilience migration (version 2). Adds retry bookkeeping
 * columns (`attempts`, `last_error`) to `sync_outbox` so failed operations can
 * be retried and inspected. Uses `ensureColumn` to safely patch existing
 * installations created before migrations existed.
 *
 * @module src/db/migrations/002-outbox-resilience
 * @author Coderooz
 * @see {@link @/db/local-store#recordOperationFailure}
 */

import type * as SQLite from "expo-sqlite";

async function ensureColumn(
  database: SQLite.SQLiteDatabase,
  table: string,
  column: string,
  definition: string,
): Promise<void> {
  const columns = await database.getAllAsync<{ name: string }>(
    `PRAGMA table_info(${table})`,
  );

  if (!columns.some((entry) => entry.name === column)) {
    await database.execAsync(
      `ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`,
    );
  }
}

/**
 * Adds retry bookkeeping to the outbox.
 *
 * Installations created before migrations existed already had a
 * `sync_outbox` table without these columns, and `CREATE TABLE IF NOT EXISTS`
 * cannot add them, so they are patched here.
 */
export const migration002 = {
  version: 2,
  name: "outbox-resilience",
  async up(database: SQLite.SQLiteDatabase): Promise<void> {
    await ensureColumn(
      database,
      "sync_outbox",
      "attempts",
      "INTEGER NOT NULL DEFAULT 0",
    );
    await ensureColumn(database, "sync_outbox", "last_error", "TEXT");
  },
};
