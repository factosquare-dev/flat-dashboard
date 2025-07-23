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

export const apiClient = new ApiClient({
  baseURL: import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
});

// Export convenience methods
export const setAuthToken = (token: string | null) => apiClient.setAuthToken(token);