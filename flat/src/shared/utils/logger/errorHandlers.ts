import { logger } from './loggerInstance';

/**
 * Log unhandled errors caught by error boundary
 */
export function logUnhandledError(error: Error, errorInfo?: any): void {
  logger.error('Unhandled error caught by error boundary', error, {
    component: 'ErrorBoundary',
    errorInfo,
  });
}

/**
 * Setup global error handling
 */
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