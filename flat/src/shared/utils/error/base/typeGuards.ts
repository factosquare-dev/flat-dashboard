/**
 * Type guards for error handling
 */

import { AppError } from './AppError';

/**
 * Type Guards
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

export const isAppError = (error: unknown): error is AppError => {
  return error instanceof AppError;
};

export const hasErrorMessage = (error: unknown): error is { message: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

export const hasErrorCode = (error: unknown): error is { code: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof (error as Record<string, unknown>).code === 'string'
  );
};

/**
 * Error message extraction
 */
export const getErrorMessage = (error: unknown): string => {
  if (isError(error)) {
    return error.message;
  }
  
  if (hasErrorMessage(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unexpected error occurred';
};

/**
 * Get error code
 */
export const getErrorCode = (error: unknown): string => {
  if (isAppError(error)) {
    return error.code;
  }
  
  if (hasErrorCode(error)) {
    return error.code;
  }
  
  return 'UNKNOWN_ERROR';
};