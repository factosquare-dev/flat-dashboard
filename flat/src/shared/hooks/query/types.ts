import type { AsyncState, UseAsyncStateOptions } from '@/useAsyncState';

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

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  staleTime: number;
  cacheTime: number;
}