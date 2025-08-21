import { queryCache } from './queryCache';

/**
 * Utility function to invalidate cache
 */
export const invalidateQuery = (queryKey: string | string[]): void => {
  const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
  queryCache.delete(key);
};

/**
 * Utility function to clear all cache
 */
export const clearQueryCache = (): void => {
  queryCache.clear();
};

/**
 * Utility function to prefetch data
 */
export const prefetchQuery = async <T>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: { staleTime?: number; cacheTime?: number } = {}
): Promise<T> => {
  const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
  const { staleTime = 5 * 60 * 1000, cacheTime = 10 * 60 * 1000 } = options;

  const cached = queryCache.get(key);
  if (cached && Date.now() - cached.timestamp <= staleTime) {
    return cached.data;
  }

  const result = await queryFn();
  
  queryCache.set(key, {
    data: result,
    timestamp: Date.now(),
    staleTime,
    cacheTime,
  });

  return result;
};

/**
 * Convert query key to string
 */
export const getQueryKey = (queryKey: string | string[]): string => {
  return Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
};