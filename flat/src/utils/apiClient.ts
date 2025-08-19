/**
 * API Client utility
 * 
 * Re-exports API error handling utilities
 */

// Export from services/api/errorHandling
export {
  ApiErrorHandler,
  isApiError,
  isNetworkError,
  isTimeoutError,
  handleApiError
} from '@/services/api/errorHandling';

// Export ApiError interface from services/api/errorHandling 
export type { ApiError } from '@/services/api/errorHandling';

export { apiClient as default } from '@/services/api';