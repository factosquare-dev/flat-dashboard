/**
 * Error handling functions
 */

import { logger } from '@/shared/utils/logger';
import { getCurrentTimestamp } from '@/shared/utils/unifiedDateUtils';
import { isApiError, isNetworkError, isTimeoutError, ApiError } from '@/shared/utils/apiClient';
import { ErrorContext, getErrorMessage } from './core';

/**
 * Handle API errors with consistent logging and user-friendly messages
 */
export const handleApiError = (error: unknown, operation: string, context?: ErrorContext): string => {
  const errorContext = {
    operation,
    timestamp: getCurrentTimestamp(),
    ...context
  };

  // Log the error
  logger.error(`API Error during ${operation}`, error as Error, errorContext);

  // Return user-friendly message
  if (isNetworkError(error)) {
    return 'Network connection error. Please check your internet connection.';
  }

  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }

  if (isApiError(error)) {
    const apiError = error as ApiError;
    switch (apiError.status) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication required. Please log in.';
      case 403:
        return 'You don\'t have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return 'This action conflicts with existing data.';
      case 429:
        return 'Too many requests. Please slow down.';
      case 500:
      case 502:
      case 503:
        return 'Server error. Please try again later.';
      default:
        return apiError.message || 'An error occurred while processing your request.';
    }
  }

  return 'An unexpected error occurred. Please try again.';
};