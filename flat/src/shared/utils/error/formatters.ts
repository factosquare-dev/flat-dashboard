/**
 * Error formatting utilities for UI display
 */

import { isApiError, isNetworkError, isTimeoutError, ApiError } from '@/shared/utils/apiClient';
import { getErrorCode, getErrorMessage } from './core';

/**
 * Format error for display in UI
 */
export const formatErrorForDisplay = (error: unknown): {
  title: string;
  message: string;
  code?: string;
  retryable: boolean;
} => {
  const errorCode = getErrorCode(error);
  const errorMessage = getErrorMessage(error);
  
  // Determine if error is retryable
  const retryableCodes = ['NETWORK_ERROR', 'TIMEOUT_ERROR', 'TEMPORARY_ERROR'];
  const retryable = retryableCodes.includes(errorCode);
  
  // Get user-friendly title and message
  let title = '오류가 발생했습니다';
  let message = errorMessage;
  
  if (isNetworkError(error)) {
    title = '네트워크 연결 오류';
    message = '인터넷 연결을 확인하고 다시 시도해주세요.';
  } else if (isTimeoutError(error)) {
    title = '요청 시간 초과';
    message = '서버 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.';
  } else if (isApiError(error)) {
    const apiError = error as ApiError;
    switch (apiError.status) {
      case 401:
        title = '인증 오류';
        message = '로그인이 필요합니다.';
        break;
      case 403:
        title = '권한 없음';
        message = '이 작업을 수행할 권한이 없습니다.';
        break;
      case 404:
        title = '찾을 수 없음';
        message = '요청한 리소스를 찾을 수 없습니다.';
        break;
      case 500:
      case 502:
      case 503:
        title = '서버 오류';
        message = '서버에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
        break;
      default:
        title = '요청 오류';
        message = apiError.message || errorMessage;
    }
  }
  
  return {
    title,
    message,
    code: errorCode !== 'UNKNOWN_ERROR' ? errorCode : undefined,
    retryable
  };
};

/**
 * React error boundary fallback message
 */
export const getErrorBoundaryMessage = (error: Error): string => {
  if (import.meta.env.DEV) {
    return error.message;
  }
  
  return 'Something went wrong. Please refresh the page.';
};