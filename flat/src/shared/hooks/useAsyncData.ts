import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  immediate?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface UseAsyncDataReturn<T, TArgs extends unknown[] = unknown[]> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  execute: (...args: TArgs) => Promise<void>;
  reset: () => void;
  retry: () => Promise<void>;
}

/**
 * Custom hook for handling async data fetching with loading and error states
 * @param asyncFunction - The async function to execute
 * @param options - Configuration options
 * @returns Data, loading state, error, and control functions
 */
export function useAsyncData<T, TArgs extends unknown[] = unknown[]>(
  asyncFunction: (...args: TArgs) => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T, TArgs> {
  const {
    immediate = false,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000,
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);
  const isMountedRef = useRef(true);
  const lastArgsRef = useRef<TArgs>({} as TArgs);
  const retriesRef = useRef(0);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(
    async (...args: TArgs) => {
      try {
        lastArgsRef.current = args;
        retriesRef.current = 0;
        setLoading(true);
        setError(null);

        const result = await asyncFunction(...args);

        if (isMountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }
      } catch (err) {
        if (isMountedRef.current) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          onError?.(error);

          // Retry logic
          if (retriesRef.current < retryCount) {
            retriesRef.current++;
            setTimeout(() => {
              if (isMountedRef.current) {
                execute(...args);
              }
            }, retryDelay);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [asyncFunction, onSuccess, onError, retryCount, retryDelay]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
    retriesRef.current = 0;
  }, []);

  const retry = useCallback(async () => {
    if (lastArgsRef.current) {
      await execute(...lastArgsRef.current);
    }
  }, [execute]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate]); // Only run on mount when immediate is true

  return {
    data,
    error,
    loading,
    execute,
    reset,
    retry,
  };
}