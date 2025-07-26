/**
 * Cached HTTP request handlers - Extends RequestHandlers with caching
 */

import { logger } from '../../utils/logger';
import { RequestHandlers, RequestOptions, ApiResponse } from './requestHandlers';
import { apiCache, shouldCache, getCacheTTL } from '../../utils/api/cache';
import { HttpMethod } from '../../types/enums';

export class CachedRequestHandlers extends RequestHandlers {
  constructor(
    baseURL: string,
    defaultHeaders: Record<string, string>,
    defaultTimeout: number
  ) {
    super(baseURL, defaultHeaders, defaultTimeout);
  }

  /**
   * Cached GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const method = HttpMethod.GET;
    const url = this.buildURL(endpoint);
    
    // Check if this request should be cached
    if (!shouldCache(url, method) || options?.signal) {
      return super.get<T>(endpoint, options);
    }

    // Check for cached data
    const cached = apiCache.get<ApiResponse<T>>(url, { method });
    if (cached) {
      logger.debug('Cache hit', { url, method });
      return cached;
    }

    // Check for pending request (deduplication)
    const pendingRequest = apiCache.getPendingRequest(url, { method });
    if (pendingRequest) {
      logger.debug('Request deduplication', { url, method });
      return pendingRequest as Promise<ApiResponse<T>>;
    }

    // Create new request with caching
    const requestPromise = super.get<T>(endpoint, options);
    
    // Store pending request for deduplication
    apiCache.setPendingRequest(url, requestPromise, { method });

    try {
      const response = await requestPromise;
      
      // Cache successful response
      const ttl = getCacheTTL(url);
      apiCache.set(url, response, { method }, ttl);
      
      logger.debug('Response cached', { url, method, ttl });
      return response;
      
    } catch (error) {
      logger.debug('Request failed, not caching', { url, method, error });
      throw error;
    }
  }

  /**
   * Cached HEAD request
   */
  async head(endpoint: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    const method = 'HEAD';
    const url = this.buildURL(endpoint);
    
    // Check if this request should be cached
    if (!shouldCache(url, method) || options?.signal) {
      return super.head(endpoint, options);
    }

    // Check for cached data
    const cached = apiCache.get<ApiResponse<void>>(url, { method });
    if (cached) {
      logger.debug('Cache hit', { url, method });
      return cached;
    }

    // Check for pending request (deduplication)
    const pendingRequest = apiCache.getPendingRequest(url, { method });
    if (pendingRequest) {
      logger.debug('Request deduplication', { url, method });
      return pendingRequest as Promise<ApiResponse<void>>;
    }

    // Create new request with caching
    const requestPromise = super.head(endpoint, options);
    
    // Store pending request for deduplication
    apiCache.setPendingRequest(url, requestPromise, { method });

    try {
      const response = await requestPromise;
      
      // Cache successful response
      const ttl = getCacheTTL(url);
      apiCache.set(url, response, { method }, ttl);
      
      logger.debug('Response cached', { url, method, ttl });
      return response;
      
    } catch (error) {
      logger.debug('Request failed, not caching', { url, method, error });
      throw error;
    }
  }

  /**
   * POST request - invalidates cache patterns
   */
  async post<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await super.post<T>(endpoint, body, options);
    
    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint, HttpMethod.POST);
    
    return response;
  }

  /**
   * PUT request - invalidates cache patterns
   */
  async put<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await super.put<T>(endpoint, body, options);
    
    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint, HttpMethod.PUT);
    
    return response;
  }

  /**
   * PATCH request - invalidates cache patterns
   */
  async patch<T>(endpoint: string, body?: any, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await super.patch<T>(endpoint, body, options);
    
    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint, HttpMethod.PATCH);
    
    return response;
  }

  /**
   * DELETE request - invalidates cache patterns
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    const response = await super.delete<T>(endpoint, options);
    
    // Invalidate related cache entries
    this.invalidateRelatedCache(endpoint, 'DELETE');
    
    return response;
  }

  /**
   * Build URL from endpoint (expose protected method)
   */
  buildURL(endpoint: string): string {
    return (this as any).buildURL(endpoint);
  }

  /**
   * Invalidate cache entries related to the modified resource
   */
  private invalidateRelatedCache(endpoint: string, method: string): void {
    const url = this.buildURL(endpoint);
    
    // Define cache invalidation patterns based on endpoint
    const invalidationPatterns: Array<string | RegExp> = [];
    
    if (url.includes('/api/projects')) {
      invalidationPatterns.push(/GET:\/api\/projects/);
      if (url.match(/\/api\/projects\/\d+/)) {
        // Specific project updated, invalidate project lists and specific project
        invalidationPatterns.push(/GET:\/api\/projects$/);
        invalidationPatterns.push(new RegExp(`GET:${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
      }
    }
    
    if (url.includes('/api/users')) {
      invalidationPatterns.push(/GET:\/api\/users/);
      if (url.match(/\/api\/users\/\d+/)) {
        invalidationPatterns.push(/GET:\/api\/users$/);
        invalidationPatterns.push(new RegExp(`GET:${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
      }
    }
    
    if (url.includes('/api/factories')) {
      invalidationPatterns.push(/GET:\/api\/factories/);
      if (url.match(/\/api\/factories\/\d+/)) {
        invalidationPatterns.push(/GET:\/api\/factories$/);
        invalidationPatterns.push(new RegExp(`GET:${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
      }
    }
    
    if (url.includes('/api/tasks')) {
      invalidationPatterns.push(/GET:\/api\/tasks/);
      if (url.match(/\/api\/tasks\/\d+/)) {
        invalidationPatterns.push(/GET:\/api\/tasks$/);
        invalidationPatterns.push(new RegExp(`GET:${url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
      }
    }
    
    // Apply invalidation patterns
    for (const pattern of invalidationPatterns) {
      apiCache.invalidate(pattern);
      logger.debug('Cache invalidated', { pattern, trigger: `${method} ${url}` });
    }
  }

  /**
   * Manual cache invalidation for specific patterns
   */
  invalidateCache(pattern?: string | RegExp): void {
    apiCache.invalidate(pattern);
    logger.debug('Manual cache invalidation', { pattern });
  }

  /**
   * Clear all cache
   */
  clearCache(): void {
    apiCache.clear();
    logger.debug('All cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return apiCache.getStats();
  }
}