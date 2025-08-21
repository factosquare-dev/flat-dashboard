import { useCallback, useEffect, useRef } from 'react';
import { useAsyncState } from '@/useAsyncState';
import type { QueryOptions, QueryResult } from './types';
import { queryCache } from './queryCache';
import { executeWithRetry } from './retryLogic';
import { getQueryKey } from './cacheUtils';
import { DURATION } from '@/constants/time';

export const useQuery = <T = any>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryResult<T> => {
  const {
    enabled = true,
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    staleTime = DURATION.DEFAULT_STALE_TIME,
    cacheTime = DURATION.DEFAULT_CACHE_TIME,
    refetchInterval,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    select,
    ...asyncOptions
  } = options;

  const key = getQueryKey(queryKey);
  const [state, actions] = useAsyncState<T>(asyncOptions);
  
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef<Date | null>(null);
  const dataUpdatedAtRef = useRef<Date | null>(null);
  const errorUpdatedAtRef = useRef<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if data is stale
  const isStale = useCallback(() => {
    return queryCache.isStale(key);
  }, [key]);

  // Load data from cache if available
  const loadFromCache = useCallback(() => {
    const cached = queryCache.get(key);
    if (cached && !queryCache.isStale(key)) {
      actions.setData(select ? select(cached.data) : cached.data);
      dataUpdatedAtRef.current = new Date(cached.timestamp);
      return true;
    }
    return false;
  }, [key, actions, select]);

  // Save data to cache
  const saveToCache = useCallback((data: T) => {
    queryCache.set(key, {
      data,
      timestamp: Date.now(),
      staleTime,
      cacheTime,
    });
  }, [key, staleTime, cacheTime]);

  // Execute query with retry logic
  const executeQuery = useCallback(async (): Promise<T> => {
    if (isFetchingRef.current) {
      throw new Error('Query is already in progress');
    }

    isFetchingRef.current = true;
    lastFetchRef.current = new Date();

    try {
      const result = await executeWithRetry(
        queryFn,
        { retry, retryDelay, onError },
        0
      );
      
      // Save to cache
      saveToCache(result);
      
      // Transform data if selector is provided
      const transformedResult = select ? select(result) : result;
      
      // Update refs
      dataUpdatedAtRef.current = new Date();
      
      // Call success callback
      if (onSuccess) {
        onSuccess(transformedResult);
      }
      
      return transformedResult;
    } catch (error) {
      errorUpdatedAtRef.current = new Date();
      throw error;
    } finally {
      isFetchingRef.current = false;
    }
  }, [queryFn, retry, retryDelay, saveToCache, select, onSuccess, onError]);

  // Refetch function
  const refetch = useCallback(async (): Promise<T> => {
    return actions.execute(executeQuery);
  }, [actions, executeQuery]);

  // Initial fetch
  useEffect(() => {
    if (!enabled) return;

    // Try to load from cache first
    if (loadFromCache()) {
      return;
    }

    // Fetch fresh data
    refetch().catch(() => {
      // Error is already handled in the state
    });
  }, [enabled, loadFromCache, refetch]);

  // Refetch interval
  useEffect(() => {
    if (!enabled || !refetchInterval) return;

    intervalRef.current = setInterval(() => {
      if (isStale()) {
        refetch().catch(() => {
          // Error is already handled in the state
        });
      }
    }, refetchInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, refetchInterval, isStale, refetch]);

  // Refetch on window focus
  useEffect(() => {
    if (!enabled || !refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (isStale()) {
        refetch().catch(() => {
          // Error is already handled in the state
        });
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [enabled, refetchOnWindowFocus, isStale, refetch]);

  // Refetch on reconnect
  useEffect(() => {
    if (!enabled || !refetchOnReconnect) return;

    const handleOnline = () => {
      if (isStale()) {
        refetch().catch(() => {
          // Error is already handled in the state
        });
      }
    };

    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, [enabled, refetchOnReconnect, isStale, refetch]);

  return {
    ...state,
    refetch,
    isFetching: isFetchingRef.current,
    isStale: isStale(),
    dataUpdatedAt: dataUpdatedAtRef.current,
    errorUpdatedAt: errorUpdatedAtRef.current,
  };
};