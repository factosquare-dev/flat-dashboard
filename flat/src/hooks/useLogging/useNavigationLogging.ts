import { useEffect, useRef } from 'react';
import { logger } from '@/utils/logger';

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