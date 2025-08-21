/**
 * Error handling utilities - Centralized exports
 * 
 * Organized by Single Responsibility Principle (SRP)
 */

// ============= BASE ERROR CLASSES & UTILITIES =============
export { AppError } from './base/AppError';
export type { ErrorDetails } from './base/AppError';
export { ERROR_CODES, ERROR_MESSAGES, httpStatusToErrorCode } from './base/constants';
export {
  isError,
  isAppError,
  hasErrorMessage,
  hasErrorCode,
  getErrorMessage,
  getErrorCode
} from './base/typeGuards';

// ============= DOMAIN-SPECIFIC ERRORS =============
// Factory domain
export { FactoryNotFoundError, InvalidFactoryDataError } from './domain/factory';

// Project domain
export { ProjectNotFoundError, InvalidProjectStatusError } from './domain/project';

// User domain
export { UserNotFoundError, UnauthorizedError } from './domain/user';

// Data integrity
export { DataIntegrityError, DuplicateError } from './domain/data';

// ============= VALIDATION ERRORS =============
export {
  ValidationError,
  RequiredFieldError,
  assertDefined,
  assertNotEmpty,
  assertInRange
} from './validation/ValidationError';

// ============= NETWORK & API ERRORS =============
export {
  NetworkError,
  TimeoutError,
  ApiError,
  isNetworkError,
  isTimeoutError
} from './network/NetworkError';
export type { ApiErrorResponse } from './network/NetworkError';

// ============= ERROR HANDLING & FORMATTING =============
// Error formatters for UI
export {
  formatErrorForDisplay,
  getErrorBoundaryMessage
} from './formatters';

// API error handling
export {
  handleApiError
} from './handlers';

// Centralized error handler
export {
  ErrorHandler,
  logError,
  handleError
} from './errorHandler';

// ============= ERROR CONTEXT =============
/**
 * Error context for enhanced error tracking
 */
export type ErrorContext = {
  operation?: string;
  component?: string;
  userId?: string;
  [key: string]: any;
};

// ============= UTILITY FUNCTIONS =============
/**
 * Create error with context
 */
export const createError = (
  message: string,
  code?: string,
  statusCode?: number,
  details?: unknown
): AppError => {
  return new AppError(message, code, statusCode, details);
};

/**
 * Wrap function with error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => any>(
  fn: T,
  errorHandler?: (error: Error) => void
): T => {
  return ((...args: Parameters<T>) => {
    try {
      const result = fn(...args);
      if (result instanceof Promise) {
        return result.catch((error) => {
          if (errorHandler) {
            errorHandler(error);
          }
          throw error;
        });
      }
      return result;
    } catch (error) {
      if (errorHandler) {
        errorHandler(error as Error);
      }
      throw error;
    }
  }) as T;
};