/**
 * API client with integrated logging and error handling
 */

import { logger, PerformanceLogger } from '../utils/logger';

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: any;
}

class ApiClient {
  private config: ApiConfig;
  private requestId: number = 0;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
      timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      ...config,
    };

    logger.info('API client initialized', {
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
    });
  }

  private generateRequestId(): string {
    return `req-${Date.now()}-${++this.requestId}`;
  }

  private buildUrl(endpoint: string): string {
    // Handle absolute URLs
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    // Handle relative URLs
    const baseURL = this.config.baseURL.endsWith('/') 
      ? this.config.baseURL.slice(0, -1)
      : this.config.baseURL;
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${baseURL}${cleanEndpoint}`;
  }

  private async makeRequest<T>(
    method: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    const url = this.buildUrl(endpoint);
    const startTime = performance.now();

    // Prepare request
    const config: RequestInit = {
      method,
      headers: {
        ...this.config.defaultHeaders,
        ...options.headers,
        'X-Request-ID': requestId,
      },
      ...options,
    };

    // Add timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    config.signal = controller.signal;

    logger.debug(`API request started: ${method} ${url}`, {
      requestId,
      method,
      url,
      headers: config.headers,
    });

    try {
      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      const duration = performance.now() - startTime;
      const responseData = await this.parseResponse<T>(response);

      // Log successful request
      logger.logApiRequest(method, url, response.status, Math.round(duration));

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      logger.debug(`API request completed: ${method} ${url}`, {
        requestId,
        status: response.status,
        duration: Math.round(duration),
      });

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };

    } catch (error) {
      clearTimeout(timeoutId);
      const duration = performance.now() - startTime;

      // Create API error
      const apiError: ApiError = {
        message: error instanceof Error ? error.message : 'Unknown error',
      };

      if (error instanceof TypeError && error.message.includes('fetch')) {
        // Network error
        apiError.message = 'Network error - please check your connection';
        logger.logApiRequest(method, url, 0, Math.round(duration), error as Error);
      } else if (error.name === 'AbortError') {
        // Timeout error
        apiError.message = 'Request timeout';
        logger.logApiRequest(method, url, 0, Math.round(duration), error as Error);
      } else {
        // Other errors
        logger.logApiRequest(method, url, undefined, Math.round(duration), error as Error);
      }

      logger.error(`API request failed: ${method} ${url}`, error as Error, {
        requestId,
        duration: Math.round(duration),
      });

      throw apiError;
    }
  }

  private async parseResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    } else if (contentType && contentType.includes('text/')) {
      return await response.text() as unknown as T;
    } else {
      return await response.blob() as unknown as T;
    }
  }

  /**
   * GET request
   */
  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('GET', endpoint, options);
  }

  /**
   * POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    };
    
    return this.makeRequest<T>('POST', endpoint, config);
  }

  /**
   * PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    };
    
    return this.makeRequest<T>('PUT', endpoint, config);
  }

  /**
   * PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    data?: any,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      ...options,
      body: data ? JSON.stringify(data) : undefined,
    };
    
    return this.makeRequest<T>('PATCH', endpoint, config);
  }

  /**
   * DELETE request
   */
  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    return this.makeRequest<T>('DELETE', endpoint, options);
  }

  /**
   * Upload file with progress tracking
   */
  async upload<T = any>(
    endpoint: string,
    file: File,
    options: {
      onProgress?: (progress: number) => void;
      additionalData?: Record<string, string>;
    } = {}
  ): Promise<ApiResponse<T>> {
    const requestId = this.generateRequestId();
    const url = this.buildUrl(endpoint);
    const startTime = performance.now();

    const formData = new FormData();
    formData.append('file', file);
    
    if (options.additionalData) {
      Object.entries(options.additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    logger.info(`File upload started: ${file.name}`, {
      requestId,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-Request-ID': requestId,
        },
        body: formData,
      });

      const duration = performance.now() - startTime;
      const responseData = await this.parseResponse<T>(response);

      logger.info(`File upload completed: ${file.name}`, {
        requestId,
        status: response.status,
        duration: Math.round(duration),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return {
        data: responseData,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
      };

    } catch (error) {
      const duration = performance.now() - startTime;
      
      logger.error(`File upload failed: ${file.name}`, error as Error, {
        requestId,
        duration: Math.round(duration),
      });

      throw error;
    }
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const timerId = 'health-check';
    PerformanceLogger.startTimer(timerId);

    try {
      const response = await this.get<{ status: string; timestamp: string }>('/ping');
      PerformanceLogger.endTimer(timerId, 'Health check');
      
      logger.info('Health check successful', {
        status: response.data.status,
        timestamp: response.data.timestamp,
      });

      return response.data;
    } catch (error) {
      PerformanceLogger.endTimer(timerId, 'Health check');
      
      logger.warn('Health check failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  }

  /**
   * Set authentication token
   */
  setAuthToken(token: string): void {
    this.config.defaultHeaders['Authorization'] = `Bearer ${token}`;
    logger.info('Authentication token set');
  }

  /**
   * Remove authentication token
   */
  removeAuthToken(): void {
    delete this.config.defaultHeaders['Authorization'];
    logger.info('Authentication token removed');
  }

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    logger.info('Base URL updated', { baseURL });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types
export type { ApiConfig, ApiResponse, ApiError };

export default apiClient;