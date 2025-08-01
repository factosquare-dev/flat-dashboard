// Main hooks
export { useQuery } from './useQuery';
export { useMutation } from './useMutation';

// Cache utilities
export {
  invalidateQuery,
  clearQueryCache,
  prefetchQuery
} from './cacheUtils';

// Types
export type {
  QueryOptions,
  QueryResult,
  MutationOptions,
  MutationResult,
  CacheEntry
} from './types';