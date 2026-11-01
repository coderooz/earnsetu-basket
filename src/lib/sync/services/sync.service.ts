/** @format */

/**
 * @fileOverview sync.service
 * @description Offline-first synchronization client. Pushes queued outbox
 * operations to `POST /api/basket/sync` (idempotency receipts) then pulls
 * remote changes page-by-page from `GET /api/basket/:resource`. Implements a
 * local-wins merge policy, HTTP status classification, retryable vs rejected
 * error handling, and sync metadata (`lastSyncedAt`).
 *
 * Notes:
 *   - Operations are removed from the outbox only after a 2xx acknowledgement.
 *   - Rejected (non-retryable) operations stay queued so nothing is lost.
 *   - No auth provider exists yet; sync activates when a session is supplied.
 *
 * @module src/lib/sync/services/sync.service
 * @author Coderooz
 * @see {@link @/constants/basket.constants#API_ROUTES}
 * @see {@link @/lib/sync/helpers/remote.helpers}
 * @see {@link @/lib/auth/services/auth.service}
 */

import { API_BASE_URL, SYNC_ENABLED } from "@/config/env";
import {
  BASKET_RESOURCES,
  type BasketResource,
  type PersistedEntity,
} from "@/types/basket.types";
import {
  acknowledgeOperation,
  allRecords,
  countOutbox,
  getMeta,
  getOutbox,
  recordOperationFailure,
  saveSyncedRecord,
  setMeta,
} from "@/db/local-store";
import { META_KEYS, LIMITS, SYNC_MESSAGES } from "@/constants/basket.constants";
import type { LocalOperation, SyncSummary } from "@/types/sync.types";
import { authService } from "@/lib/auth/services/auth.service";

import {
  buildResourceUrl,
  buildSyncUrl,
  classifyHttpStatus,
  isUsableRemoteRecord,
  parseRemotePage,
  shouldApplyRemoteRecord,
} from "../helpers/remote.helpers";

class SyncAuthError extends Error {}
class SyncRejectedError extends Error {}
class SyncTransportError extends Error {}

const JSON_HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

function authHeaders(token: string) {
  return { ...JSON_HEADERS, Authorization: `Bearer ${token}` };
}

async function safeBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 300);
  } catch {
    return "";
  }
}

async function requestJson(
  url: string,
  init: RequestInit,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(
    () => controller.abort(),
    LIMITS.syncRequestTimeoutMs,
  );

  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    throw new SyncTransportError(
      error instanceof Error ? error.message : "Network request failed.",
    );
  } finally {
    clearTimeout(timer);
  }
}

function assertOkStatus(status: number, body: string): void {
  const kind = classifyHttpStatus(status);
  if (kind === "ok") return;

  const detail = body ? ` (${body})` : "";
  if (kind === "auth") {
    throw new SyncAuthError("Cloud sign-in expired.");
  }
  if (kind === "retryable") {
    throw new SyncTransportError(`Service unavailable (${status})${detail}`);
  }
  throw new SyncRejectedError(`The server rejected the change (${status})${detail}`);
}

async function pushOperation(
  operation: LocalOperation,
  token: string,
): Promise<void> {
  const response = await requestJson(buildSyncUrl(API_BASE_URL), {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify({
      id: operation.id,
      resource: operation.resource,
      action: operation.action,
      entityId: operation.entityId,
      payload: operation.payload,
      createdAt: operation.createdAt,
    }),
  });

  if (!response.ok) {
    const body = await safeBody(response);
    await recordOperationFailure(
      operation.id,
      `${response.status} ${body}`.trim(),
    );
    assertOkStatus(response.status, body);
    return;
  }

  // The receipt is stored by the backend in the same transaction as the write,
  // so the operation can now be removed safely (at-least-once delivery).
  await acknowledgeOperation(operation);
}

async function pullResource(
  resource: BasketResource,
  token: string,
): Promise<number> {
  let cursor: string | null = null;
  let applied = 0;

  for (let page = 0; page < LIMITS.remoteMaxPages; page += 1) {
    const response = await requestJson(
      buildResourceUrl(API_BASE_URL, resource, cursor, LIMITS.remotePageSize),
      { headers: authHeaders(token) },
    );

    if (!response.ok) {
      const body = await safeBody(response);
      assertOkStatus(response.status, body);
      return applied;
    }

    const payload = (await response.json()) as unknown;
    const { items, nextToken } = parseRemotePage(payload);

    const local = await allRecords<PersistedEntity>(resource);
    const byId = new Map(local.map((record) => [record.id, record]));

    for (const raw of items) {
      if (!isUsableRemoteRecord(raw)) continue;
      if (!shouldApplyRemoteRecord(byId.get(raw.id))) continue;
      await saveSyncedRecord(resource, raw as unknown as PersistedEntity);
      applied += 1;
    }

    if (!nextToken) break;
    cursor = nextToken;
  }

  return applied;
}

async function lastSyncedAt(): Promise<string | undefined> {
  return getMeta<string>(META_KEYS.lastSyncedAt);
}

/**
 * Push every queued operation, then download the latest remote state.
 *
 * - Operations are removed only after a 2xx acknowledgement.
 * - Rejected (non-retryable) operations stay queued so nothing is lost.
 * - Any transport failure aborts the run and reports it as retryable.
 */
export async function syncAll(): Promise<SyncSummary> {
  const pendingBefore = await countOutbox();

  if (!SYNC_ENABLED) {
    return {
      status: "not-configured",
      pushed: 0,
      pulled: 0,
      pending: pendingBefore,
      lastSyncedAt: await lastSyncedAt(),
      message: SYNC_MESSAGES.notConfigured,
      retryable: false,
    };
  }

  const session = await authService.getSession();
  if (!session) {
    return {
      status: "no-session",
      pushed: 0,
      pulled: 0,
      pending: pendingBefore,
      lastSyncedAt: await lastSyncedAt(),
      message: SYNC_MESSAGES.noSession,
      retryable: false,
    };
  }

  let pushed = 0;
  let pulled = 0;
  let rejected = false;

  try {
    for (const operation of await getOutbox()) {
      try {
        await pushOperation(operation, session.token);
        pushed += 1;
      } catch (error) {
        if (error instanceof SyncRejectedError) {
          rejected = true;
          continue;
        }
        throw error;
      }
    }

    for (const resource of BASKET_RESOURCES) {
      pulled += await pullResource(resource, session.token);
    }

    const syncedAt = new Date().toISOString();
    await setMeta(META_KEYS.lastSyncedAt, syncedAt);
    const pending = await countOutbox();
    const incomplete = rejected || pending > 0;

    return {
      status: incomplete ? "partial" : "ok",
      pushed,
      pulled,
      pending,
      lastSyncedAt: syncedAt,
      message: incomplete ? SYNC_MESSAGES.rejected : SYNC_MESSAGES.allSynced,
      retryable: false,
    };
  } catch (error) {
    const pending = await countOutbox();

    if (error instanceof SyncAuthError) {
      return {
        status: "error",
        pushed,
        pulled,
        pending,
        lastSyncedAt: await lastSyncedAt(),
        message: SYNC_MESSAGES.authFailed,
        retryable: false,
      };
    }

    return {
      status: "offline",
      pushed,
      pulled,
      pending,
      lastSyncedAt: await lastSyncedAt(),
      message: SYNC_MESSAGES.waiting,
      retryable: true,
    };
  }
}

export async function getSyncSnapshot(): Promise<{
  pending: number;
  lastSyncedAt?: string;
}> {
  return {
    pending: await countOutbox(),
    lastSyncedAt: await lastSyncedAt(),
  };
}
