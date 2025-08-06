import { useMemo } from 'react';
import { mockDataService } from '@/services/mockDataService';
import type { Product } from '@/types/product';
import type { ProductCategory } from '@/types/productCategory';

/**
 * Hook for managing product data
 */
export const useProducts = () => {
  const products = useMemo(() => {
    try {
      return mockDataService.getProductsWithCategory();
    } catch (error) {
      console.error('Failed to load products from MockDB:', error);
      return [];
    }
  }, []);

  return {
    products,
    isLoading: false,
    error: null
  };
};

/**
 * Hook for managing product categories
 */
export const useProductCategories = () => {
  const categories = useMemo(() => {
    try {
      return mockDataService.getProductCategories();
    } catch (error) {
      console.error('Failed to load product categories from MockDB:', error);
      return [];
    }
  }, []);

  return {
    categories,
    isLoading: false,
    error: null
  };
};