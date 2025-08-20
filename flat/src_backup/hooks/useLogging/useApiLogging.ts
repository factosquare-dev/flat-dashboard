import { useCallback } from 'react';
import { logger, PerformanceLogger } from '@/utils/logger';

/**
 * Hook for API request logging with automatic retry logic
 */
export function useApiLogging() {
  const logApiCall = useCallback(
    async <T>(
      apiCall: () => Promise<T>,
      operation: string,
      retries: number = 0
    ): Promise<T> => {
      const timerId = `api-${operation}-${Date.now()}`;
      PerformanceLogger.startTimer(timerId);

      try {
        const result = await apiCall();
        PerformanceLogger.endTimer(timerId, `API: ${operation}`);
        
        logger.info(`API operation successful: ${operation}`, {
          action: 'api_success',
          operation,
          retries,
        });
        
        return result;
      } catch (error) {
        PerformanceLogger.endTimer(timerId, `API: ${operation} (failed)`);
        
        logger.error(`API operation failed: ${operation}`, error as Error, {
          action: 'api_error',
          operation,
          retries,
        });
        
        throw error;
      }
    },
    []
  );

  return { logApiCall };
}