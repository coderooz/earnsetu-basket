/** @format */

import type { BasketResource } from "./basket.types";

/**
 * One queued local mutation. The operation `id` doubles as the backend
 * idempotency receipt, so it must stay stable across retries and process
 * restarts.
 */
export interface LocalOperation {
  id: string;
  resource: BasketResource;
  action: "upsert" | "delete";
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
  attempts: number;
  lastError?: string;
}

export type SyncStatusKind =
  | "ok"
  | "offline"
  | "not-configured"
  | "no-session"
  | "partial"
  | "error";

export interface SyncSummary {
  status: SyncStatusKind;
  pushed: number;
  pulled: number;
  pending: number;
  lastSyncedAt?: string;
  message: string;
  /** True when failures are likely transient (network / 5xx). */
  retryable: boolean;
}

export interface AuthSession {
  userId: string;
  token: string;
  email?: string;
  name?: string;
  picture?: string;
  expiresAt?: string;
}

export interface RemotePage<T> {
  items: T[];
  nextToken: string | null;
}

export interface BackupFile {
  app: "earnsetu-basket";
  exportedAt: string;
  version: number;
  lists: unknown[];
  items: unknown[];
  shops: unknown[];
  purchases: unknown[];
}
