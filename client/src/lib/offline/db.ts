import { openDB, type IDBPDatabase, type DBSchema } from 'idb';

export type OutboxEntry = {
  id: string;
  resource: string;
  endpoint: string;
  method: 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body: Record<string, unknown> | null;
  status: 'pending' | 'failed';
  attemptCount: number;
  lastError: string | null;
  createdAt: number;
  updatedAt: number;
  invalidatesTags: string[];
};

interface OfflineDB extends DBSchema {
  outbox: {
    key: string;
    value: OutboxEntry;
    indexes: {
      'by-status': string;
      'by-resource': string;
      'by-createdAt': number;
    };
  };
}

const DB_NAME = 'seeman-offline';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OfflineDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OfflineDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('outbox', { keyPath: 'id' });
        store.createIndex('by-status', 'status');
        store.createIndex('by-resource', 'resource');
        store.createIndex('by-createdAt', 'createdAt');
      },
    });
  }
  return dbPromise;
}
