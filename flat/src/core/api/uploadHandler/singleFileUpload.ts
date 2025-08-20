import { logger } from '@/shared/utils/logger';
import type { ApiResponse } from '@/core/api/requestHandlers';
import { ApiErrorHandler } from '@/core/api/errorHandling';
import type { UploadOptions, UploadResponse } from './types';
import { FileValidator } from './fileValidation';

export class SingleFileUploader {
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

  async uploadFile(
    endpoint: string,
    file: File,
    options: UploadOptions = {}
  ): Promise<ApiResponse<UploadResponse>> {
    const requestId = `upload-${Date.now()}`;
    
    try {
      // Validate file
      FileValidator.validateFile(file, options);

      const url = this.buildURL(endpoint);
      const timeout = options.timeout || this.defaultTimeout;
      
      logger.info('Starting file upload', {
        requestId,
        filename: file.name,
        size: file.size,
        type: file.type,
        url
      });

      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Setup headers (don't set Content-Type, let browser handle it)
      const headers = {
        ...this.defaultHeaders,
        ...options.headers,
      };
      delete headers['Content-Type'];

      // Create AbortController for timeout and cancellation
      const { controller, timeoutId } = ApiErrorHandler.createTimeoutController(timeout);
      const signal = options.signal || controller.signal;

      // Create XMLHttpRequest for progress tracking
      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Setup progress tracking
        if (options.onProgress) {
          xhr.upload.addEventListener('progress', (event) => {
            if (event.lengthComputable) {
              const progress = Math.round((event.loaded / event.total) * 100);
              options.onProgress!(progress);
            }
          });
        }

        // Setup completion handlers
        xhr.addEventListener('load', () => {
          clearTimeout(timeoutId);
          
          try {
            const response = {
              status: xhr.status,
              statusText: xhr.statusText,
              headers: new Headers(),
              ok: xhr.status >= 200 && xhr.status < 300
            } as Response;

            // Parse response headers
            xhr.getAllResponseHeaders().split('\r\n').forEach(line => {
              const [key, value] = line.split(': ');
              if (key && value) {
                (response.headers as any).set(key, value);
              }
            });

            if (!response.ok) {
              const error = ApiErrorHandler.createError(
                `Upload failed: ${xhr.statusText}`,
                xhr.status,
                xhr.statusText,
                xhr.responseText,
                requestId
              );
              reject(error);
              return;
            }

            let data;
            try {
              data = JSON.parse(xhr.responseText);
            } catch {
              data = xhr.responseText;
            }

            logger.info('File upload completed', {
              requestId,
              status: xhr.status,
              filename: file.name
            });

            resolve({
              data,
              status: xhr.status,
              statusText: xhr.statusText,
              headers: response.headers
            });

          } catch (error) {
            reject(ApiErrorHandler.handleNetworkError(
              error as Error,
              requestId,
              url
            ));
          }
        });

        xhr.addEventListener('error', () => {
          clearTimeout(timeoutId);
          reject(ApiErrorHandler.handleNetworkError(
            new Error('Upload failed'),
            requestId,
            url
          ));
        });

        xhr.addEventListener('timeout', () => {
          reject(ApiErrorHandler.createError(
            'Upload timed out',
            undefined,
            'timeout',
            undefined,
            requestId
          ));
        });

        // Handle cancellation
        signal.addEventListener('abort', () => {
          xhr.abort();
          reject(ApiErrorHandler.createError(
            'Upload cancelled',
            undefined,
            'cancelled',
            undefined,
            requestId
          ));
        });

        // Start upload
        xhr.open('POST', url);
        
        // Set headers
        Object.entries(headers).forEach(([key, value]) => {
          xhr.setRequestHeader(key, value);
        });

        xhr.send(formData);
      });

    } catch (error) {
      logger.error('File upload error', {
        requestId,
        filename: file.name,
        error: (error as Error).message
      });
      throw error;
    }
  }
}