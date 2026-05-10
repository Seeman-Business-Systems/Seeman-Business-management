import { outbox, type OutboxEntry } from './outbox';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

export type SyncResult = {
  synced: OutboxEntry[];
  failed: OutboxEntry[];
};

export type SyncOptions = {
  onEntrySynced?: (entry: OutboxEntry) => void;
  onEntryFailed?: (entry: OutboxEntry, error: string) => void;
};

/**
 * Drains the outbox by replaying each pending entry against the API.
 * Server-side idempotency (keyed by entry.id) guarantees safe replay.
 */
export async function flushOutbox(options: SyncOptions = {}): Promise<SyncResult> {
  const pending = await outbox.listPending();
  const result: SyncResult = { synced: [], failed: [] };

  for (const entry of pending) {
    const outcome = await replay(entry);
    if (outcome === 'synced') {
      await outbox.remove(entry.id);
      result.synced.push(entry);
      options.onEntrySynced?.(entry);
    } else if (outcome === 'permanent-failure') {
      result.failed.push(entry);
      options.onEntryFailed?.(entry, entry.lastError ?? 'Unknown error');
    }
    // 'transient-failure' leaves the entry pending for the next flush
  }

  return result;
}

type ReplayOutcome = 'synced' | 'transient-failure' | 'permanent-failure';

async function replay(entry: OutboxEntry): Promise<ReplayOutcome> {
  const token = localStorage.getItem('accessToken');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Idempotency-Key': entry.id,
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body = entry.body ? { ...entry.body, idempotencyKey: entry.id } : null;

  try {
    const response = await fetch(`${API_BASE_URL}${entry.endpoint}`, {
      method: entry.method,
      headers,
      body: body ? JSON.stringify(body) : null,
    });

    if (response.ok) {
      return 'synced';
    }

    // 4xx (other than 401) is a permanent failure — replaying will not help
    if (response.status >= 400 && response.status < 500 && response.status !== 401) {
      const text = await safeReadText(response);
      await outbox.markFailed(entry.id, `${response.status} ${text}`);
      return 'permanent-failure';
    }

    // 401 / 5xx / network — transient
    await outbox.incrementAttempt(entry.id, `${response.status}`);
    return 'transient-failure';
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    await outbox.incrementAttempt(entry.id, message);
    return 'transient-failure';
  }
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return '';
  }
}
