/**
 * Core error handling utilities
 */

import { logger } from '@/utils/logger';
import { getCurrentTimestamp } from '@/utils/unifiedDateUtils';

/**
 * Standard error codes
 */
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // HTTP errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Application errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '네트워크 연결에 실패했습니다.',
  [ERROR_CODES.TIMEOUT_ERROR]: '요청 시간이 초과되었습니다.',
  [ERROR_CODES.SERVER_ERROR]: '서버 오류가 발생했습니다.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '서비스를 일시적으로 사용할 수 없습니다.',
  [ERROR_CODES.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
} as const;

/**
 * Map HTTP status codes to error codes
 */
export function httpStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return ERROR_CODES.BAD_REQUEST;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 429:
      return ERROR_CODES.RATE_LIMIT;
    case 500:
    case 502:
    case 504:
      return ERROR_CODES.SERVER_ERROR;
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    default:
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}

/**
 * Custom application error class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: unknown;
  public readonly timestamp: string;

  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode?: number,
    details?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.timestamp = getCurrentTimestamp();
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

/**
 * Error context for enhanced error tracking
 */
export type ErrorContext = {
  operation?: string;
  component?: string;
  userId?: string;
  [key: string]: any;
};

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

/**
 * Create error helper
 */
export const createError = (
  message: string,
  code: string = 'UNKNOWN_ERROR',
  statusCode?: number,
  details?: unknown
): AppError => {
  return new AppError(message, code, statusCode, details);
};

/**
 * Wrap async functions with error handling
 */
export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      logger.error(getErrorMessage(error), error as Error, context);
      throw error;
    }
  }) as T;
};
