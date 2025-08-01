/**
 * Centralized error handling utilities for consistent error management
 * This file consolidates all error handling logic from various error handlers
 */

import { logger } from './logger';
import type { ApiError } from '../types/api';

/**
 * Type guard to check if error is an Error instance
 */
export const isError = (error: unknown): error is Error => {
  return error instanceof Error;
};

/**
 * Type guard to check if error has a message property
 */
export const hasErrorMessage = (error: unknown): error is { message: string } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

/**
 * Type guard to check if error has a code property
 */
export const hasErrorCode = (error: unknown): error is { code: string | number } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error
  );
};

/**
 * Get error message from unknown error type
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
  
  return 'An unknown error occurred';
};

/**
 * Get error code from unknown error type
 */
export const getErrorCode = (error: unknown): string | number | undefined => {
  if (hasErrorCode(error)) {
    return error.code;
  }
  
  return undefined;
};

/**
 * Log error with context
 */
export const logError = (context: string, error: unknown, additionalContext?: Record<string, any>): void => {
  const message = getErrorMessage(error);
  const code = getErrorCode(error);
  
  const errorContext = {
    context,
    message,
    code,
    timestamp: new Date().toISOString(),
    ...additionalContext
  };
  
  // Use centralized logger if available
  if (logger && logger.error) {
    logger.error(`[${context}] ${message}`, isError(error) ? error : new Error(message), errorContext);
  } else {
    console.error(`[${context}] Error:`, {
      ...errorContext,
      error: isError(error) ? error.stack : error
    });
  }
};

/**
 * Create a standardized error object
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly context?: string;
  public readonly details?: unknown;
  public readonly timestamp: Date;
  public readonly originalError?: unknown;
  
  constructor(
    message: string,
    code: string = 'UNKNOWN_ERROR',
    statusCode?: number,
    context?: string,
    details?: unknown,
    originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.context = context;
    this.details = details;
    this.timestamp = new Date();
    this.originalError = originalError;
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
  
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      context: this.context,
      details: this.details,
      timestamp: this.timestamp,
      stack: this.stack
    };
  }
}

/**
 * Type guard to check if error has a statusCode property
 */
export const hasStatusCode = (error: unknown): error is { statusCode: number } => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    typeof (error as Record<string, unknown>).statusCode === 'number'
  );
};

/**
 * Wrap async function with error handling
 */
export const withErrorHandling = <TArgs extends any[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  context: string
): (...args: TArgs) => Promise<TReturn> => {
  return async (...args: TArgs) => {
    try {
      return await fn(...args);
    } catch (error) {
      logError(context, error);
      
      const errorCode = getErrorCode(error);
      const statusCode = hasStatusCode(error) ? error.statusCode : undefined;
      
      throw new AppError(
        getErrorMessage(error),
        typeof errorCode === 'string' ? errorCode : 'UNKNOWN_ERROR',
        statusCode,
        context,
        undefined,
        error
      );
    }
  };
};

/**
 * Handle error with fallback value
 */
export const handleErrorWithFallback = <T>(
  error: unknown,
  fallbackValue: T,
  context?: string
): T => {
  if (context) {
    logError(context, error);
  }
  return fallbackValue;
};

/**
 * Retry async operation with exponential backoff
 */
export const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: unknown) => void;
  } = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    onRetry
  } = options;
  
  let lastError: unknown;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      if (attempt < maxRetries - 1) {
        const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
        
        if (onRetry) {
          onRetry(attempt + 1, error);
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
};

/**
 * Type guard to check if error is an API error
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    'message' in error &&
    typeof (error as Record<string, unknown>).statusCode === 'number' &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
};

/**
 * Type guard to check if error is a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('network') ||
           error.message.toLowerCase().includes('fetch');
  }
  return false;
};

/**
 * Type guard to check if error is a timeout error
 */
export const isTimeoutError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return error.message.toLowerCase().includes('timeout');
  }
  if (hasErrorCode(error)) {
    return error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT';
  }
  return false;
};

/**
 * Get user-friendly error message based on error type
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  if (isNetworkError(error)) {
    return '네트워크 연결을 확인해주세요.';
  }
  
  if (isTimeoutError(error)) {
    return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
  }
  
  if (isApiError(error)) {
    switch (error.statusCode) {
      case 400:
        return '잘못된 요청입니다.';
      case 401:
        return '로그인이 필요합니다.';
      case 403:
        return '접근 권한이 없습니다.';
      case 404:
        return '요청한 내용을 찾을 수 없습니다.';
      case 409:
        return '중복된 데이터가 있습니다.';
      case 422:
        return '입력 값을 확인해주세요.';
      case 500:
      case 502:
      case 503:
      case 504:
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      default:
        return error.message || '오류가 발생했습니다.';
    }
  }
  
  return getErrorMessage(error);
};