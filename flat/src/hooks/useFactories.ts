import { useMemo } from 'react';
import { mockDataService } from '@/services/mockDataService';
import type { Factory } from '@/types/factory';

/**
 * Hook for managing factory data
 */
export const useFactories = () => {
  const factories = useMemo(() => {
    try {
      return mockDataService.getFactories();
    } catch (error) {
      console.error('Failed to load factories from MockDB:', error);
      return [];
    }
  }, []);

  return {
    factories,
    isLoading: false,
    error: null
  };
};

/**
 * Hook for getting available factories for tasks
 */
export const useAvailableFactories = () => {
  const { factories } = useFactories();
  
  const availableFactories = useMemo(() => {
    return factories.map(factory => factory.id);
  }, [factories]);

  return {
    availableFactories,
    factories,
    isLoading: false,
    error: null
  };
};