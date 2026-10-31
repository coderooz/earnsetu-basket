/**
 * @format
 * @coderooz
 * @filePath src/db/connection.ts
 * @description Handle registry between the DatabaseProvider (which owns the SQLite connection lifetime, ADR-0009) and the repo singletons in lib/shopping.ts (module level, need the running handle). The provider calls `setDatabaseHandle` once the schema is ready; repos resolve through `getDatabaseHandle`, which throws loudly if anything ever touches the repos before init — a safe, diagnosable failure mode instead of silent no-ops.
 */

import * as SQLite from "expo-sqlite";

const DATABASE_NAME = "earnsetu-basket.db";

let databasePromise: Promise<SQLite.SQLiteDatabase> | null = null;

export function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!databasePromise) {
    databasePromise = SQLite.openDatabaseAsync(DATABASE_NAME).catch((error) => {
      databasePromise = null;
      throw error;
    });
  }

  return databasePromise;
}
