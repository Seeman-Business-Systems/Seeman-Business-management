import { v4 as uuidv4 } from 'uuid';
import { getDB, type OutboxEntry } from './db';

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export type EnqueueInput = {
  resource: string;
  endpoint: string;
  method: OutboxEntry['method'];
  body: Record<string, unknown> | null;
  invalidatesTags?: string[];
  /** Optional caller-supplied id; otherwise generated. Doubles as the idempotency key. */
  id?: string;
};

export const outbox = {
  async enqueue(input: EnqueueInput): Promise<OutboxEntry> {
    const now = Date.now();
    const entry: OutboxEntry = {
      id: input.id ?? uuidv4(),
      resource: input.resource,
      endpoint: input.endpoint,
      method: input.method,
      body: input.body,
      status: 'pending',
      attemptCount: 0,
      lastError: null,
      createdAt: now,
      updatedAt: now,
      invalidatesTags: input.invalidatesTags ?? [],
    };
    const db = await getDB();
    await db.put('outbox', entry);
    notify();
    return entry;
  },

  async list(): Promise<OutboxEntry[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('outbox', 'by-createdAt');
    return all;
  },

  async listPending(): Promise<OutboxEntry[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('outbox', 'by-status', 'pending');
    return all.sort((a, b) => a.createdAt - b.createdAt);
  },

  async listByResource(resource: string): Promise<OutboxEntry[]> {
    const db = await getDB();
    const all = await db.getAllFromIndex('outbox', 'by-resource', resource);
    return all.sort((a, b) => a.createdAt - b.createdAt);
  },

  async count(): Promise<number> {
    const db = await getDB();
    return db.count('outbox');
  },

  async pendingCount(): Promise<number> {
    const db = await getDB();
    return db.countFromIndex('outbox', 'by-status', 'pending');
  },

  async remove(id: string): Promise<void> {
    const db = await getDB();
    await db.delete('outbox', id);
    notify();
  },

  async markFailed(id: string, error: string): Promise<void> {
    const db = await getDB();
    const entry = await db.get('outbox', id);
    if (!entry) return;
    entry.status = 'failed';
    entry.lastError = error;
    entry.updatedAt = Date.now();
    await db.put('outbox', entry);
    notify();
  },

  async retryFailed(id: string): Promise<void> {
    const db = await getDB();
    const entry = await db.get('outbox', id);
    if (!entry) return;
    entry.status = 'pending';
    entry.lastError = null;
    entry.updatedAt = Date.now();
    await db.put('outbox', entry);
    notify();
  },

  async incrementAttempt(id: string, error: string | null = null): Promise<void> {
    const db = await getDB();
    const entry = await db.get('outbox', id);
    if (!entry) return;
    entry.attemptCount += 1;
    entry.lastError = error;
    entry.updatedAt = Date.now();
    await db.put('outbox', entry);
    notify();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export type { OutboxEntry };
