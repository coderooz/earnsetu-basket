/** @format */

import { getDatabase } from "./connections";
import { DATABASE_SCHEMA } from "./schema";

let initialized = false;
let initializationPromise: Promise<void> | null = null;

export async function initializeDatabase(): Promise<void> {
  if (initialized) return;

  if (!initializationPromise) {
    initializationPromise = (async () => {
      const database = await getDatabase();

      await database.execAsync(DATABASE_SCHEMA);

      initialized = true;
    })().catch((error) => {
      initializationPromise = null;
      throw error;
    });
  }

  return initializationPromise;
}

export { getDatabase };
