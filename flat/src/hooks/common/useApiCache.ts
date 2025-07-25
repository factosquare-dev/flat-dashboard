/**
 * API Cache management hook
 */

import { useCallback, useEffect } from 'react';
import { apiClient } from '../../services/api';

interface CacheStats {
  cacheSize: number;
  pendingRequests: number;
  totalSize: number;
}

interface UseApiCacheReturn {
  invalidateCache: (pattern?: string | RegExp) => void;
  clearCache: () => void;
  getCacheStats: () => CacheStats;
  invalidateProjectCache: () => void;
  invalidateUserCache: () => void;
  invalidateFactoryCache: () => void;
  invalidateTaskCache: () => void;
}

/**
 * Hook for managing API cache
 */
export function useApiCache(): UseApiCacheReturn {
  const invalidateCache = useCallback((pattern?: string | RegExp) => {
    apiClient.invalidateCache(pattern);
  }, []);

  const clearCache = useCallback(() => {
    apiClient.clearCache();
  }, []);

  const getCacheStats = useCallback((): CacheStats => {
    return apiClient.getCacheStats();
  }, []);

  // Specific cache invalidation methods for common patterns
  const invalidateProjectCache = useCallback(() => {
    apiClient.invalidateCache(/GET:\/api\/projects/);
  }, []);

  const invalidateUserCache = useCallback(() => {
    apiClient.invalidateCache(/GET:\/api\/users/);
  }, []);

  const invalidateFactoryCache = useCallback(() => {
    apiClient.invalidateCache(/GET:\/api\/factories/);
  }, []);

  const invalidateTaskCache = useCallback(() => {
    apiClient.invalidateCache(/GET:\/api\/tasks/);
  }, []);

  // Clear cache on component unmount for memory management
  useEffect(() => {
    return () => {
      // Optional: clear cache on app cleanup
      // Uncomment if needed for memory management
      // clearCache();
    };
  }, []);

  return {
    invalidateCache,
    clearCache,
    getCacheStats,
    invalidateProjectCache,
    invalidateUserCache,
    invalidateFactoryCache,
    invalidateTaskCache,
  };
}

/**
 * Hook for automatic cache invalidation based on data mutations
 */
export function useAutoCacheInvalidation() {
  const { invalidateProjectCache, invalidateUserCache, invalidateFactoryCache, invalidateTaskCache } = useApiCache();

  const handleProjectMutation = useCallback(() => {
    invalidateProjectCache();
  }, [invalidateProjectCache]);

  const handleUserMutation = useCallback(() => {
    invalidateUserCache();
  }, [invalidateUserCache]);

  const handleFactoryMutation = useCallback(() => {
    invalidateFactoryCache();
  }, [invalidateFactoryCache]);

  const handleTaskMutation = useCallback(() => {
    invalidateTaskCache();
  }, [invalidateTaskCache]);

  return {
    handleProjectMutation,
    handleUserMutation,
    handleFactoryMutation,
    handleTaskMutation,
  };
}