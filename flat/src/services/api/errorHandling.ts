/**
 * API error handling utilities
 */

import { logger } from '../../utils/logger';

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: any;
  requestId?: string;
}

export class ApiErrorHandler {
  static createError(
    message: string,
    status?: number,
    statusText?: string,
    data?: any,
    requestId?: string
  ): ApiError {
    return {
      message,
      status,
      statusText,
      data,
      requestId
    };
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

  static handleNetworkError(error: Error, requestId: string, url: string): ApiError {
    logger.error('Network error occurred', {
      requestId,
      url,
      error: error.message,
      stack: error.stack
    });

    let message = 'Network error occurred';
    
    if (error.name === 'AbortError') {
      message = 'Request was cancelled';
    } else if (error.message.includes('Failed to fetch')) {
      message = 'Unable to connect to server. Please check your internet connection.';
    } else if (error.message.includes('timeout')) {
      message = 'Request timed out. Please try again.';
    }

    return this.createError(message, undefined, undefined, undefined, requestId);
  }

  static isRetryableError(error: ApiError): boolean {
    // Retry on network errors or 5xx server errors
    return !error.status || (error.status >= 500 && error.status < 600);
  }

  static getRetryDelay(attempt: number, baseDelay: number = 1000): number {
    // Exponential backoff with jitter
    const delay = baseDelay * Math.pow(2, attempt - 1);
    const jitter = Math.random() * 0.1 * delay;
    return Math.min(delay + jitter, 30000); // Max 30 seconds
  }

  static shouldRetry(error: ApiError, attempt: number, maxRetries: number): boolean {
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