/**
 * Simple cache layer for Firestore queries
 * Reduces redundant network calls
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class FirestoreCache {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private readonly TTL: number = 30000; // 30 seconds default

  /**
   * Get cached data if available and not expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Invalidate cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string): void {
    const regex = new RegExp(pattern);
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Singleton instance
export const firestoreCache = new FirestoreCache();

/**
 * Generate cache key for expenses query
 */
export const getExpensesCacheKey = (householdId: string, options?: {
  startDate?: Date;
  endDate?: Date;
  category?: string;
}): string => {
  let key = `expenses-${householdId}`;
  if (options?.startDate) key += `-from-${options.startDate.getTime()}`;
  if (options?.endDate) key += `-to-${options.endDate.getTime()}`;
  if (options?.category) key += `-cat-${options.category}`;
  return key;
};

/**
 * Generate cache key for tasks query
 */
export const getTasksCacheKey = (householdId: string): string => {
  return `tasks-${householdId}`;
};

/**
 * Generate cache key for inventory query
 */
export const getInventoryCacheKey = (householdId: string): string => {
  return `inventory-${householdId}`;
};

