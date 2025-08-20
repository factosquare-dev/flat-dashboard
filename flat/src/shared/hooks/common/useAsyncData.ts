import { useState, useEffect, useCallback, useRef } from 'react';

interface UseAsyncDataOptions<T> {
  initialData?: T;
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  retryCount?: number;
  retryDelay?: number;
}

interface UseAsyncDataReturn<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
  retry: () => void;
}

/**
 * Custom hook for async data fetching with loading, error, and retry handling
 */
export function useAsyncData<T>(
  asyncFunction: (...args: any[]) => Promise<T>,
  options: UseAsyncDataOptions<T> = {}
): UseAsyncDataReturn<T> {
  const {
    initialData,
    onSuccess,
    onError,
    retryCount = 0,
    retryDelay = 1000
  } = options;

  const [data, setData] = useState<T | undefined>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const retriesRef = useRef(0);
  const lastArgsRef = useRef<any[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async (...args: any[]) => {
    lastArgsRef.current = args;
    retriesRef.current = 0;

    const executeWithRetry = async (attemptNumber: number): Promise<void> => {
      try {
        setLoading(true);
        setError(null);

        const result = await asyncFunction(...args);

        if (isMountedRef.current) {
          setData(result);
          onSuccess?.(result);
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An error occurred');
        
        if (isMountedRef.current) {
          if (attemptNumber < retryCount) {
            retriesRef.current = attemptNumber + 1;
            setTimeout(() => {
              if (isMountedRef.current) {
                executeWithRetry(attemptNumber + 1);
              }
            }, retryDelay * Math.pow(2, attemptNumber)); // Exponential backoff
          } else {
            setError(error);
            onError?.(error);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    await executeWithRetry(0);
  }, [asyncFunction, onSuccess, onError, retryCount, retryDelay]);

  const reset = useCallback(() => {
    setData(initialData);
    setLoading(false);
    setError(null);
    retriesRef.current = 0;
  }, [initialData]);

  const retry = useCallback(() => {
    execute(...lastArgsRef.current);
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    reset,
    retry
  };
}

/**
 * Simplified version for immediate execution
 */
export function useAsyncEffect<T>(
  asyncFunction: () => Promise<T>,
  deps: React.DependencyList,
  options?: UseAsyncDataOptions<T>
): Omit<UseAsyncDataReturn<T>, 'execute'> {
  const { execute, ...rest } = useAsyncData(asyncFunction, options);

  useEffect(() => {
    execute();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return rest;
}