/**
 * Error constants and mappings
 */

/**
 * Standard error codes
 */
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT_ERROR: 'TIMEOUT_ERROR',
  
  // HTTP errors
  BAD_REQUEST: 'BAD_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT: 'RATE_LIMIT',
  
  // Server errors
  SERVER_ERROR: 'SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  
  // Application errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
  
  // Domain specific
  FACTORY_NOT_FOUND: 'FACTORY_NOT_FOUND',
  INVALID_FACTORY_DATA: 'INVALID_FACTORY_DATA',
  PROJECT_NOT_FOUND: 'PROJECT_NOT_FOUND',
  INVALID_PROJECT_STATUS: 'INVALID_PROJECT_STATUS',
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  DATA_INTEGRITY_ERROR: 'DATA_INTEGRITY_ERROR',
  DUPLICATE_ERROR: 'DUPLICATE_ERROR',
  API_ERROR: 'API_ERROR',
} as const;

/**
 * Error messages
 */
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: '네트워크 연결에 실패했습니다.',
  [ERROR_CODES.TIMEOUT_ERROR]: '요청 시간이 초과되었습니다.',
  [ERROR_CODES.SERVER_ERROR]: '서버 오류가 발생했습니다.',
  [ERROR_CODES.SERVICE_UNAVAILABLE]: '서비스를 일시적으로 사용할 수 없습니다.',
  [ERROR_CODES.UNKNOWN_ERROR]: '알 수 없는 오류가 발생했습니다.',
  [ERROR_CODES.UNAUTHORIZED]: '인증이 필요합니다.',
  [ERROR_CODES.FORBIDDEN]: '접근 권한이 없습니다.',
  [ERROR_CODES.NOT_FOUND]: '요청한 리소스를 찾을 수 없습니다.',
  [ERROR_CODES.VALIDATION_ERROR]: '입력값이 올바르지 않습니다.',
} as const;

/**
 * Map HTTP status codes to error codes
 */
export function httpStatusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return ERROR_CODES.BAD_REQUEST;
    case 401:
      return ERROR_CODES.UNAUTHORIZED;
    case 403:
      return ERROR_CODES.FORBIDDEN;
    case 404:
      return ERROR_CODES.NOT_FOUND;
    case 409:
      return ERROR_CODES.CONFLICT;
    case 429:
      return ERROR_CODES.RATE_LIMIT;
    case 500:
      return ERROR_CODES.SERVER_ERROR;
    case 503:
      return ERROR_CODES.SERVICE_UNAVAILABLE;
    default:
      if (status >= 400 && status < 500) {
        return ERROR_CODES.BAD_REQUEST;
      }
      if (status >= 500) {
        return ERROR_CODES.SERVER_ERROR;
      }
      return ERROR_CODES.UNKNOWN_ERROR;
  }
}