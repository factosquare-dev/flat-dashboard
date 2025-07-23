/**
 * Centralized error handling utilities
 */

import { logger } from './logger';
import { ApiError, isApiError, isNetworkError, isTimeoutError } from './apiClient';

export interface ErrorContext {
  operation?: string;
  component?: string;
  userId?: string;
  [key: string]: any;
}

export class ErrorHandler {
  /**
   * Handle API errors with consistent logging and user-friendly messages
   */
  static handleApiError(error: unknown, operation: string, context?: ErrorContext): string {
    const errorContext = {
      operation,
      timestamp: new Date().toISOString(),
      ...context
    };

    // Log the error
    logger.error(`API Error during ${operation}`, error as Error, errorContext);

    // Return user-friendly message
    if (isNetworkError(error)) {
      return '네트워크 연결을 확인해주세요.';
    }

    if (isTimeoutError(error)) {
      return '요청 시간이 초과되었습니다. 다시 시도해주세요.';
    }

    if (isApiError(error)) {
      const apiError = error as ApiError;
      if (apiError.status === 401) {
        return '인증이 필요합니다. 다시 로그인해주세요.';
      }
      if (apiError.status === 403) {
        return '권한이 없습니다.';
      }
      if (apiError.status === 404) {
        return '요청한 정보를 찾을 수 없습니다.';
      }
      if (apiError.status === 422) {
        return '입력한 정보를 확인해주세요.';
      }
      if (apiError.status && apiError.status >= 500) {
        return '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
      }
      return apiError.message || '오류가 발생했습니다.';
    }

    return '예상치 못한 오류가 발생했습니다.';
  }

  /**
   * Handle component errors with fallback behavior
   */
  static handleComponentError(error: Error, componentName: string, fallback?: () => void): void {
    logger.error(`Component error in ${componentName}`, error, {
      component: componentName,
      stack: error.stack
    });

    if (fallback) {
      try {
        fallback();
      } catch (fallbackError) {
        logger.error(`Fallback failed in ${componentName}`, fallbackError as Error);
      }
    }
  }

  /**
   * Handle async operations with consistent error handling
   */
  static async handleAsync<T>(
    operation: () => Promise<T>,
    options: {
      operationName: string;
      context?: ErrorContext;
      fallback?: T;
      onError?: (error: Error) => void;
    }
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      const errorMessage = this.handleApiError(error, options.operationName, options.context);
      
      if (options.onError) {
        options.onError(new Error(errorMessage));
      }

      return options.fallback;
    }
  }

  /**
   * Create an error boundary handler
   */
  static createErrorBoundary(componentName: string) {
    return {
      onError: (error: Error, errorInfo: any) => {
        logger.error(`Error boundary triggered in ${componentName}`, error, {
          component: componentName,
          errorInfo
        });
      }
    };
  }

  /**
   * Handle form validation errors
   */
  static handleValidationError(errors: Record<string, string | string[]>, formName: string): void {
    logger.warn(`Validation errors in ${formName}`, {
      form: formName,
      errors,
      errorCount: Object.keys(errors).length
    });
  }

  /**
   * Create a retry handler for failed operations
   */
  static async retryOperation<T>(
    operation: () => Promise<T>,
    options: {
      maxRetries?: number;
      retryDelay?: number;
      operationName: string;
      shouldRetry?: (error: unknown) => boolean;
    } = { maxRetries: 3, retryDelay: 1000, operationName: 'unknown' }
  ): Promise<T> {
    const { maxRetries = 3, retryDelay = 1000, operationName, shouldRetry } = options;
    let lastError: unknown;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        // Check if we should retry
        if (shouldRetry && !shouldRetry(error)) {
          throw error;
        }

        // Don't retry on client errors
        if (isApiError(error) && error.status && error.status >= 400 && error.status < 500) {
          throw error;
        }

        // Log retry attempt
        if (attempt < maxRetries) {
          logger.warn(`Retrying ${operationName} (attempt ${attempt + 1}/${maxRetries})`, {
            operation: operationName,
            attempt: attempt + 1,
            error: (error as Error).message
          });

          // Wait before retrying
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
        }
      }
    }

    throw lastError;
  }
}

// Export convenience functions
export const handleApiError = ErrorHandler.handleApiError.bind(ErrorHandler);
export const handleComponentError = ErrorHandler.handleComponentError.bind(ErrorHandler);
export const handleAsync = ErrorHandler.handleAsync.bind(ErrorHandler);
export const retryOperation = ErrorHandler.retryOperation.bind(ErrorHandler);