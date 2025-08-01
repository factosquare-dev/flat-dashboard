import { useCallback } from 'react';
import { logger } from '@/utils/logger';

/**
 * Hook for user interaction logging
 */
export function useUserActionLogging(componentName?: string) {
  const logClick = useCallback((element: string, data?: Record<string, unknown>) => {
    logger.logUserAction('click', componentName, { element, ...data });
  }, [componentName]);

  const logFormSubmit = useCallback((formName: string, data?: Record<string, unknown>) => {
    logger.logUserAction('form_submit', componentName, { formName, ...data });
  }, [componentName]);

  const logFormError = useCallback((formName: string, errors: Record<string, unknown>) => {
    logger.warn(`Form validation errors: ${formName}`, {
      component: componentName,
      action: 'form_error',
      formName,
      errors,
    });
  }, [componentName]);

  const logSearch = useCallback((query: string, filters?: Record<string, unknown>) => {
    logger.logUserAction('search', componentName, { query, filters });
  }, [componentName]);

  const logFilter = useCallback((filterType: string, value: unknown) => {
    logger.logUserAction('filter', componentName, { filterType, value });
  }, [componentName]);

  const logSort = useCallback((sortBy: string, direction: 'asc' | 'desc') => {
    logger.logUserAction('sort', componentName, { sortBy, direction });
  }, [componentName]);

  return {
    logClick,
    logFormSubmit,
    logFormError,
    logSearch,
    logFilter,
    logSort,
  };
}