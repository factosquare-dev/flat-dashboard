/**
 * API Client utility
 * 
 * Re-exports the refactored modular API client
 */

export {
  ApiClient,
  ApiError,
  apiClient,
  handleApiError,
  isApiError,
  isNetworkError,
  isTimeoutError,
  getErrorMessage
} from './apiClient/index';

export type { ApiClientOptions, RequestOptions } from './apiClient/types';