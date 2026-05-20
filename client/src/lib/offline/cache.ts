import { getDB } from './db';

export const cache = {
  async put<T>(key: string, data: T): Promise<void> {
    const db = await getDB();
    await db.put('cache', { key, data, updatedAt: Date.now() });
  },

  async get<T>(key: string): Promise<T | null> {
    const db = await getDB();
    const entry = await db.get('cache', key);
    return entry ? (entry.data as T) : null;
  },

  async getMeta(key: string): Promise<{ updatedAt: number } | null> {
    const db = await getDB();
    const entry = await db.get('cache', key);
    return entry ? { updatedAt: entry.updatedAt } : null;
  },

  async clear(): Promise<void> {
    const db = await getDB();
    await db.clear('cache');
  },
};

export const CACHE_KEYS = {
  branches: 'branches',
  products: 'products',
  customers: 'customers',
  inventory: 'inventory',
} as const;
