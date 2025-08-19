/**
 * Error handling utilities
 * 
 * Centralized exports for all error handling functionality
 */

// Core error types and utilities
export {
  AppError,
  // ErrorContext,  // Temporarily commented out
  ERROR_CODES,
  ERROR_MESSAGES,
  httpStatusToErrorCode,
  isError,
  isAppError,
  hasErrorMessage,
  hasErrorCode,
  getErrorMessage,
  getErrorCode,
  createError,
  withErrorHandling
} from './core';

// Export ErrorContext separately as a type
export type { ErrorContext } from './core';

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
  logError
} from './errorHandler';

// Re-export API error utilities from apiClient
export {
  isApiError,
  isNetworkError,
  isTimeoutError
} from '@/utils/apiClient';

// Export ApiError as a type
export type { ApiError } from '@/utils/apiClient';