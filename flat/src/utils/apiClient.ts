import type { ApiResponse, PaginatedResponse } from '../types/common';

export interface ApiClientOptions {
  baseURL?: string;
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  headers?: Record<string, string>;
}

export interface RequestOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  params?: Record<string, any>;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
    public response?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export class ApiClient {
  private baseURL: string;
  private timeout: number;
  private retries: number;
  private retryDelay: number;
  private defaultHeaders: Record<string, string>;

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

  private async sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private buildURL(endpoint: string, params?: Record<string, any>): string {
    const url = new URL(endpoint, this.baseURL);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    return url.toString();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const {
      timeout = this.timeout,
      retries = this.retries,
      retryDelay = this.retryDelay,
      params,
      headers = {},
      ...fetchOptions
    } = options;

    const url = this.buildURL(endpoint, params);
    const controller = new AbortController();
    
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);

    const requestHeaders = {
      ...this.defaultHeaders,
      ...headers,
    };

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: requestHeaders,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.code,
            errorData
          );
        }

        // Handle empty responses
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          return await response.json();
        } else {
          return await response.text() as unknown as T;
        }
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on abort or client errors (4xx)
        if (
          error instanceof Error && 
          (error.name === 'AbortError' || 
           (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500))
        ) {
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
}

// Create a default instance
export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});

// Utility functions for common error handling
export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.name === 'TypeError' ||
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch')
  );
};

export const isTimeoutError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.name === 'AbortError' ||
    error.message.includes('timeout')
  );
};

export const getErrorMessage = (error: unknown, fallback = 'An error occurred'): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return fallback;
};