import { useState, useCallback, useRef, useEffect } from 'react';

export interface AsyncState<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  lastFetch: Date | null;
}

export interface AsyncStateActions<T = any> {
  execute: (asyncFn: () => Promise<T>) => Promise<T>;
  reset: () => void;
  setData: (data: T | null) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

export interface UseAsyncStateOptions {
  initialData?: any;
  resetOnUnmount?: boolean;
  debounceMs?: number;
}

export const useAsyncState = <T = any>(
  options: UseAsyncStateOptions = {}
): [AsyncState<T>, AsyncStateActions<T>] => {
  const { initialData = null, resetOnUnmount = true, debounceMs = 0 } = options;
  
  const [state, setState] = useState<AsyncState<T>>({
    data: initialData,
    loading: false,
    error: null,
    success: false,
    lastFetch: null,
  });
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T> => {
    // Clear any existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    // If debouncing is enabled, delay the execution
    if (debounceMs > 0) {
      return new Promise((resolve, reject) => {
        debounceTimerRef.current = setTimeout(async () => {
          try {
            const result = await executeImmediate(asyncFn);
            resolve(result);
          } catch (error) {
            reject(error);
          }
        }, debounceMs);
      });
    }
    
    return executeImmediate(asyncFn);
  }, [debounceMs]);
  
  const executeImmediate = useCallback(async (asyncFn: () => Promise<T>): Promise<T> => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      success: false,
    }));
    
    try {
      const result = await asyncFn();
      
      // Check if the request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw new Error('Request was aborted');
      }
      
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        success: true,
        lastFetch: new Date(),
      }));
      
      return result;
    } catch (error) {
      // Don't update state if the request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        throw error;
      }
      
      const errorMessage = error instanceof Error ? error.message : 'An error occurred';
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false,
        lastFetch: new Date(),
      }));
      
      throw error;
    }
  }, []);
  
  const reset = useCallback(() => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Clear debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    setState({
      data: initialData,
      loading: false,
      error: null,
      success: false,
      lastFetch: null,
    });
  }, [initialData]);
  
  const setData = useCallback((data: T | null) => {
    setState(prev => ({
      ...prev,
      data,
      success: data !== null,
      error: null,
    }));
  }, []);
  
  const setError = useCallback((error: string | null) => {
    setState(prev => ({
      ...prev,
      error,
      success: false,
      loading: false,
    }));
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({
      ...prev,
      loading,
    }));
  }, []);
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      
      if (resetOnUnmount) {
        setState({
          data: initialData,
          loading: false,
          error: null,
          success: false,
          lastFetch: null,
        });
      }
    };
  }, [resetOnUnmount, initialData]);
  
  const actions: AsyncStateActions<T> = {
    execute,
    reset,
    setData,
    setError,
    setLoading,
  };
  
  return [state, actions];
};

// Utility hook for fetching data
export const useAsyncFetch = <T = any>(
  fetchFn: () => Promise<T>,
  deps: React.DependencyList = [],
  options: UseAsyncStateOptions = {}
) => {
  const [state, actions] = useAsyncState<T>(options);
  
  useEffect(() => {
    actions.execute(fetchFn).catch(() => {
      // Error is already handled in the state
    });
  }, deps);
  
  return [state, actions] as const;
};

// Utility hook for mutations
export const useAsyncMutation = <T = any, P = any>(
  mutationFn: (params: P) => Promise<T>,
  options: UseAsyncStateOptions = {}
) => {
  const [state, actions] = useAsyncState<T>(options);
  
  const mutate = useCallback(async (params: P): Promise<T> => {
    return actions.execute(() => mutationFn(params));
  }, [actions, mutationFn]);
  
  return [state, mutate, actions] as const;
};

// Type guards for async state
export const isLoading = (state: AsyncState): boolean => state.loading;
export const hasError = (state: AsyncState): state is AsyncState & { error: string } => 
  state.error !== null;
export const isSuccess = (state: AsyncState): boolean => state.success;
export const hasData = <T>(state: AsyncState<T>): state is AsyncState<T> & { data: T } => 
  state.data !== null;