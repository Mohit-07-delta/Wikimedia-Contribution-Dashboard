interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes

class MemoryCache {
  private store = new Map<string, CacheEntry<unknown>>();

  /**
   * Build a cache key from route-specific parts.
   * Example: "summary:en.wikipedia.org:Jimbo_Wales"
   */
  static key(...parts: string[]): string {
    return parts.join(":");
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }
}

// Single shared instance across all routes
export const cache = new MemoryCache();
export { MemoryCache };
