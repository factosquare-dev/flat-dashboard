import { useCallback } from 'react';
import { logger } from '../../utils/logger';

/**
 * Hook for user interaction logging
 */
export function useUserActionLogging(componentName?: string) {
  const logClick = useCallback((element: string, data?: any) => {
    logger.logUserAction('click', componentName, { element, ...data });
  }, [componentName]);

  const logFormSubmit = useCallback((formName: string, data?: any) => {
    logger.logUserAction('form_submit', componentName, { formName, ...data });
  }, [componentName]);

  const logFormError = useCallback((formName: string, errors: any) => {
    logger.warn(`Form validation errors: ${formName}`, {
      component: componentName,
      action: 'form_error',
      formName,
      errors,
    });
  }, [componentName]);

  const logSearch = useCallback((query: string, filters?: any) => {
    logger.logUserAction('search', componentName, { query, filters });
  }, [componentName]);

  const logFilter = useCallback((filterType: string, value: any) => {
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