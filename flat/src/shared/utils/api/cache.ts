/**
 * API Request Cache
 * Implements caching and deduplication for API requests
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expires: number;
}

interface PendingRequest {
  promise: Promise<any>;
  timestamp: number;
}

class APICache {
  private cache = new Map<string, CacheEntry<any>>();
  private pendingRequests = new Map<string, PendingRequest>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  /**
   * Generate cache key from request details
   */
  private generateKey(url: string, options?: RequestInit): string {
    const method = options?.method || 'GET';
    const body = options?.body ? JSON.stringify(options.body) : '';
    return `${method}:${url}:${body}`;
  }

  /**
   * Check if cache entry is still valid
   */
  private isValid<T>(entry: CacheEntry<T>): boolean {
    return Date.now() < entry.expires;
  }

  /**
   * Get cached data if available and valid
   */
  get<T>(url: string, options?: RequestInit): T | null {
    const key = this.generateKey(url, options);
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (entry && this.isValid(entry)) {
      return entry.data;
    }

    // Remove expired entry
    if (entry) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Set cache entry
   */
  set<T>(url: string, data: T, options?: RequestInit, ttl?: number): void {
    const key = this.generateKey(url, options);
    const expires = Date.now() + (ttl || this.defaultTTL);

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expires,
    });
  }

  /**
   * Check if request is pending (for deduplication)
   */
  getPendingRequest(url: string, options?: RequestInit): Promise<any> | null {
    const key = this.generateKey(url, options);
    const pending = this.pendingRequests.get(key);

    if (pending) {
      // Clean up old pending requests (> 30 seconds)
      if (Date.now() - pending.timestamp > 30000) {
        this.pendingRequests.delete(key);
        return null;
      }
      return pending.promise;
    }

    return null;
  }

  /**
   * Set pending request
   */
  setPendingRequest(url: string, promise: Promise<any>, options?: RequestInit): void {
    const key = this.generateKey(url, options);
    this.pendingRequests.set(key, {
      promise,
      timestamp: Date.now(),
    });

    // Clean up after completion
    promise.finally(() => {
      this.pendingRequests.delete(key);
    });
  }

  /**
   * Clear cache entries matching pattern
   */
  invalidate(pattern?: string | RegExp): void {
    if (!pattern) {
      this.cache.clear();
      return;
    }

    const regex = typeof pattern === 'string' ? new RegExp(pattern) : pattern;
    
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
    this.pendingRequests.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    cacheSize: number;
    pendingRequests: number;
    totalSize: number;
  } {
    let totalSize = 0;

    for (const entry of this.cache.values()) {
      totalSize += JSON.stringify(entry).length;
    }

    return {
      cacheSize: this.cache.size,
      pendingRequests: this.pendingRequests.size,
      totalSize,
    };
  }
}

// Export singleton instance
export const apiCache = new APICache();

// Cache configuration
export const cacheConfig = {
  // URLs that should be cached
  cacheable: [
    /^\/api\/projects/,
    /^\/api\/users/,
    /^\/api\/factories/,
    /^\/api\/tasks/,
    /^\/api\/dashboard\/stats/,
  ],
  
  // TTL for different endpoints (in ms)
  ttl: {
    '/api/projects': 10 * 60 * 1000, // 10 minutes
    '/api/users': 30 * 60 * 1000, // 30 minutes
    '/api/factories': 60 * 60 * 1000, // 1 hour
    '/api/tasks': 5 * 60 * 1000, // 5 minutes
    '/api/projects/search': 2 * 60 * 1000, // 2 minutes
    '/api/users/search': 2 * 60 * 1000, // 2 minutes
    '/api/factories/search': 5 * 60 * 1000, // 5 minutes
    '/api/dashboard/stats': 15 * 60 * 1000, // 15 minutes
  },
  
  // Methods that should be cached
  methods: ['GET', 'HEAD'],
};

/**
 * Check if request should be cached
 */
export function shouldCache(url: string, method: string = 'GET'): boolean {
  if (!cacheConfig.methods.includes(method.toUpperCase())) {
    return false;
  }

  return cacheConfig.cacheable.some(pattern => {
    if (typeof pattern === 'string') {
      return url.startsWith(pattern);
    }
    return pattern.test(url);
  });
}

/**
 * Get TTL for specific URL
 */
export function getCacheTTL(url: string): number | undefined {
  for (const [pattern, ttl] of Object.entries(cacheConfig.ttl)) {
    if (url.startsWith(pattern)) {
      return ttl;
    }
  }
  return undefined;
}