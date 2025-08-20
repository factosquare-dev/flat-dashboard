/**
 * Miscellaneous utilities
 * 
 * Note: Error classes have been moved to @/shared/utils/error
 * for better organization following SRP principles.
 */

// Re-export error classes from their new location
export {
  AppError,
  FactoryNotFoundError,
  InvalidFactoryDataError,
  ProjectNotFoundError,
  InvalidProjectStatusError,
  UserNotFoundError,
  UnauthorizedError,
  ValidationError,
  RequiredFieldError,
  DataIntegrityError,
  DuplicateError,
  NetworkError,
  ApiError,
  isError,
  isAppError,
  getErrorMessage,
  getErrorCode
} from '@/shared/utils/error';

export type { 
  ErrorDetails, 
  ApiErrorResponse, 
  ErrorContext 
} from '@/shared/utils/error';

// Legacy compatibility functions
export const isNotFoundError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('not found');
};

export const isValidationError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('Validation error');
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && error.message.includes('network');
};

// Error handler for consistent error logging
export const handleError = (error: unknown, context?: string): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  console.error(`[${context || 'Error'}]:`, errorMessage);
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Send to Sentry/LogRocket/etc
  }
};

// Assert functions for fail-fast validation
export const assertDefined = <T>(
  value: T | undefined | null,
  message: string
): asserts value is T => {
  if (value === undefined || value === null) {
    throw new Error(message);
  }
};

export const assertArray = <T>(
  value: unknown,
  message: string = 'Expected an array'
): asserts value is T[] => {
  if (!Array.isArray(value)) {
    throw new Error(message);
  }
};

export const assertString = (
  value: unknown,
  message: string = 'Expected a string'
): asserts value is string => {
  if (typeof value !== 'string') {
    throw new Error(message);
  }
};

export const assertNumber = (
  value: unknown,
  message: string = 'Expected a number'
): asserts value is number => {
  if (typeof value !== 'number') {
    throw new Error(message);
  }
};