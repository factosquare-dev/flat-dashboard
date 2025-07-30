import { logger } from './loggerInstance';

export function useLogger() {
  const setUserId = (userId: string) => {
    logger.setContext({ userId });
  };

  const setSessionId = (sessionId: string) => {
    logger.setContext({ sessionId });
  };

  const logComponentMount = (componentName: string) => {
    logger.debug(`Component mounted: ${componentName}`, {
      component: componentName,
      action: 'mount',
    });
  };

  const logComponentUnmount = (componentName: string) => {
    logger.debug(`Component unmounted: ${componentName}`, {
      component: componentName,
      action: 'unmount',
    });
  };

  return {
    debug: logger.debug.bind(logger),
    info: logger.info.bind(logger),
    warn: logger.warn.bind(logger),
    error: logger.error.bind(logger),
    logApiRequest: logger.logApiRequest.bind(logger),
    logUserAction: logger.logUserAction.bind(logger),
    logPerformance: logger.logPerformance.bind(logger),
    logNavigation: logger.logNavigation.bind(logger),
    setUserId,
    setSessionId,
    logComponentMount,
    logComponentUnmount,
  };
}