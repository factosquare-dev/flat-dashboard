export { ApiClient } from './ApiClient';
export { ApiError } from './ApiError';
export type { ApiClientOptions, RequestOptions } from './types';
export {
  handleApiError,
  isApiError,
  isNetworkError,
  isTimeoutError,
  getErrorMessage
} from './errorUtils';

// Create a default instance
import { ApiClient } from './ApiClient';
import { apiConfig } from '../../config';

export const apiClient = new ApiClient({
  baseURL: apiConfig.baseURL,
  timeout: apiConfig.timeout,
  retries: apiConfig.retryAttempts,
  retryDelay: apiConfig.retryDelay,
});

// Export convenience methods
export const setAuthToken = (token: string | null) => apiClient.setAuthToken(token);