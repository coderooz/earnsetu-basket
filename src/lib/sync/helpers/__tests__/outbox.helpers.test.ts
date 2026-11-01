/** @format */

import type { LocalOperation } from "@/types/sync.types";
import { coalesceOutbox, supersededOperationIds } from "../outbox.helpers";

const op = (overrides: Partial<LocalOperation> = {}): LocalOperation => ({
  id: overrides.id ?? "op-1",
  resource: overrides.resource ?? "items",
  action: overrides.action ?? "upsert",
  entityId: overrides.entityId ?? "ent-1",
  payload: overrides.payload ?? {},
  createdAt: overrides.createdAt ?? "2026-01-01T00:00:00Z",
  attempts: overrides.attempts ?? 0,
  ...overrides,
});

describe("outbox coalescing", () => {
  it("keeps a single upsert with no prior delete", () => {
    const pending = [op({ id: "a" })];
    const next = op({ id: "b", entityId: "ent-1" });
    const kept = coalesceOutbox(pending, next);
    expect(kept.map((o) => o.id)).toEqual(["b"]);
  });

  it("appends a new entity upsert", () => {
    const pending = [op({ id: "a", entityId: "ent-1" })];
    const next = op({ id: "b", entityId: "ent-2" });
    const kept = coalesceOutbox(pending, next);
    expect(kept.map((o) => o.id)).toEqual(["a", "b"]);
  });

  it("new delete supersedes queued operations for that entity", () => {
    const pending = [op({ id: "a", entityId: "ent-1" }), op({ id: "c", entityId: "ent-1" })];
    const next = op({ id: "b", entityId: "ent-1", action: "delete" });
    const kept = coalesceOutbox(pending, next);
    expect(kept.map((o) => o.id)).toEqual(["b"]);
  });

  it("new upsert after queued delete is kept after the delete", () => {
    const pending = [op({ id: "a", entityId: "ent-1", action: "delete" })];
    const next = op({ id: "b", entityId: "ent-1" });
    const kept = coalesceOutbox(pending, next);
    expect(kept.map((o) => o.id)).toEqual(["a", "b"]);
  });

  it("new upsert replaces queued upserts only when no delete is queued", () => {
    const pending = [op({ id: "a", entityId: "ent-1", action: "delete" }), op({ id: "c", entityId: "ent-2" })];
    const next = op({ id: "b", entityId: "ent-1" });
    const kept = coalesceOutbox(pending, next);
    expect(kept.map((o) => o.id)).toEqual(["a", "c", "b"]);
  });
});

describe("supersededOperationIds", () => {
  it("returns ids in pending but not in kept", () => {
    const pending = [op({ id: "a" }), op({ id: "b" })];
    const kept = [op({ id: "b" })];
    expect(supersededOperationIds(pending, kept)).toEqual(["a"]);
  });

  it("returns empty when nothing superseded", () => {
    const pending = [op({ id: "a" })];
    const kept = [op({ id: "a" })];
    expect(supersededOperationIds(pending, kept)).toEqual([]);
  });
});
