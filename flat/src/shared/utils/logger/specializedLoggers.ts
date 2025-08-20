import type { LogContext } from './types';

export interface SpecializedLogger {
  info: (message: string, context?: LogContext) => void;
  error: (message: string, error?: Error, context?: LogContext) => void;
}

export const createApiLogger = (logger: SpecializedLogger) => ({
  logRequest: (
    method: string,
    url: string,
    status?: number,
    duration?: number,
    error?: Error
  ) => {
    const context: LogContext = {
      action: 'api_request',
      method,
      url,
      status,
      duration,
    };

    if (error) {
      logger.error(`API request failed: ${method} ${url}`, error, context);
    } else {
      logger.info(`API request: ${method} ${url}`, context);
    }
  }
});

export const createUserActionLogger = (logger: SpecializedLogger) => ({
  log: (action: string, component?: string, data?: any) => {
    const context: LogContext = {
      action: 'user_action',
      component,
      data,
    };

    logger.info(`User action: ${action}`, context);
  }
});

export const createPerformanceMetricLogger = (logger: SpecializedLogger) => ({
  log: (metric: string, value: number, unit: string = 'ms') => {
    const context: LogContext = {
      action: 'performance',
      metric,
      value,
      unit,
    };

    logger.info(`Performance: ${metric} = ${value}${unit}`, context);
  }
});

export const createNavigationLogger = (logger: SpecializedLogger) => ({
  log: (from: string, to: string) => {
    const context: LogContext = {
      action: 'navigation',
      from,
      to,
    };

    logger.info(`Navigation: ${from} -> ${to}`, context);
  }
});