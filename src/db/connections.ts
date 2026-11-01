/** @format */

/**
 * @fileOverview connections
 * @description SQLite connection registry for EarnSetu Basket. Opens a single
 * lazy connection (`earnsetu-basket.db`) reused for the process lifetime, and
 * applies connection-level pragmas (WAL journal mode, foreign keys, busy
 * timeout). All database work resolves the handle through `getDatabase`.
 *
 * @module src/db/connections
 * @author Coderooz
 * @see {@link @/db/local-store}
 * @see {@link @/db/index#initializeDatabase}
 */

import * as SQLite from "expo-sqlite";

/**
 * SQLite database file name.
 * @const {string}
 */
const DATABASE_NAME = "earnsetu-basket.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * @function getDatabase
 * @description Opens (lazily) and returns the shared SQLite database connection.
 * The connection is cached for the process lifetime; a failed open resets the
 * cache so the next call retries.
 * @returns {Promise<SQLite.SQLiteDatabase>} The open database connection.
 */
export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}

/**
 * @function applyConnectionPragmas
 * @description Applies connection-level pragmas to a database: WAL journal
 * mode, foreign keys enabled, and a 5-second busy timeout. Safe to run more
 * than once.
 * @param {SQLite.SQLiteDatabase} database - The open database connection.
 * @returns {Promise<void>}
 */
export async function applyConnectionPragmas(
  database: SQLite.SQLiteDatabase,
): Promise<void> {
  await database.execAsync("PRAGMA journal_mode = WAL;");
  await database.execAsync("PRAGMA foreign_keys = ON;");
  await database.execAsync("PRAGMA busy_timeout = 5000;");
}

/**
 * @function resetDatabaseConnection
 * @description Test/debug helper: drops the cached connection handle so the
 * next `getDatabase` call re-opens the database.
 * @returns {void}
 */
export function resetDatabaseConnection(): void {
  databasePromise = null;
}
