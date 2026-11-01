import { db, router, json, error, requireAuth } from '@appdeploy/sdk';

const resources = ['lists', 'items', 'shops', 'purchases'] as const;
type Resource = (typeof resources)[number];
type Action = 'upsert' | 'delete';

function safeUserKey(userId: string) {
  return userId.replace(/[^A-Za-z0-9]/g, '').slice(0, 48);
}
function tableFor(userId: string, resource: Resource) {
  return 'u_' + safeUserKey(userId) + '_' + resource;
}
function receiptsFor(userId: string) {
  return 'u_' + safeUserKey(userId) + '_receipts';
}
function isObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}
function validResource(value: string): value is Resource {
  return resources.includes(value as Resource);
}
function validPayload(resource: Resource, payload: Record<string, unknown>) {
  if (resource === 'lists')
    return (
      typeof payload.name === 'string' &&
      payload.name.trim().length > 0 &&
      payload.name.length <= 100
    );
  if (resource === 'items')
    return (
      typeof payload.name === 'string' &&
      payload.name.trim().length > 0 &&
      typeof payload.listId === 'string' &&
      Number(payload.quantity) > 0
    );
  if (resource === 'shops')
    return (
      typeof payload.name === 'string' &&
      payload.name.trim().length > 0 &&
      payload.name.length <= 100
    );
  return (
    typeof payload.itemName === 'string' &&
    payload.itemName.trim().length > 0 &&
    Number.isFinite(Number(payload.totalMinor)) &&
    Number(payload.totalMinor) >= 0
  );
}

export const handler = router({
  'GET /api/_healthcheck': [
    async () => json({ ok: true, service: 'earnsetu-basket-api' }),
  ],
  'GET /api/basket/:resource': [
    requireAuth(),
    async ctx => {
      const resource = ctx.params.resource;
      if (!validResource(resource)) return error('Unknown resource', 404);
      const limit = Math.min(Math.max(Number(ctx.query.limit || 100), 1), 100);
      const page = await db.list(tableFor(ctx.user!.userId, resource), {
        limit,
        nextToken: ctx.query.cursor || undefined,
      });
      return json({ items: page.items, nextToken: page.nextToken || null });
    },
  ],
  'POST /api/basket/sync': [
    requireAuth(),
    async ctx => {
      if (!isObject(ctx.body))
        return error('Invalid synchronization operation', 400);
      const body = ctx.body;
      const operationId = typeof body.id === 'string' ? body.id : '';
      const resource = body.resource;
      const action = body.action as Action;
      const entityId = typeof body.entityId === 'string' ? body.entityId : '';
      if (
        !operationId ||
        operationId.length > 100 ||
        !entityId ||
        entityId.length > 100 ||
        !validResource(String(resource))
      ) {
        return error('Invalid synchronization identifiers', 400);
      }
      if (action !== 'upsert' && action !== 'delete')
        return error('Unsupported synchronization action', 400);
      const userId = ctx.user!.userId;
      const receiptTable = receiptsFor(userId);
      const [receipt] = await db.get(receiptTable, [operationId], {
        consistent: true,
      });
      if (receipt) return json({ ok: true, replayed: true });
      const targetTable = tableFor(userId, resource as Resource);
      const payload = isObject(body.payload) ? body.payload : {};
      const receiptRecord = {
        id: operationId,
        resource,
        action,
        entity_id: entityId,
        processed_at: new Date().toISOString(),
      };
      if (action === 'upsert') {
        if (
          payload.id !== entityId ||
          !validPayload(resource as Resource, payload)
        )
          return error('Record validation failed', 422);
        const record = { ...payload, id: entityId, owner_user_id: userId };
        const write = db.tx.add(targetTable, [record]);
        const receiptWrite = db.tx.add(receiptTable, [receiptRecord]);
        try {
          await db.transact([write, receiptWrite]);
          return json({ ok: true, entityId });
        } catch {
          const [existingReceipt] = await db.get(receiptTable, [operationId], {
            consistent: true,
          });
          if (existingReceipt) return json({ ok: true, replayed: true });
          return error(
            'The record already exists or could not be synchronized. Refresh and retry.',
            409
          );
        }
      }
      const [existing] = await db.get(targetTable, [entityId], {
        consistent: true,
      });
      if (!existing) {
        const [receiptId] = await db.add(receiptTable, [receiptRecord]);
        return receiptId
          ? json({ ok: true, deleted: false })
          : error('Could not record synchronization receipt', 503);
      }
      if (existing.owner_user_id !== userId)
        return error('Record access denied', 403);
      const deletion = db.tx.delete(targetTable, [entityId]);
      const receiptWrite = db.tx.add(receiptTable, [receiptRecord]);
      try {
        await db.transact([deletion, receiptWrite]);
        return json({ ok: true, deleted: true });
      } catch {
        const [existingReceipt] = await db.get(receiptTable, [operationId], {
          consistent: true,
        });
        if (existingReceipt) return json({ ok: true, replayed: true });
        return error('Could not synchronize deletion. Retry later.', 503);
      }
    },
  ],
});
