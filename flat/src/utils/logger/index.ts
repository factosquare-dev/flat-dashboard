// Export the logger instance
export { logger } from './loggerInstance';

// Initialize PerformanceLogger with logger instance
import { PerformanceLogger } from './performanceLogger';
import { logger } from './loggerInstance';
PerformanceLogger.init(logger);

// Re-export everything from modules
export * from './types';
export { PerformanceLogger } from './performanceLogger';
export { useLogger } from './useLogger';
export { logUnhandledError, setupGlobalErrorHandling } from './errorHandlers';