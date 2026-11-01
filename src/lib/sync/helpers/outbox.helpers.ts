/** @format */

/**
 * @fileOverview outbox.helpers
 * @description Pure, testable outbox coalescing rules. When a new operation is
 * queued:
 *   - A new `delete` supersedes every queued operation for that entity.
 *   - A new `upsert` replaces queued upserts only when no delete is queued.
 *   - A new `upsert` after a queued `delete` is kept after the delete.
 *
 * Also provides `supersededOperationIds` to identify rows to delete from the
 * outbox after coalescing. Nothing is discarded before backend acknowledgement.
 *
 * @module src/lib/sync/helpers/outbox.helpers
 * @author Coderooz
 * @see {@link @/types/sync.types#LocalOperation}
 */

import type { LocalOperation } from "@/types/sync.types";

function sameEntity(a: LocalOperation, b: LocalOperation): boolean {
  return a.resource === b.resource && a.entityId === b.entityId;
}

/**
 * Merge a newly queued operation into the pending outbox.
 *
 * Coalescing rules (nothing is ever discarded before the backend acknowledges
 * it, except when a later local change fully supersedes an *unacknowledged*
 * earlier one):
 *
 * 1. A new `delete` supersedes every queued operation for that entity.
 *    Sending a delete is harmless if the server never saw the earlier upsert.
 * 2. A new `upsert` replaces queued upserts only when no delete is queued.
 *    Keeping a single upsert is safe because the payload is the full record.
 * 3. A new `upsert` that follows a queued `delete` is kept *after* the delete,
 *    preserving the user's intent (delete, then re-create).
 */
export function coalesceOutbox(
  pending: readonly LocalOperation[],
  next: LocalOperation,
): LocalOperation[] {
  if (next.action === "delete") {
    return [...pending.filter((operation) => !sameEntity(operation, next)), next];
  }

  const queuedForEntity = pending.filter((operation) =>
    sameEntity(operation, next),
  );
  const hasQueuedDelete = queuedForEntity.some(
    (operation) => operation.action === "delete",
  );

  if (!hasQueuedDelete) {
    return [
      ...pending.filter((operation) => !sameEntity(operation, next)),
      next,
    ];
  }

  return [...pending, next];
}

/** Ids present in `pending` but absent from `kept`, i.e. superseded rows. */
export function supersededOperationIds(
  pending: readonly LocalOperation[],
  kept: readonly LocalOperation[],
): string[] {
  const keptIds = new Set(kept.map((operation) => operation.id));
  return pending
    .filter((operation) => !keptIds.has(operation.id))
    .map((operation) => operation.id);
}
