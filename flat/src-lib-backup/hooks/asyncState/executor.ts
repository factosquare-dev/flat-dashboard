import { MutableRefObject } from 'react';
import type { AsyncState } from './types';
import { getErrorMessage, isAbortError } from './utils';

interface AsyncExecutorOptions<T> {
  setState: React.Dispatch<React.SetStateAction<AsyncState<T>>>;
  abortControllerRef: MutableRefObject<AbortController | null>;
  requestIdRef: MutableRefObject<number>;
}

/**
 * 비동기 실행 로직을 처리하는 함수들을 생성
 */
export const createAsyncExecutor = <T>({
  setState,
  abortControllerRef,
  requestIdRef,
}: AsyncExecutorOptions<T>) => {
  // 즉시 실행 함수
  const executeImmediate = async (asyncFn: () => Promise<T>): Promise<T> => {
    const currentRequestId = ++requestIdRef.current;
    
    // 이전 요청 취소
    if (abortControllerRef.current) {
      try {
        abortControllerRef.current.abort();
      } catch (error) {
        // AbortController가 이미 abort된 경우 무시
      }
    }
    
    // 새 AbortController 생성
    abortControllerRef.current = new AbortController();
    
    // 로딩 상태 설정
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
    }));
    
    try {
      const result = await asyncFn();
      
      // 현재 요청이 최신 요청인지 확인
      if (requestIdRef.current !== currentRequestId) {
        throw new Error('Request was superseded');
      }
      
      setState(prev => ({
        ...prev,
        data: result,
        loading: false,
        error: null,
        success: true,
        lastFetch: new Date(),
      }));
      
      return result;
    } catch (error) {
      // 요청이 취소된 경우
      if (isAbortError(error)) {
        throw error;
      }
      
      // 다른 요청에 의해 대체된 경우
      if (requestIdRef.current !== currentRequestId) {
        throw error;
      }
      
      const errorMessage = getErrorMessage(error);
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorMessage,
        success: false,
        lastFetch: new Date(),
      }));
      
      throw error;
    }
  };
  
  // 디바운스 처리를 포함한 실행 함수
  const executeDebouncedInternal = async (
    asyncFn: () => Promise<T>,
    debounceMs: number,
    debounceTimerRef: MutableRefObject<NodeJS.Timeout | null>
  ): Promise<T> => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(async () => {
        // 타임아웃이 여전히 유효한지 확인
        if (debounceTimerRef.current !== timeoutId) {
          reject(new Error('Debounced call was cancelled'));
          return;
        }
        
        try {
          const result = await executeImmediate(asyncFn);
          resolve(result);
        } catch (error) {
          reject(error);
        } finally {
          if (debounceTimerRef.current === timeoutId) {
            debounceTimerRef.current = null;
          }
        }
      }, debounceMs);
      
      debounceTimerRef.current = timeoutId;
    });
  };
  
  return { executeImmediate, executeDebouncedInternal };
};