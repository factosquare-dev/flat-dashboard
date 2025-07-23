import { useEffect, useRef } from 'react';
import { logger } from '../../utils/logger';

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