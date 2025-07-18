import { useCallback, useEffect, useRef } from 'react';
import { useAsyncState, type AsyncState, type UseAsyncStateOptions } from './useAsyncState';

export interface QueryOptions<T = any> extends UseAsyncStateOptions {
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchInterval?: number;
  retry?: boolean | number;
  retryDelay?: number;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  select?: (data: T) => any;
}

export interface QueryResult<T = any> extends AsyncState<T> {
  refetch: () => Promise<T>;
  isFetching: boolean;
  isStale: boolean;
  dataUpdatedAt: Date | null;
  errorUpdatedAt: Date | null;
}

export interface MutationOptions<T = any, P = any> extends UseAsyncStateOptions {
  onSuccess?: (data: T, variables: P) => void;
  onError?: (error: Error, variables: P) => void;
  onSettled?: (data: T | undefined, error: Error | null, variables: P) => void;
  retry?: boolean | number;
  retryDelay?: number;
}

export interface MutationResult<T = any, P = any> extends AsyncState<T> {
  mutate: (variables: P) => Promise<T>;
  mutateAsync: (variables: P) => Promise<T>;
  reset: () => void;
  isIdle: boolean;
  variables: P | undefined;
}

// Query cache to store results
const queryCache = new Map<string, {
  data: any;
  timestamp: number;
  staleTime: number;
  cacheTime: number;
}>();

// Cleanup stale cache entries
const cleanupCache = () => {
  const now = Date.now();
  for (const [key, entry] of queryCache.entries()) {
    if (now - entry.timestamp > entry.cacheTime) {
      queryCache.delete(key);
    }
  }
};

// Clean up cache every 5 minutes
setInterval(cleanupCache, 5 * 60 * 1000);

export const useQuery = <T = any>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options: QueryOptions<T> = {}
): QueryResult<T> => {
  const {
    enabled = true,
    refetchOnWindowFocus = true,
    refetchOnReconnect = true,
    staleTime = 5 * 60 * 1000, // 5 minutes
    cacheTime = 10 * 60 * 1000, // 10 minutes
    refetchInterval,
    retry = 3,
    retryDelay = 1000,
    onSuccess,
    onError,
    select,
    ...asyncOptions
  } = options;

  const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
  const [state, actions] = useAsyncState<T>(asyncOptions);
  
  const retryCountRef = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isFetchingRef = useRef(false);
  const lastFetchRef = useRef<Date | null>(null);
  const dataUpdatedAtRef = useRef<Date | null>(null);
  const errorUpdatedAtRef = useRef<Date | null>(null);

  // Check if data is stale
  const isStale = useCallback(() => {
    const cached = queryCache.get(key);
    if (!cached) return true;
    
    const now = Date.now();
    return now - cached.timestamp > cached.staleTime;
  }, [key, staleTime]);

  // Load data from cache if available
  const loadFromCache = useCallback(() => {
    const cached = queryCache.get(key);
    if (cached && !isStale()) {
      actions.setData(select ? select(cached.data) : cached.data);
      dataUpdatedAtRef.current = new Date(cached.timestamp);
      return true;
    }
    return false;
  }, [key, isStale, actions, select]);

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

    const executeWithRetry = async (attemptCount: number = 0): Promise<T> => {
      try {
        const result = await queryFn();
        
        // Save to cache
        saveToCache(result);
        
        // Transform data if selector is provided
        const transformedResult = select ? select(result) : result;
        
        // Update refs
        dataUpdatedAtRef.current = new Date();
        retryCountRef.current = 0;
        
        // Call success callback
        if (onSuccess) {
          onSuccess(transformedResult);
        }
        
        return transformedResult;
      } catch (error) {
        errorUpdatedAtRef.current = new Date();
        
        // Determine if we should retry
        const shouldRetry = retry === true || (typeof retry === 'number' && attemptCount < retry);
        
        if (shouldRetry && attemptCount < (typeof retry === 'number' ? retry : 3)) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attemptCount + 1)));
          return executeWithRetry(attemptCount + 1);
        }
        
        // Call error callback
        if (onError && error instanceof Error) {
          onError(error);
        }
        
        throw error;
      } finally {
        isFetchingRef.current = false;
      }
    };

    return executeWithRetry();
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

export const useMutation = <T = any, P = any>(
  mutationFn: (variables: P) => Promise<T>,
  options: MutationOptions<T, P> = {}
): MutationResult<T, P> => {
  const {
    onSuccess,
    onError,
    onSettled,
    retry = 0,
    retryDelay = 1000,
    ...asyncOptions
  } = options;

  const [state, actions] = useAsyncState<T>(asyncOptions);
  const variablesRef = useRef<P | undefined>(undefined);

  const executeMutation = useCallback(async (variables: P): Promise<T> => {
    variablesRef.current = variables;

    const executeWithRetry = async (attemptCount: number = 0): Promise<T> => {
      try {
        const result = await mutationFn(variables);
        
        if (onSuccess) {
          onSuccess(result, variables);
        }
        
        return result;
      } catch (error) {
        // Determine if we should retry
        const shouldRetry = retry === true || (typeof retry === 'number' && attemptCount < retry);
        
        if (shouldRetry && attemptCount < (typeof retry === 'number' ? retry : 3)) {
          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attemptCount + 1)));
          return executeWithRetry(attemptCount + 1);
        }
        
        if (onError && error instanceof Error) {
          onError(error, variables);
        }
        
        throw error;
      } finally {
        if (onSettled) {
          onSettled(state.data, state.error ? new Error(state.error) : null, variables);
        }
      }
    };

    return executeWithRetry();
  }, [mutationFn, retry, retryDelay, onSuccess, onError, onSettled, state.data, state.error]);

  const mutate = useCallback(async (variables: P): Promise<T> => {
    return actions.execute(() => executeMutation(variables));
  }, [actions, executeMutation]);

  const mutateAsync = mutate;

  const reset = useCallback(() => {
    variablesRef.current = undefined;
    actions.reset();
  }, [actions]);

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
    isIdle: !state.loading && !state.error && !state.success,
    variables: variablesRef.current,
  };
};

// Utility function to invalidate cache
export const invalidateQuery = (queryKey: string | string[]): void => {
  const key = Array.isArray(queryKey) ? queryKey.join(':') : queryKey;
  queryCache.delete(key);
};

// Utility function to clear all cache
export const clearQueryCache = (): void => {
  queryCache.clear();
};

// Utility function to prefetch data
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