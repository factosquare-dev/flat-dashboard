/**
 * Structured logging utility for the dashboard application
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  component?: string;
  action?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
  environment: string;
  service: string;
  url?: string;
  userAgent?: string;
}

class Logger {
  private currentLevel: LogLevel;
  private environment: string;
  private context: LogContext = {};

  constructor() {
    this.environment = import.meta.env.VITE_ENV || 'development';
    this.currentLevel = this.getLogLevel();
  }

  private getLogLevel(): LogLevel {
    const level = import.meta.env.VITE_LOG_LEVEL || 'INFO';
    switch (level.toUpperCase()) {
      case 'DEBUG':
        return LogLevel.DEBUG;
      case 'INFO':
        return LogLevel.INFO;
      case 'WARN':
        return LogLevel.WARN;
      case 'ERROR':
        return LogLevel.ERROR;
      default:
        return LogLevel.INFO;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.currentLevel;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: LogContext,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel[level],
      message,
      context: { ...this.context, ...context },
      environment: this.environment,
      service: 'flat-dashboard',
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    return entry;
  }

  private formatForConsole(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] ${entry.level}`;
    const contextStr = entry.context ? JSON.stringify(entry.context) : '';
    
    if (this.environment === 'development') {
      // Development: Human-readable format
      const style = this.getConsoleStyle(entry.level);
      console.log(
        `%c${prefix}%c ${entry.message}`,
        style,
        'color: inherit',
        contextStr ? `\nContext: ${contextStr}` : '',
        entry.error ? `\nError: ${entry.error.message}` : ''
      );
      
      if (entry.error?.stack) {
        console.log(`Stack: ${entry.error.stack}`);
      }
    } else {
      // Production: JSON format
      console.log(JSON.stringify(entry));
    }
  }

  private getConsoleStyle(level: string): string {
    switch (level) {
      case 'DEBUG':
        return 'color: #888; font-weight: normal;';
      case 'INFO':
        return 'color: #0066cc; font-weight: bold;';
      case 'WARN':
        return 'color: #ff9900; font-weight: bold;';
      case 'ERROR':
        return 'color: #cc0000; font-weight: bold;';
      default:
        return 'color: inherit;';
    }
  }

  private sendToRemote(entry: LogEntry): void {
    // Send logs to remote logging service in production
    if (this.environment === 'production' && entry.level !== 'DEBUG') {
      // This could be integrated with services like:
      // - Sentry
      // - LogRocket
      // - DataDog
      // - Custom logging endpoint
      
      const loggingEndpoint = import.meta.env.VITE_LOGGING_ENDPOINT;
      if (loggingEndpoint) {
        fetch(loggingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(entry),
        }).catch(() => {
          // Silently fail - don't want logging to break the app
        });
      }
    }
  }

  /**
   * Set global context that will be included in all log entries
   */
  setContext(context: LogContext): void {
    this.context = { ...this.context, ...context };
  }

  /**
   * Clear global context
   */
  clearContext(): void {
    this.context = {};
  }

  /**
   * Log debug message
   */
  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.DEBUG)) return;

    const entry = this.createLogEntry(LogLevel.DEBUG, message, context);
    this.formatForConsole(entry);
    this.sendToRemote(entry);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.formatForConsole(entry);
    this.sendToRemote(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.formatForConsole(entry);
    this.sendToRemote(entry);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.formatForConsole(entry);
    this.sendToRemote(entry);
  }

  /**
   * Log API request
   */
  logApiRequest(
    method: string,
    url: string,
    status?: number,
    duration?: number,
    error?: Error
  ): void {
    const context: LogContext = {
      action: 'api_request',
      method,
      url,
      status,
      duration,
    };

    if (error) {
      this.error(`API request failed: ${method} ${url}`, error, context);
    } else {
      this.info(`API request: ${method} ${url}`, context);
    }
  }

  /**
   * Log user action
   */
  logUserAction(action: string, component?: string, data?: any): void {
    const context: LogContext = {
      action: 'user_action',
      component,
      data,
    };

    this.info(`User action: ${action}`, context);
  }

  /**
   * Log performance metric
   */
  logPerformance(metric: string, value: number, unit: string = 'ms'): void {
    const context: LogContext = {
      action: 'performance',
      metric,
      value,
      unit,
    };

    this.info(`Performance: ${metric} = ${value}${unit}`, context);
  }

  /**
   * Log navigation event
   */
  logNavigation(from: string, to: string): void {
    const context: LogContext = {
      action: 'navigation',
      from,
      to,
    };

    this.info(`Navigation: ${from} -> ${to}`, context);
  }
}

// Create singleton instance
export const logger = new Logger();

// Performance monitoring utilities
export class PerformanceLogger {
  private static timers = new Map<string, number>();

  /**
   * Start timing an operation
   */
  static startTimer(id: string): void {
    this.timers.set(id, performance.now());
  }

  /**
   * End timing and log the result
   */
  static endTimer(id: string, description?: string): number | null {
    const startTime = this.timers.get(id);
    if (!startTime) {
      logger.warn(`Timer ${id} not found`);
      return null;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(id);

    logger.logPerformance(description || id, Math.round(duration));
    return duration;
  }

  /**
   * Measure and log a function execution time
   */
  static async measureAsync<T>(
    id: string,
    fn: () => Promise<T>,
    description?: string
  ): Promise<T> {
    this.startTimer(id);
    try {
      const result = await fn();
      this.endTimer(id, description);
      return result;
    } catch (error) {
      this.endTimer(id, description);
      throw error;
    }
  }

  /**
   * Measure and log a synchronous function execution time
   */
  static measure<T>(
    id: string,
    fn: () => T,
    description?: string
  ): T {
    this.startTimer(id);
    try {
      const result = fn();
      this.endTimer(id, description);
      return result;
    } catch (error) {
      this.endTimer(id, description);
      throw error;
    }
  }
}

// React Hook for logging
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

// Error boundary logging
export function logUnhandledError(error: Error, errorInfo?: any): void {
  logger.error('Unhandled error caught by error boundary', error, {
    component: 'ErrorBoundary',
    errorInfo,
  });
}

// Promise rejection logging
export function setupGlobalErrorHandling(): void {
  // Log unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Unhandled promise rejection', event.reason, {
      action: 'unhandled_rejection',
    });
  });

  // Log global errors
  window.addEventListener('error', (event) => {
    logger.error('Global error', event.error, {
      action: 'global_error',
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });
}

export default logger;