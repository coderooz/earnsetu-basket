/** @format */

/**
 * @fileOverview 001-initial
 * @description Initial schema migration (version 1). Creates the lists, items,
 * shops, purchases, sync_outbox, and app_meta tables, plus indexes on
 * items.list_id, purchases.purchased_at, and outbox(created_at) /
 * outbox(resource, entity_id).
 *
 * Records are stored as JSON documents (`data_json`) with a small number of
 * projected columns for filtering and indexing.
 *
 * @module src/db/migrations/001-initial
 * @author Coderooz
 * @see {@link @/db/schema#DATABASE_SCHEMA}
 */

import type * as SQLite from "expo-sqlite";

import { DATABASE_SCHEMA } from "../schema";

export const migration001 = {
  version: 1,
  name: "initial-schema",
  async up(database: SQLite.SQLiteDatabase): Promise<void> {
    await database.execAsync(DATABASE_SCHEMA);
  },
};
