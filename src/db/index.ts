/** @format */

/**
 * @fileOverview index
 * @description Database initialization entry point. Opens the database,
 * applies connection pragmas, and runs pending schema migrations exactly once
 * per process. Safe to call from any number of call sites.
 *
 * @module src/db/index
 * @author Coderooz
 * @see {@link @/db/connections#getDatabase}
 * @see {@link @/db/connections#applyConnectionPragmas}
 * @see {@link @/db/migrations#runMigrations}
 */

import { applyConnectionPragmas, getDatabase } from "./connections";
import { runMigrations, type MigrationResult } from "./migrations";

let initialized = false;
let initializationPromise: Promise<MigrationResult> | null = null;

/**
 * @function initializeDatabase
 * @description Opens the database, applies connection pragmas, and runs pending
 * migrations. The work happens exactly once; subsequent calls return the cached
 * result. On failure the cache is cleared so a retry is possible.
 * @returns {Promise<MigrationResult>} The migration result (`from`, `to`, `applied`).
 */
export async function initializeDatabase(): Promise<MigrationResult> {
  if (initialized) {
    return { from: 0, to: 0, applied: [] };
  }

  if (!initializationPromise) {
    initializationPromise = (async () => {
      const database = await getDatabase();
      await applyConnectionPragmas(database);
      const result = await runMigrations(database);
      initialized = true;
      return result;
    })().catch((error) => {
      initializationPromise = null;
      initialized = false;
      throw error;
    });
  }

  return initializationPromise;
}

export { getDatabase };
