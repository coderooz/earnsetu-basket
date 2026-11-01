/** @format */

/**
 * @fileOverview migrations
 * @description Versioned schema migrations for the EarnSetu Basket SQLite
 * database. Migrations are ordered by version, applied exactly once per database
 * via `PRAGMA user_version`, and each runs inside a transaction so a failed
 * migration leaves the schema untouched.
 *
 * Migrations:
 *   - `001-initial` - lists, items, shops, purchases, sync_outbox, app_meta.
 *   - `002-outbox-resilience` - outbox failure tracking (attempts, last_error).
 *
 * @module src/db/migrations
 * @author Coderooz
 * @see {@link @/db/schema#DATABASE_SCHEMA}
 */

import type * as SQLite from "expo-sqlite";

import { migration001 } from "./001-initial";
import { migration002 } from "./002-outbox-resilience";

/**
 * @interface Migration
 * @description A single schema migration.
 * @property {number} version - The target schema version.
 * @property {string} name - Human-readable migration name.
 * @property {(database: SQLite.SQLiteDatabase) => Promise<void>} up - The migration step.
 */
export interface Migration {
  version: number;
  name: string;
  up: (database: SQLite.SQLiteDatabase) => Promise<void>;
}

/**
 * Ordered migrations. Versions are applied exactly once per database via
 * SQLite's `user_version`, inside a transaction, so a failed migration leaves
 * the schema untouched.
 * @const {ReadonlyArray<Migration>}
 */
export const MIGRATIONS: readonly Migration[] = [
  migration001,
  migration002,
].sort((a, b) => a.version - b.version);

/**
 * The latest schema version (the highest migration version).
 * @const {number}
 */
export const LATEST_SCHEMA_VERSION =
  MIGRATIONS[MIGRATIONS.length - 1]?.version ?? 0;

/**
 * @interface MigrationResult
 * @description The result of running migrations.
 * @property {number} from - The schema version before migration.
 * @property {number} to - The schema version after migration.
 * @property {number[]} applied - The migration versions applied.
 */
export interface MigrationResult {
  from: number;
  to: number;
  applied: number[];
}

/**
 * @function runMigrations
 * @description Applies pending migrations to the database. Each migration runs
 * inside a transaction and bumps `PRAGMA user_version`. Safe to call multiple
 * times (already-applied migrations are skipped).
 * @param {SQLite.SQLiteDatabase} database - The open database connection.
 * @returns {Promise<MigrationResult>} The migration result.
 */
export async function runMigrations(
  database: SQLite.SQLiteDatabase,
): Promise<MigrationResult> {
  const row = await database.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version",
  );
  const from = row?.user_version ?? 0;
  const pending = MIGRATIONS.filter((migration) => migration.version > from);
  const applied: number[] = [];

  for (const migration of pending) {
    await database.withTransactionAsync(async () => {
      await migration.up(database);
      // `PRAGMA` values cannot be bound, but the version is a trusted literal
      // from our own migration list, never user input.
      await database.execAsync(`PRAGMA user_version = ${migration.version}`);
    });
    applied.push(migration.version);
  }

  return { from, to: LATEST_SCHEMA_VERSION, applied };
}
