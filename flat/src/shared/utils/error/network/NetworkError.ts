/**
 * Network and API error classes
 */

import { AppError } from '../base/AppError';
import { ERROR_CODES } from '../base/constants';

export class NetworkError extends AppError {
  constructor(message: string = 'Network request failed') {
    super(
      message,
      ERROR_CODES.NETWORK_ERROR,
      0
    );
  }
}

export class TimeoutError extends AppError {
  constructor(message: string = 'Request timeout') {
    super(
      message,
      ERROR_CODES.TIMEOUT_ERROR,
      408
    );
  }
}

/**
 * API Response type
 */
export interface ApiErrorResponse {
  message?: string;
  error?: string;
  statusCode?: number;
  [key: string]: unknown;
}

export class ApiError extends AppError {
  constructor(message: string, statusCode: number, response?: ApiErrorResponse) {
    super(
      message,
      ERROR_CODES.API_ERROR,
      statusCode,
      { response }
    );
  }
}

/**
 * Network error type guards
 */
export const isNetworkError = (error: unknown): boolean => {
  return error instanceof NetworkError || 
    (error instanceof Error && error.message.includes('network'));
};

export const isTimeoutError = (error: unknown): boolean => {
  return error instanceof TimeoutError ||
    (error instanceof Error && error.message.includes('timeout'));
};