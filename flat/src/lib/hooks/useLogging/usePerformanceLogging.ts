import { useEffect, useRef, useCallback } from 'react';
import { logger, PerformanceLogger } from '../../utils/logger';
import { PERFORMANCE_CONSTANTS } from './constants';

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
      
      if (renderTime > PERFORMANCE_CONSTANTS.FPS_60_THRESHOLD_MS) { // Log if render takes more than 16ms (60fps threshold)
        logger.logPerformance(`${componentName} render`, Math.round(renderTime));
      }

      // Log component re-render frequency
      if (renderCountRef.current > 1 && renderCountRef.current % PERFORMANCE_CONSTANTS.RENDER_COUNT_LOG_INTERVAL === 0) {
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