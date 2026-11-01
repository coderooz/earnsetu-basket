/** @format */

/**
 * @fileOverview id
 * @description Identifier generation using `expo-crypto.randomUUID`. Ids are
 * used as sync idempotency receipts and must be stable across retries and
 * process restarts, never derived from timestamps alone.
 *
 * @module src/utils/id
 * @author Coderooz
 */

import { randomUUID } from "expo-crypto";

/**
 * Stable, collision-resistant identifiers. The backend uses the same value as
 * the sync operation receipt, so ids must never be derived from timestamps
 * alone.
 */
export function newId(): string {
  return randomUUID();
}
