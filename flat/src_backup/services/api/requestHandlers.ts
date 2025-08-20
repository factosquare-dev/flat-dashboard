/**
 * HTTP request handlers for API client
 */

import { logger, PerformanceLogger } from '@/utils/logger';
import { ApiErrorHandler } from './errorHandling';

export interface RequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  signal?: AbortSignal;
  retries?: number;
  retryDelay?: number;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export class RequestHandlers {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;
  private defaultTimeout: number;
  private requestId: number = 0;

  constructor(
    baseURL: string,
    defaultHeaders: Record<string, string>,
    defaultTimeout: number
  ) {
    this.baseURL = baseURL;
    this.defaultHeaders = defaultHeaders;
    this.defaultTimeout = defaultTimeout;
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${++this.requestId}`;
  }

  private buildURL(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    const baseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${baseURL}${path}`;
  }

  private async executeRequest<T, B = unknown>(
    method: string,
    endpoint: string,
    body?: B,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    const url = this.buildURL(endpoint);
    const timeout = options.timeout || this.defaultTimeout;
    const maxRetries = options.retries || 0;
    
    let attempt = 0;
    let lastError: Error;

    while (attempt <= maxRetries) {
      attempt++;
      
      const { controller, timeoutId } = ApiErrorHandler.createTimeoutController(timeout);
      const signal = options.signal || controller.signal;
      
      const headers = {
        ...this.defaultHeaders,
        ...options.headers,
      };

      const requestOptions: RequestInit = {
        method: method.toUpperCase(),
        headers,
        signal,
      };

      if (body !== undefined) {
        if (body instanceof FormData) {
          // Don't set Content-Type for FormData, let browser set it with boundary
          delete headers['Content-Type'];
          requestOptions.body = body;
        } else if (typeof body === 'string') {
          requestOptions.body = body;
        } else {
          requestOptions.body = JSON.stringify(body);
        }
      }

      const performanceLogger = new PerformanceLogger(requestId, `${method.toUpperCase()} ${url}`);
      
      try {
        ApiErrorHandler.logRequest(method, url, requestId, requestOptions);
        
        const response = await fetch(url, requestOptions);
        clearTimeout(timeoutId);
        
        const duration = performanceLogger.end();
        ApiErrorHandler.logResponse(response, requestId, duration);
        
        const data = await ApiErrorHandler.handleResponse(response, requestId);
        
        return {
          data,
          status: response.status,
          statusText: response.statusText,
          headers: response.headers,
        };

      } catch (error) {
        clearTimeout(timeoutId);
        performanceLogger.end();
        
        const apiError = ApiErrorHandler.handleNetworkError(
          error as Error,
          requestId,
          url
        );
        
        lastError = apiError;
        
        if (ApiErrorHandler.shouldRetry(apiError, attempt, maxRetries)) {
          const delay = ApiErrorHandler.getRetryDelay(attempt, options.retryDelay);
          
          logger.warn('Retrying request after error', {
            requestId,
            attempt,
            maxRetries,
            delay,
            error: apiError.message
          });
          
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        throw apiError;
      }
    }
    
    throw lastError;
  }

  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('GET', endpoint, undefined, options);
  }

  async post<T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T, B>('POST', endpoint, body, options);
  }

  async put<T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T, B>('PUT', endpoint, body, options);
  }

  async patch<T, B = unknown>(endpoint: string, body?: B, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T, B>('PATCH', endpoint, body, options);
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.executeRequest<T>('DELETE', endpoint, undefined, options);
  }

  async head(endpoint: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.executeRequest<void>('HEAD', endpoint, undefined, options);
  }

  async options(endpoint: string, options?: RequestOptions): Promise<ApiResponse<unknown>> {
    return this.executeRequest<unknown>('OPTIONS', endpoint, undefined, options);
  }
}