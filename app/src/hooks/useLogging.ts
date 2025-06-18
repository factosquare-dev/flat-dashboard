import { useEffect, useRef, useCallback } from 'react';
import { logger, PerformanceLogger } from '../utils/logger';

/**
 * Hook for component lifecycle logging
 */
export function useComponentLogging(componentName: string) {
  const mountTimeRef = useRef<number>();

  useEffect(() => {
    mountTimeRef.current = performance.now();
    
    logger.debug(`Component mounted: ${componentName}`, {
      component: componentName,
      action: 'mount',
    });

    return () => {
      const mountTime = mountTimeRef.current;
      if (mountTime) {
        const lifespan = performance.now() - mountTime;
        logger.debug(`Component unmounted: ${componentName}`, {
          component: componentName,
          action: 'unmount',
          lifespan: Math.round(lifespan),
        });
      }
    };
  }, [componentName]);
}

/**
 * Hook for navigation logging (basic version without React Router)
 */
export function useNavigationLogging() {
  const previousLocation = useRef<string>();

  useEffect(() => {
    const currentPath = window.location.pathname + window.location.search;
    
    if (previousLocation.current && previousLocation.current !== currentPath) {
      logger.logNavigation(previousLocation.current, currentPath);
      
      // Log navigation type
      logger.info(`Navigation: ${currentPath}`, {
        action: 'navigation',
        from: previousLocation.current,
        to: currentPath,
      });
    }
    
    previousLocation.current = currentPath;
    
    // Listen for popstate events (back/forward navigation)
    const handlePopState = () => {
      const newPath = window.location.pathname + window.location.search;
      if (previousLocation.current !== newPath) {
        logger.logNavigation(previousLocation.current || '', newPath);
        previousLocation.current = newPath;
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);
}

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

/**
 * Hook for performance monitoring
 */
export function usePerformanceLogging(componentName: string) {
  const renderTimeRef = useRef<number>();
  const renderCountRef = useRef<number>(0);

  useEffect(() => {
    renderCountRef.current += 1;
    renderTimeRef.current = performance.now();
  });

  useEffect(() => {
    if (renderTimeRef.current) {
      const renderTime = performance.now() - renderTimeRef.current;
      
      if (renderTime > 16) { // Log if render takes more than 16ms (60fps threshold)
        logger.logPerformance(`${componentName} render`, Math.round(renderTime));
      }

      // Log component re-render frequency
      if (renderCountRef.current > 1 && renderCountRef.current % 10 === 0) {
        logger.warn(`Component re-rendered frequently: ${componentName}`, {
          component: componentName,
          renderCount: renderCountRef.current,
        });
      }
    }
  });

  const measureOperation = useCallback(
    async <T>(operation: () => Promise<T>, operationName: string): Promise<T> => {
      return PerformanceLogger.measureAsync(
        `${componentName}-${operationName}`,
        operation,
        `${componentName}: ${operationName}`
      );
    },
    [componentName]
  );

  const measureSyncOperation = useCallback(
    <T>(operation: () => T, operationName: string): T => {
      return PerformanceLogger.measure(
        `${componentName}-${operationName}`,
        operation,
        `${componentName}: ${operationName}`
      );
    },
    [componentName]
  );

  return {
    measureOperation,
    measureSyncOperation,
  };
}

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

/**
 * Hook for session and user context logging
 */
export function useSessionLogging() {
  const setUserId = useCallback((userId: string) => {
    logger.setContext({ userId });
    logger.info('User context set', { userId });
  }, []);

  const setSessionId = useCallback((sessionId: string) => {
    logger.setContext({ sessionId });
    logger.info('Session context set', { sessionId });
  }, []);

  const clearUserContext = useCallback(() => {
    logger.clearContext();
    logger.info('User context cleared');
  }, []);

  const logLogin = useCallback((userId: string, method: string) => {
    logger.info('User logged in', {
      action: 'login',
      userId,
      method,
    });
  }, []);

  const logLogout = useCallback((userId?: string) => {
    logger.info('User logged out', {
      action: 'logout',
      userId,
    });
  }, []);

  const logSessionExpired = useCallback(() => {
    logger.warn('Session expired', {
      action: 'session_expired',
    });
  }, []);

  return {
    setUserId,
    setSessionId,
    clearUserContext,
    logLogin,
    logLogout,
    logSessionExpired,
  };
}