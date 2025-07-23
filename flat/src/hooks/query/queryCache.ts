import type { CacheEntry } from './types';
import { DURATION } from '../../constants/time';

class QueryCache {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up cache periodically
    this.cleanupInterval = setInterval(() => this.cleanup(), DURATION.CACHE_CLEANUP_INTERVAL);
  }

  get<T = any>(key: string): CacheEntry<T> | undefined {
    return this.cache.get(key) as CacheEntry<T> | undefined;
  }

  set<T = any>(key: string, entry: CacheEntry<T>): void {
    this.cache.set(key, entry);
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  isStale(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return true;
    
    const now = Date.now();
    return now - entry.timestamp > entry.staleTime;
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.cacheTime) {
        this.cache.delete(key);
      }
    }
  }

  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Create singleton instance
export const queryCache = new QueryCache();