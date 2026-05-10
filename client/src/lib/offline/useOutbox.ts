import { useEffect, useState } from 'react';
import { outbox, type OutboxEntry } from './outbox';

export function useOutboxEntries(resource?: string): OutboxEntry[] {
  const [entries, setEntries] = useState<OutboxEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    const refresh = async () => {
      const list = resource ? await outbox.listByResource(resource) : await outbox.list();
      if (!cancelled) setEntries(list);
    };
    refresh();
    const unsubscribe = outbox.subscribe(refresh);
    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, [resource]);

  return entries;
}

export function usePendingCount(): number {
  const entries = useOutboxEntries();
  return entries.filter((e) => e.status === 'pending').length;
}
