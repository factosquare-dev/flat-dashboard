import { useCallback } from 'react';
import { logger } from '@/utils/logger';

/**
 * Hook for error logging and handling
 */
export function useErrorLogging(componentName?: string) {
  const logError = useCallback((error: Error, context?: any) => {
    logger.error(`Error in ${componentName || 'unknown component'}`, error, {
      component: componentName,
      context,
    });
  }, [componentName]);

  const logWarning = useCallback((message: string, context?: any) => {
    logger.warn(message, {
      component: componentName,
      context,
    });
  }, [componentName]);

  const handleAsyncError = useCallback(
    async <T>(
      operation: () => Promise<T>,
      fallback?: T,
      errorMessage?: string
    ): Promise<T | undefined> => {
      try {
        return await operation();
      } catch (error) {
        logError(
          error as Error,
          { operation: operation.name, errorMessage }
        );
        return fallback;
      }
    },
    [logError]
  );

  return {
    logError,
    logWarning,
    handleAsyncError,
  };
}