import { QueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';

// Default options for all queries and mutations
const defaultOptions = {
  queries: {
    // Stale time: how long until a query is considered stale
    staleTime: 5 * 60 * 1000, // 5 minutes
    
    // Cache time: how long to keep data in cache after component unmounts
    cacheTime: 10 * 60 * 1000, // 10 minutes
    
    // Retry configuration
    retry: (failureCount: number, error: any) => {
      // Don't retry on 4xx errors
      if (error?.response?.status >= 400 && error?.response?.status < 500) {
        return false;
      }
      // Retry up to 3 times for other errors
      return failureCount < 3;
    },
    
    // Retry delay exponential backoff
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
    
    // Refetch on window focus
    refetchOnWindowFocus: false,
    
    // Refetch on reconnect
    refetchOnReconnect: 'always' as const,
  },
  mutations: {
    // Retry configuration for mutations
    retry: false, // Don't retry mutations by default
    
    // Global error handler
    onError: (error: any) => {
      const message = error?.response?.data?.message || error?.message || 'An error occurred';
      toast.error(message);
    },
  },
};

// Create the query client
export const queryClient = new QueryClient({
  defaultOptions,
});

// Query key factory for consistent key generation
export const queryKeys = {
  all: ['queries'] as const,
  
  // Projects
  projects: {
    all: ['projects'] as const,
    lists: () => [...queryKeys.projects.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.projects.lists(), filters] as const,
    details: () => [...queryKeys.projects.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.projects.details(), id] as const,
  },
  
  // Users
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.users.details(), id] as const,
    current: () => [...queryKeys.users.all, 'current'] as const,
  },
  
  // Tasks
  tasks: {
    all: ['tasks'] as const,
    lists: () => [...queryKeys.tasks.all, 'list'] as const,
    list: (projectId?: string) => [...queryKeys.tasks.lists(), { projectId }] as const,
    details: () => [...queryKeys.tasks.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.tasks.details(), id] as const,
  },
  
  // Schedule
  schedule: {
    all: ['schedule'] as const,
    lists: () => [...queryKeys.schedule.all, 'list'] as const,
    list: (dateRange?: { start: Date; end: Date }) => [...queryKeys.schedule.lists(), dateRange] as const,
  },
  
  // Customers
  customers: {
    all: ['customers'] as const,
    lists: () => [...queryKeys.customers.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.customers.lists(), filters] as const,
    details: () => [...queryKeys.customers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.customers.details(), id] as const,
  },
  
  // Factories
  factories: {
    all: ['factories'] as const,
    lists: () => [...queryKeys.factories.all, 'list'] as const,
    list: (filters?: any) => [...queryKeys.factories.lists(), filters] as const,
    details: () => [...queryKeys.factories.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.factories.details(), id] as const,
  },
};

// Helper function to invalidate queries
export const invalidateQueries = async (keys: readonly unknown[]) => {
  await queryClient.invalidateQueries({ queryKey: keys });
};

// Helper function to prefetch data
export const prefetchQuery = async (key: readonly unknown[], fetcher: () => Promise<any>) => {
  await queryClient.prefetchQuery({ queryKey: key, queryFn: fetcher });
};

// Helper function to get cached data
export const getCachedData = <T>(key: readonly unknown[]): T | undefined => {
  return queryClient.getQueryData(key);
};

// Helper function to set cached data
export const setCachedData = <T>(key: readonly unknown[], data: T) => {
  queryClient.setQueryData(key, data);
};