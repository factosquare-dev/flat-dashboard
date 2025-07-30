import { logger } from '../../../utils/logger';
import type { ApiResponse } from '../requestHandlers';
import { ApiErrorHandler } from '../errorHandling';
import type { UploadOptions, UploadResponse } from './types';
import { FileValidator } from './fileValidation';

export class MultipleFileUploader {
  constructor(
    private baseURL: string,
    private defaultHeaders: Record<string, string>,
    private defaultTimeout: number
  ) {}

  private buildURL(endpoint: string): string {
    if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
      return endpoint;
    }
    
    const baseURL = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
    const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    
    return `${baseURL}${path}`;
  }

  async uploadMultipleFiles(
    endpoint: string,
    files: File[],
    options: UploadOptions = {}
  ): Promise<ApiResponse<UploadResponse[]>> {
    const requestId = `multi-upload-${Date.now()}`;
    
    logger.info('Starting multiple file upload', {
      requestId,
      fileCount: files.length,
      totalSize: files.reduce((sum, file) => sum + file.size, 0)
    });

    try {
      // Validate all files first
      files.forEach(file => FileValidator.validateFile(file, options));

      const url = this.buildURL(endpoint);
      const formData = new FormData();
      
      // Add all files to FormData
      files.forEach((file, index) => {
        formData.append(`files[${index}]`, file);
      });

      // Use fetch for multiple file upload
      const headers = {
        ...this.defaultHeaders,
        ...options.headers,
      };
      delete headers['Content-Type'];

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
        signal: options.signal
      });

      const data = await ApiErrorHandler.handleResponse(response, requestId);

      logger.info('Multiple file upload completed', {
        requestId,
        fileCount: files.length,
        status: response.status
      });

      return {
        data,
        status: response.status,
        statusText: response.statusText,
        headers: response.headers
      };

    } catch (error) {
      logger.error('Multiple file upload error', {
        requestId,
        fileCount: files.length,
        error: (error as Error).message
      });
      throw error;
    }
  }
}