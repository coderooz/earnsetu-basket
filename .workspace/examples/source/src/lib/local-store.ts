import { openDB, type DBSchema, type IDBPDatabase } from 'idb';

export type BasketResource = 'lists' | 'items' | 'shops' | 'purchases';
export type BasketRecord = {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  syncStatus?: 'local' | 'pending' | 'synced';
  [key: string]: unknown;
};
export type LocalOperation = {
  id: string;
  resource: BasketResource;
  action: 'upsert' | 'delete';
  entityId: string;
  payload: Record<string, unknown>;
  createdAt: string;
};
interface BasketDB extends DBSchema {
  lists: { key: string; value: BasketRecord };
  items: { key: string; value: BasketRecord; indexes: { 'by-list': string } };
  shops: { key: string; value: BasketRecord };
  purchases: {
    key: string;
    value: BasketRecord;
    indexes: { 'by-date': string };
  };
  outbox: {
    key: string;
    value: LocalOperation;
    indexes: { 'by-created': string };
  };
  meta: { key: string; value: unknown };
}
let database: Promise<IDBPDatabase<BasketDB>> | undefined;
function db() {
  if (!database) {
    database = openDB<BasketDB>('earnsetu-basket', 1, {
      upgrade(instance) {
        instance.createObjectStore('lists', { keyPath: 'id' });
        const items = instance.createObjectStore('items', { keyPath: 'id' });
        items.createIndex('by-list', 'listId');
        instance.createObjectStore('shops', { keyPath: 'id' });
        const purchases = instance.createObjectStore('purchases', {
          keyPath: 'id',
        });
        purchases.createIndex('by-date', 'purchasedAt');
        const outbox = instance.createObjectStore('outbox', { keyPath: 'id' });
        outbox.createIndex('by-created', 'createdAt');
        instance.createObjectStore('meta');
      },
    });
  }
  return database;
}
export async function allRecords<T extends BasketRecord>(
  resource: BasketResource
): Promise<T[]> {
  const instance = await db();
  return instance.getAll(resource) as Promise<T[]>;
}
export async function putLocalRecord(
  resource: BasketResource,
  record: BasketRecord
) {
  const instance = await db();
  await instance.put(resource, record);
}
export async function deleteLocalRecord(resource: BasketResource, id: string) {
  const instance = await db();
  await instance.delete(resource, id);
}
export async function addOutbox(operation: LocalOperation) {
  const instance = await db();
  await instance.put('outbox', operation);
}
export async function getOutbox(): Promise<LocalOperation[]> {
  const instance = await db();
  return instance.getAllFromIndex('outbox', 'by-created');
}
export async function removeOutbox(id: string) {
  const instance = await db();
  await instance.delete('outbox', id);
}
export async function setMeta(key: string, value: unknown) {
  const instance = await db();
  await instance.put('meta', value, key);
}
export async function getMeta<T = unknown>(
  key: string
): Promise<T | undefined> {
  const instance = await db();
  return instance.get('meta', key) as Promise<T | undefined>;
}
export async function clearAll() {
  const instance = await db();
  const tx = instance.transaction(
    ['lists', 'items', 'shops', 'purchases', 'outbox'],
    'readwrite'
  );
  await Promise.all([
    tx.objectStore('lists').clear(),
    tx.objectStore('items').clear(),
    tx.objectStore('shops').clear(),
    tx.objectStore('purchases').clear(),
    tx.objectStore('outbox').clear(),
  ]);
  await tx.done;
}
