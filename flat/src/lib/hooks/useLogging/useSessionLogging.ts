import { useCallback } from 'react';
import { logger } from '../../utils/logger';

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