/**
 * Main API client - Refactored to use modular architecture
 */

import { logger, PerformanceLogger } from '../utils/logger';
import { CachedRequestHandlers } from './api/cachedRequestHandlers';
import { UploadHandler } from './api/uploadHandler';
import type { ApiResponse, RequestOptions } from './api/requestHandlers';
import type { UploadOptions, UploadResponse } from './api/uploadHandler';
import type { ApiError } from './api/errorHandling';
import { apiConfig } from '../config';

export interface ApiConfig {
  baseURL: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

class ApiClient {
  private config: ApiConfig;
  private requestHandlers: CachedRequestHandlers;
  private uploadHandler: UploadHandler;

  constructor(config: Partial<ApiConfig> = {}) {
    this.config = {
      baseURL: apiConfig.baseURL,
      timeout: apiConfig.timeout,
      defaultHeaders: {
        'Content-Type': 'application/json',
      },
      ...config,
    };

    // Initialize handlers with configuration
    this.requestHandlers = new CachedRequestHandlers(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );
    
    this.uploadHandler = new UploadHandler(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );

    logger.info('API client initialized', {
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
    });
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.requestHandlers.get<T>(endpoint, options);
  }

  /**
   * POST request
   */
  async post<T, D = unknown>(
    endpoint: string,
    data?: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.requestHandlers.post<T>(endpoint, data, options);
  }

  /**
   * PUT request
   */
  async put<T, D = unknown>(
    endpoint: string,
    data?: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.requestHandlers.put<T>(endpoint, data, options);
  }

  /**
   * PATCH request
   */
  async patch<T, D = unknown>(
    endpoint: string,
    data?: D,
    options?: RequestOptions
  ): Promise<ApiResponse<T>> {
    return this.requestHandlers.patch<T>(endpoint, data, options);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.requestHandlers.delete<T>(endpoint, options);
  }

  /**
   * HEAD request
   */
  async head(endpoint: string, options?: RequestOptions): Promise<ApiResponse<void>> {
    return this.requestHandlers.head(endpoint, options);
  }

  /**
   * OPTIONS request
   */
  async options<T = unknown>(endpoint: string, options?: RequestOptions): Promise<ApiResponse<T>> {
    return this.requestHandlers.options<T>(endpoint, options);
  }

  /**
   * Upload single file with progress tracking
   */
  async upload<T = UploadResponse>(
    endpoint: string,
    file: File,
    options?: UploadOptions
  ): Promise<ApiResponse<T>> {
    return this.uploadHandler.uploadFile(endpoint, file, options) as Promise<ApiResponse<T>>;
  }

  /**
   * Upload multiple files
   */
  async uploadMultiple<T = UploadResponse[]>(
    endpoint: string,
    files: File[],
    options?: UploadOptions
  ): Promise<ApiResponse<T>> {
    return this.uploadHandler.uploadMultipleFiles(endpoint, files, options) as Promise<ApiResponse<T>>;
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
    // Update handlers with new headers
    this.requestHandlers = new CachedRequestHandlers(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );
    this.uploadHandler = new UploadHandler(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );
    
    logger.info('Authentication token set');
  }

  /**
   * Remove authentication token
   */
  removeAuthToken(): void {
    delete this.config.defaultHeaders['Authorization'];
    // Update handlers with new headers
    this.requestHandlers = new CachedRequestHandlers(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );
    this.uploadHandler = new UploadHandler(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );
    
    logger.info('Authentication token removed');
  }

  /**
   * Update base URL
   */
  setBaseURL(baseURL: string): void {
    this.config.baseURL = baseURL;
    // Update handlers with new base URL
    this.requestHandlers = new RequestHandlers(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );
    this.uploadHandler = new UploadHandler(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );
    
    logger.info('Base URL updated', { baseURL });
  }

  /**
   * Update timeout setting
   */
  setTimeout(timeout: number): void {
    this.config.timeout = timeout;
    // Update handlers with new timeout
    this.requestHandlers = new RequestHandlers(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );
    this.uploadHandler = new UploadHandler(
      this.config.baseURL,
      this.config.defaultHeaders,
      this.config.timeout
    );
    
    logger.info('Timeout updated', { timeout });
  }

  /**
   * Get current configuration
   */
  getConfig(): ApiConfig {
    return { ...this.config };
  }

  /**
   * Cache management methods
   */
  
  /**
   * Invalidate cache for specific pattern
   */
  invalidateCache(pattern?: string | RegExp): void {
    this.requestHandlers.invalidateCache(pattern);
  }

  /**
   * Clear all cached data
   */
  clearCache(): void {
    this.requestHandlers.clearCache();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return this.requestHandlers.getCacheStats();
  }

  // Utility methods (delegated to upload handler)
  static getFileExtension = UploadHandler.getFileExtension;
  static formatFileSize = UploadHandler.formatFileSize;
  static isImageFile = UploadHandler.isImageFile;
  static isVideoFile = UploadHandler.isVideoFile;
  static isDocumentFile = UploadHandler.isDocumentFile;
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export types from modules
export type { 
  ApiConfig, 
  ApiResponse, 
  RequestOptions,
  UploadOptions,
  UploadResponse,
  ApiError 
};

export default apiClient;