/**
 * Centralized Error Handler
 * Provides consistent error handling across the application
 */

import { logger } from '../logger';
import type { ApiError } from '../../types/api';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly details?: unknown;
  public readonly timestamp: Date;

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
    this.timestamp = new Date();
    
    // Maintain proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}

// Common error codes
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  
  // Business logic errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  DUPLICATE_RESOURCE: 'DUPLICATE_RESOURCE',
  OPERATION_FAILED: 'OPERATION_FAILED',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Client errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES];

// Error messages (Korean)
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  [ERROR_CODES.NETWORK_ERROR]: '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.',
  [ERROR_CODES.TIMEOUT_ERROR]: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
  
  [ERROR_CODES.UNAUTHORIZED]: '인증이 필요합니다. 다시 로그인해주세요.',
  [ERROR_CODES.FORBIDDEN]: '접근 권한이 없습니다.',
  [ERROR_CODES.SESSION_EXPIRED]: '세션이 만료되었습니다. 다시 로그인해주세요.',
  
  [ERROR_CODES.VALIDATION_ERROR]: '입력값이 올바르지 않습니다.',
  [ERROR_CODES.INVALID_INPUT]: '유효하지 않은 입력입니다.',
  [ERROR_CODES.MISSING_REQUIRED_FIELD]: '필수 항목을 입력해주세요.',
  
  [ERROR_CODES.RESOURCE_NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ERROR_CODES.DUPLICATE_RESOURCE]: '이미 존재하는 리소스입니다.',
  [ERROR_CODES.OPERATION_FAILED]: '작업을 수행할 수 없습니다.',
  
  [ERROR_CODES.SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '서비스를 일시적으로 사용할 수 없습니다.',
  
  [ERROR_CODES.BAD_REQUEST]: '잘못된 요청입니다.',
  [ERROR_CODES.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
};

// Convert HTTP status to error code
export function httpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return ERROR_CODES.BAD_REQUEST;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.RESOURCE_NOT_FOUND;
    case 408:
      return ERROR_CODES.TIMEOUT_ERROR;
    case 422:
      return ERROR_CODES.VALIDATION_ERROR;
    case 409:
      return ERROR_CODES.DUPLICATE_RESOURCE;
    case 500:
    case 502:
    case 503:
      return ERROR_CODES.SERVER_ERROR;
    case 504:
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    default:
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}

// Convert API error to AppError
export function apiErrorToAppError(error: ApiError, statusCode?: number): AppError {
  const code = error.code || httpStatusToErrorCode(statusCode || 500);
  const message = error.message || ERROR_MESSAGES[code] || ERROR_MESSAGES.UNKNOWN_ERROR;
  
  return new AppError(message, code, statusCode, error.details);
}

// Error handler function
export function handleError(error: unknown): AppError {
  // Already an AppError
  if (error instanceof AppError) {
    logger.error('AppError occurred', {
      code: error.code,
      message: error.message,
      statusCode: error.statusCode,
      details: error.details,
    });
    return error;
  }
  
  // API Error
  if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
    const apiError = error as ApiError;
    const appError = apiErrorToAppError(apiError, apiError.statusCode);
    logger.error('API error occurred', {
      code: appError.code,
      message: appError.message,
      statusCode: appError.statusCode,
      details: appError.details,
    });
    return appError;
  }
  
  // Network error
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    const appError = new AppError(
      ERROR_MESSAGES.NETWORK_ERROR,
      ERROR_CODES.NETWORK_ERROR
    );
    logger.error('Network error occurred', { message: error.message });
    return appError;
  }
  
  // Regular Error
  if (error instanceof Error) {
    const appError = new AppError(
      error.message,
      ERROR_CODES.UNKNOWN_ERROR
    );
    logger.error('Unknown error occurred', { 
      message: error.message,
      stack: error.stack,
    });
    return appError;
  }
  
  // Unknown error
  const appError = new AppError(
    ERROR_MESSAGES.UNKNOWN_ERROR,
    ERROR_CODES.UNKNOWN_ERROR
  );
  logger.error('Unknown error type', { error });
  return appError;
}

// Get user-friendly error message
export function getUserFriendlyMessage(error: AppError | Error): string {
  if (error instanceof AppError) {
    return ERROR_MESSAGES[error.code as ErrorCode] || error.message;
  }
  
  // Don't expose technical details to users
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}

// Check if error is retryable
export function isRetryableError(error: AppError): boolean {
  const retryableCodes = [
    ERROR_CODES.NETWORK_ERROR,
    ERROR_CODES.TIMEOUT_ERROR,
    ERROR_CODES.SERVICE_UNAVAILABLE,
    ERROR_CODES.SERVER_ERROR,
  ];
  
  return retryableCodes.includes(error.code as ErrorCode);
}

// Format error for display
export interface FormattedError {
  title: string;
  message: string;
  code?: string;
  retryable: boolean;
}

export function formatErrorForDisplay(error: unknown): FormattedError {
  const appError = handleError(error);
  
  return {
    title: '오류 발생',
    message: getUserFriendlyMessage(appError),
    code: appError.code,
    retryable: isRetryableError(appError),
  };
}