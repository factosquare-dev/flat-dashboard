import type { ApiResponse, PaginatedResponse } from '../../types/common';
import type { ApiClientOptions, RequestOptions } from './types';
import { ApiError } from './ApiError';
import { UrlBuilder } from './urlBuilder';
import { RequestHandler } from './requestHandler';
import { logger } from '../../utils/logger';

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private defaultHeaders: Record<string, string>;
  private requestId: number = 0;

  constructor(options: ApiClientOptions = {}) {
    this.baseURL = options.baseURL || '';
    this.timeout = options.timeout || 30000;
    this.retries = options.retries || 3;
    this.retryDelay = options.retryDelay || 1000;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${++this.requestId}`;
  }

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const requestId = this.generateRequestId();
    const {
      timeout = this.timeout,
      retries = this.retries,
      retryDelay = this.retryDelay,
      params,
      headers = {},
      ...fetchOptions
    } = options;

    const url = UrlBuilder.build(endpoint, this.baseURL, params);
    const { controller, timeoutId } = RequestHandler.createTimeoutController(timeout);

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    // Log API request
    logger.logApiRequest({
      requestId,
      url,
      method: fetchOptions.method || 'GET',
      headers: requestHeaders,
    });

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: requestHeaders,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);
        const data = await RequestHandler.handleResponse<T>(response);
        
        // Log successful response
        logger.info(`API request successful: ${requestId}`, {
          requestId,
          status: response.status,
          method: fetchOptions.method || 'GET',
          url,
        });
        
        return data;
        
      } catch (error) {
        lastError = error as Error;
        
        // Log error
        logger.error(`API request failed: ${requestId}`, lastError, {
          requestId,
          attempt,
          method: fetchOptions.method || 'GET',
          url,
        });
        
        if (!RequestHandler.shouldRetry(lastError, attempt, retries)) {
          break;
        }

        // Wait before retrying (except on last attempt)
        if (attempt < retries) {
          await this.sleep(retryDelay * (attempt + 1));
        }
      }
    }

    clearTimeout(timeoutId);
    throw lastError || new ApiError('Request failed after all retries');
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  async post<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: any, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }

  // Utility methods for common API patterns
  async getWithPagination<T>(
    endpoint: string,
    params: { page?: number; limit?: number; [key: string]: any } = {},
    options: RequestOptions = {}
  ): Promise<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(endpoint, {
      ...options,
      params: {
        page: 1,
        limit: 10,
        ...params,
      },
    });
  }

  async postWithResponse<T>(
    endpoint: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.post<ApiResponse<T>>(endpoint, data, options);
  }

  async putWithResponse<T>(
    endpoint: string,
    data: any,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.put<ApiResponse<T>>(endpoint, data, options);
  }

  async deleteWithResponse<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    return this.delete<ApiResponse<T>>(endpoint, options);
  }

  // Set or remove authentication token
  setAuthToken(token: string | null) {
    if (token) {
      this.defaultHeaders = {
        ...this.defaultHeaders,
        Authorization: `Bearer ${token}`,
      };
    } else {
      const headers = { ...this.defaultHeaders };
      delete (headers as any).Authorization;
      this.defaultHeaders = headers;
    }
  }
}