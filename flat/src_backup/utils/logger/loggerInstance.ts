import type { LogContext, LogEntry } from './types';
import { LogLevel } from './types';
import { ConsoleFormatter } from './consoleFormatter';
import { RemoteLogger } from './remoteLogger';
import {
  createApiLogger,
  createUserActionLogger,
  createPerformanceMetricLogger,
  createNavigationLogger
} from './specializedLoggers';

class Logger {
  private currentLevel: LogLevel;
  private environment: string;
  private context: LogContext = {};
  private consoleFormatter: ConsoleFormatter;
  private remoteLogger: RemoteLogger;

  constructor() {
    this.environment = import.meta.env.VITE_ENV || 'development';
    this.currentLevel = this.getLogLevel();
    this.consoleFormatter = new ConsoleFormatter(this.environment);
    this.remoteLogger = new RemoteLogger(
      this.environment,
      import.meta.env.VITE_LOGGING_ENDPOINT
    );
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
    this.consoleFormatter.format(entry);
    this.remoteLogger.send(entry);
  }

  /**
   * Log info message
   */
  info(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.INFO)) return;

    const entry = this.createLogEntry(LogLevel.INFO, message, context);
    this.consoleFormatter.format(entry);
    this.remoteLogger.send(entry);
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.WARN)) return;

    const entry = this.createLogEntry(LogLevel.WARN, message, context);
    this.consoleFormatter.format(entry);
    this.remoteLogger.send(entry);
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (!this.shouldLog(LogLevel.ERROR)) return;

    const entry = this.createLogEntry(LogLevel.ERROR, message, context, error);
    this.consoleFormatter.format(entry);
    this.remoteLogger.send(entry);
  }

  // Specialized logging methods
  logApiRequest = createApiLogger(this).logRequest;
  logUserAction = createUserActionLogger(this).log;
  logPerformance = createPerformanceMetricLogger(this).log;
  logNavigation = createNavigationLogger(this).log;
}

// Create singleton instance
export const logger = new Logger();