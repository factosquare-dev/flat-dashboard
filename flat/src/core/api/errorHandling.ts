/**
 * API error handling utilities
 */

import { logger } from '@/shared/utils/logger';
import { 
  AppError, 
  ERROR_CODES, 
  ERROR_MESSAGES, 
  httpStatusToErrorCode 
} from '@/shared/utils/error/core';

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: any;
  requestId?: string;
}

/**
 * Type guard for ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as any).message === 'string'
  );
}

/**
 * Type guard for network errors
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === ERROR_CODES.NETWORK_ERROR;
  }
  return (
    error instanceof Error &&
    (error.message.toLowerCase().includes('network') ||
     error.message.toLowerCase().includes('fetch'))
  );
}

/**
 * Type guard for timeout errors
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof AppError) {
    return error.code === ERROR_CODES.TIMEOUT_ERROR;
  }
  return (
    error instanceof Error &&
    (error.name === 'AbortError' ||
     error.message.toLowerCase().includes('timeout'))
  );
}

/**
 * Handle API errors with consistent formatting
 */
export function handleApiError(error: unknown, operation: string): string {
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
}

export class ApiErrorHandler {
  static createError(
    message: string,
    status?: number,
    statusText?: string,
    data?: any,
    requestId?: string
  ): AppError {
    const errorCode = status ? httpStatusToErrorCode(status) : ERROR_CODES.UNKNOWN_ERROR;
    const errorMessage = message || ERROR_MESSAGES[errorCode];
    
    const appError = new AppError(errorMessage, errorCode, status, {
      statusText,
      data,
      requestId,
      originalMessage: message,
    });
    
    return appError;
  }

  static async handleResponse(response: Response, requestId: string): Promise<any> {
    const contentType = response.headers.get('content-type');
    let data: any;

    try {
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (parseError) {
      logger.warn('Failed to parse response body', { 
        requestId, 
        contentType,
        error: parseError 
      });
      data = null;
    }

    if (!response.ok) {
      const errorMessage = data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`;
      
      logger.error('API request failed', {
        requestId,
        status: response.status,
        statusText: response.statusText,
        url: response.url,
        data
      });

      throw this.createError(
        errorMessage,
        response.status,
        response.statusText,
        data,
        requestId
      );
    }

    return data;
  }

  static handleNetworkError(error: Error, requestId: string, url: string): AppError {
    logger.error('Network error occurred', {
      requestId,
      url,
      error: error.message,
      stack: error.stack
    });

    let errorCode = ERROR_CODES.NETWORK_ERROR;
    let message = ERROR_MESSAGES.NETWORK_ERROR;
    
    if (error.name === 'AbortError') {
      errorCode = ERROR_CODES.TIMEOUT_ERROR;
      message = '요청이 취소되었습니다.';
    } else if (error.message.includes('timeout')) {
      errorCode = ERROR_CODES.TIMEOUT_ERROR;
      message = ERROR_MESSAGES.TIMEOUT_ERROR;
    }

    return new AppError(message, errorCode, undefined, {
      requestId,
      url,
      originalError: error.message,
    });
  }

  static isRetryableError(error: AppError | ApiError): boolean {
    // Check if it's an AppError with retryable code
    if (error instanceof AppError) {
      const retryableCodes = [
        ERROR_CODES.NETWORK_ERROR,
        ERROR_CODES.TIMEOUT_ERROR,
        ERROR_CODES.SERVER_ERROR,
        ERROR_CODES.SERVICE_UNAVAILABLE,
      ];
      return retryableCodes.includes(error.code as any);
    }
    
    // Legacy check for ApiError
    return !error.status || (error.status >= 500 && error.status < 600);
  }

  static getRetryDelay(attempt: number, baseDelay: number = 1000): number {
    // Exponential backoff with jitter
    const delay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * delay;
    return Math.min(delay + jitter, 30000); // Max 30 seconds
  }

  static shouldRetry(error: AppError | ApiError, attempt: number, maxRetries: number): boolean {
    return attempt < maxRetries && this.isRetryableError(error);
  }

  static createTimeoutController(timeout: number): {
    controller: AbortController;
    timeoutId: NodeJS.Timeout;
  } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    return { controller, timeoutId };
  }

  static logRequest(method: string, url: string, requestId: string, options?: any) {
    logger.info('API request started', {
      requestId,
      method: method.toUpperCase(),
      url,
      hasBody: !!options?.body,
      headers: options?.headers
    });
  }

  static logResponse(response: Response, requestId: string, duration: number) {
    logger.info('API request completed', {
      requestId,
      status: response.status,
      statusText: response.statusText,
      url: response.url,
      duration: `${duration}ms`,
      size: response.headers.get('content-length') || 'unknown'
    });
  }
}