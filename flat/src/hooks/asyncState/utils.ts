/**
 * Async State 유틸리티 함수들
 */

/**
 * 에러를 문자열로 변환
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'An unknown error occurred';
};

/**
 * 요청이 취소되었는지 확인
 */
export const isAbortError = (error: unknown): boolean => {
  return error instanceof Error && error.name === 'AbortError';
};

/**
 * 초기 상태 생성
 */
export const createInitialState = <T>(initialData: T | null = null) => ({
  data: initialData,
  loading: false,
  error: null,
  success: false,
  lastFetch: null,
});