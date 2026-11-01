/** @format */

/**
 * @fileOverview remote.helpers
 * @description Pure helpers for the remote sync contract. Parses the
 * `{ items, nextToken }` envelope, classifies HTTP statuses (ok/auth/retryable/
 * rejected), builds resource and sync URLs, and determines whether a remote
 * record should be applied (local-wins: applied only when no local copy exists
 * or the local copy is already synced).
 *
 * Endpoints used (documented contract only):
 *   - `GET /api/basket/:resource` (paginated)
 *   - `POST /api/basket/sync` (idempotency receipts)
 *
 * @module src/lib/sync/helpers/remote.helpers
 * @author Coderooz
 * @see {@link @/constants/basket.constants#API_ROUTES}
 * @see {@link @/types/sync.types#RemotePage}
 */

import type { PersistedEntity } from "@/types/basket.types";
import type { RemotePage } from "@/types/sync.types";

/**
 * Local-wins merge policy.
 *
 * A remote record is applied only when there is no local copy, or when the
 * local copy is already fully synchronized. Records with pending local edits
 * are never overwritten by a download.
 */
export function shouldApplyRemoteRecord(
  existing: Pick<PersistedEntity, "syncStatus"> | undefined,
): boolean {
  if (!existing) return true;
  return existing.syncStatus === "synced" || existing.syncStatus === undefined;
}

export type HttpFailureKind = "ok" | "auth" | "rejected" | "retryable";

export function classifyHttpStatus(status: number): HttpFailureKind {
  if (status >= 200 && status < 300) return "ok";
  if (status === 401 || status === 403) return "auth";
  if (status === 408 || status === 425 || status === 429) return "retryable";
  if (status >= 500) return "retryable";
  return "rejected";
}

export function buildResourceUrl(
  baseUrl: string,
  resource: string,
  cursor?: string | null,
  pageSize = 100,
): string {
  const root = baseUrl.replace(/\/+$/, "");
  const params = [`limit=${pageSize}`];
  if (cursor) params.push(`cursor=${encodeURIComponent(cursor)}`);
  return `${root}/api/basket/${resource}?${params.join("&")}`;
}

export function buildSyncUrl(baseUrl: string): string {
  return `${baseUrl.replace(/\/+$/, "")}/api/basket/sync`;
}

/** Defensive parsing of the documented `{ items, nextToken }` envelope. */
export function parseRemotePage(payload: unknown): RemotePage<unknown> {
  if (!payload || typeof payload !== "object") {
    throw new Error("Unexpected response from the basket service.");
  }
  const candidate = payload as { items?: unknown; nextToken?: unknown };
  if (!Array.isArray(candidate.items)) {
    throw new Error("Unexpected response from the basket service.");
  }
  const nextToken =
    typeof candidate.nextToken === "string" && candidate.nextToken
      ? candidate.nextToken
      : null;
  return { items: candidate.items, nextToken };
}

/** A remote record is only usable when it carries a non-empty string id. */
export function isUsableRemoteRecord(
  value: unknown,
): value is Record<string, unknown> & { id: string } {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { id?: unknown }).id === "string" &&
    (value as { id: string }).id.length > 0
  );
}
