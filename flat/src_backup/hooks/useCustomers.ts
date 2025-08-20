import { useMemo } from 'react';
import { mockDataService } from '@/services/mockDataService';
import type { Customer } from '@/types/customer';

/**
 * Hook for managing customer data
 */
export const useCustomers = () => {
  const customers = useMemo(() => {
    try {
      return mockDataService.getCustomers();
    } catch (error) {
      console.error('Failed to load customers from MockDB:', error);
      return [];
    }
  }, []);

  return {
    customers,
    isLoading: false,
    error: null
  };
};