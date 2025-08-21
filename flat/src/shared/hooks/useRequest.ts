/**
 * Custom hook for handling network requests with AbortController
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { logger } from '@/shared/utils/logger';

interface UseRequestOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  autoFetch?: boolean;
  dependencies?: any[];
}

interface UseRequestReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  fetch: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

export function useRequest<T>(
  requestFn: (signal: AbortSignal) => Promise<T>,
  options: UseRequestOptions<T> = {}
): UseRequestReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    cancel();
    setData(null);
    setError(null);
    setLoading(false);
  }, [cancel]);

  const fetch = useCallback(async () => {
    // Cancel any ongoing request
    cancel();

    // Create new AbortController
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await requestFn(controller.signal);
      
      // Check if component is still mounted
      if (isMountedRef.current && !controller.signal.aborted) {
        setData(result);
        if (options.onSuccess) {
          options.onSuccess(result);
        }
      }
    } catch (err) {
      // Ignore abort errors
      if (err instanceof Error && err.name === 'AbortError') {
        logger.debug('Request was cancelled');
        return;
      }

      // Handle other errors
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error('Unknown error occurred');
        setError(error);
        logger.error('Request failed', { error });
        
        if (options.onError) {
          options.onError(error);
        }
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
      
      // Clear the controller reference
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [requestFn, options, cancel]);

  // Auto fetch on mount or dependencies change
  useEffect(() => {
    if (options.autoFetch) {
      fetch();
    }

    return () => {
      cancel();
    };
  }, options.dependencies || []);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      cancel();
    };
  }, [cancel]);

  return {
    data,
    loading,
    error,
    fetch,
    cancel,
    reset,
  };
}

/**
 * Hook for handling multiple parallel requests
 */
export function useParallelRequests<T extends readonly unknown[]>(
  requests: { [K in keyof T]: (signal: AbortSignal) => Promise<T[K]> }
): {
  data: { [K in keyof T]?: T[K] };
  loading: boolean;
  errors: { [K in keyof T]?: Error };
  fetch: () => Promise<void>;
  cancel: () => void;
} {
  const [data, setData] = useState<{ [K in keyof T]?: T[K] }>({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [K in keyof T]?: Error }>({});
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  const fetch = useCallback(async () => {
    cancel();

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setErrors({});

    try {
      const results = await Promise.allSettled(
        requests.map(req => req(controller.signal))
      );

      if (!controller.signal.aborted) {
        const newData: { [K in keyof T]?: T[K] } = {};
        const newErrors: { [K in keyof T]?: Error } = {};

        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            (newData as any)[index] = result.value;
          } else {
            (newErrors as any)[index] = result.reason;
          }
        });

        setData(newData);
        setErrors(newErrors);
      }
    } catch (err) {
      logger.error('Parallel requests failed', { error: err });
    } finally {
      setLoading(false);
      
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  }, [requests, cancel]);

  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    data,
    loading,
    errors,
    fetch,
    cancel,
  };
}