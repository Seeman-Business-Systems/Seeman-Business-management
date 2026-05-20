import { useEffect, useState } from 'react';
import { cache } from './cache';

/**
 * Returns RTK Query data when available, falling back to a persisted IndexedDB cache.
 * Side effect: refreshes the cache whenever RTK has fresh data.
 */
export function useCachedFallback<T>(
  rtkData: T | undefined,
  cacheKey: string,
): T | undefined {
  const [cached, setCached] = useState<T | undefined>();

  useEffect(() => {
    let cancelled = false;
    cache.get<T>(cacheKey).then((c) => {
      if (!cancelled && c !== null) setCached(c);
    });
    return () => {
      cancelled = true;
    };
  }, [cacheKey]);

  useEffect(() => {
    if (rtkData !== undefined) {
      cache.put(cacheKey, rtkData);
    }
  }, [rtkData, cacheKey]);

  return rtkData ?? cached;
}
