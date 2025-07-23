import { ApiError } from './ApiError';

export const handleApiError = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
};

export const isApiError = (error: unknown): error is ApiError => {
  return error instanceof ApiError;
};

export const isNetworkError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.name === 'TypeError' ||
    error.message.includes('fetch') ||
    error.message.includes('network') ||
    error.message.includes('Failed to fetch')
  );
};

export const isTimeoutError = (error: unknown): boolean => {
  return error instanceof Error && (
    error.name === 'AbortError' ||
    error.message.includes('timeout')
  );
};

export const getErrorMessage = (error: unknown, fallback = 'An error occurred'): string => {
  if (isApiError(error)) {
    return error.message;
  }
  
  if (isNetworkError(error)) {
    return 'Network error. Please check your connection and try again.';
  }
  
  if (isTimeoutError(error)) {
    return 'Request timed out. Please try again.';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return fallback;
};