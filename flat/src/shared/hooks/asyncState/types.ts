/**
 * Async State 관련 타입 정의
 */

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

export interface AsyncStateUpdateResult {
  data: any;
  error: string | null;
  success: boolean;
  lastFetch: Date;
}