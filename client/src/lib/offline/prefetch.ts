import { cache, CACHE_KEYS } from './cache';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3000`;

async function fetchJson<T>(path: string): Promise<T | null> {
  const token = localStorage.getItem('accessToken');
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

/**
 * Eagerly fetches the read data the create-sale form needs and stores it
 * in IndexedDB so the form can render offline. Best-effort: failures are
 * swallowed (the form will fall back to whatever's already cached).
 */
export async function prefetchOfflineData(): Promise<void> {
  await Promise.all([
    fetchJson<unknown>('/branches').then((data) => {
      if (data) cache.put(CACHE_KEYS.branches, data);
    }),
    fetchJson<unknown>('/products?includeRelations=true').then((data) => {
      if (data) cache.put(CACHE_KEYS.products, data);
    }),
    fetchJson<unknown>('/customers?take=1000').then((data) => {
      if (data) cache.put(CACHE_KEYS.customers, data);
    }),
    fetchJson<unknown>('/inventory').then((data) => {
      if (data) cache.put(CACHE_KEYS.inventory, data);
    }),
  ]);
}
