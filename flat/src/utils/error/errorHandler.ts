/**
 * Centralized error handler class
 */

import { logger } from '@/utils/logger';
import { 
  ErrorContext, 
  getErrorMessage, 
  getErrorCode, 
  isAppError, 
  AppError 
} from './core';
import { handleApiError } from './handlers';

/**
 * Centralized error handler
 */
export class ErrorHandler {
  /**
   * Handle and log errors with context
   */
  static handle(error: unknown, context?: ErrorContext): void {
    const errorMessage = getErrorMessage(error);
    const errorCode = getErrorCode(error);
    
    logger.error(errorMessage, error as Error, {
      code: errorCode,
      ...context
    });

    // In development, also log to console
    if (import.meta.env.DEV) {
      console.error('Error handled:', {
        message: errorMessage,
        code: errorCode,
        error,
        context
      });
    }
  }

  /**
   * Handle API errors
   */
  static handleApiError = handleApiError;

  /**
   * Create user-friendly error messages
   */
  static getUserMessage(error: unknown): string {
    if (isAppError(error)) {
      // Custom error messages for known error codes
      switch (error.code) {
        case 'VALIDATION_ERROR':
          return 'Please check your input and try again.';
        case 'NETWORK_ERROR':
          return 'Network connection error. Please check your connection.';
        case 'TIMEOUT_ERROR':
          return 'Request timed out. Please try again.';
        case 'PERMISSION_DENIED':
          return 'You don\'t have permission to perform this action.';
        case 'NOT_FOUND':
          return 'The requested resource was not found.';
        case 'CONFLICT':
          return 'This action conflicts with existing data.';
        default:
          return error.message || 'An error occurred.';
      }
    }

    return getErrorMessage(error);
  }

  /**
   * Report error to external service (e.g., Sentry)
   */
  static report(error: unknown, context?: ErrorContext): void {
    // TODO: Send to Sentry or other error tracking service
    logger.error('Error reported', error as Error, {
      severity: 'error',
      ...context
    });
  }
}

/**
 * Log error helper - for backward compatibility
 */
export const logError = (
  source: string,
  error: unknown,
  additionalInfo?: Record<string, any>
): void => {
  ErrorHandler.handle(error, {
    component: source,
    ...additionalInfo
  });
};