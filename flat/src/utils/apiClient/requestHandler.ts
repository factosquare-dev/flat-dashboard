import { ApiError } from './ApiError';
import type { RequestOptions } from './types';

export class RequestHandler {
  static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      let errorData: { message?: string; status?: number; code?: string; [key: string]: any } = {};
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          errorData = await response.json();
        } catch (jsonError) {
          console.warn('Failed to parse error response as JSON:', jsonError);
          errorData = {
            message: await response.text().catch(() => response.statusText),
            status: response.status
          };
        }
      } else {
        errorData = {
          message: await response.text().catch(() => response.statusText),
          status: response.status
        };
      }
      
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code,
        errorData
      );
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    const contentLength = response.headers.get('content-length');
    
    // Check for empty response
    if (contentLength === '0' || response.status === 204) {
      return null as unknown as T;
    }
    
    if (contentType && contentType.includes('application/json')) {
      try {
        return await response.json();
      } catch (jsonError) {
        console.warn('Failed to parse response as JSON:', jsonError);
        const text = await response.text();
        throw new ApiError(
          `Invalid JSON response: ${text.substring(0, 100)}${text.length > 100 ? '...' : ''}`,
          response.status
        );
      }
    } else {
      return await response.text() as unknown as T;
    }
  }

  static createTimeoutController(timeout: number): { controller: AbortController; timeoutId: NodeJS.Timeout } {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, timeout);
    
    return { controller, timeoutId };
  }

  static shouldRetry(error: Error, attempt: number, maxRetries: number): boolean {
    // Don't retry on abort or client errors (4xx)
    if (
      error.name === 'AbortError' || 
      (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500)
    ) {
      return false;
    }
    
    return attempt < maxRetries;
  }
}