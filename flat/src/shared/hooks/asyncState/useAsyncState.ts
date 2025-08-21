import { useState, useCallback, useRef, useEffect } from 'react';
import type { AsyncState, AsyncStateActions, UseAsyncStateOptions } from './types';
import { getErrorMessage, createInitialState } from './utils';
import { createAsyncExecutor } from './executor';

/**
 * 비동기 상태 관리를 위한 훅
 * 
 * @param options - 옵션
 * @returns [상태, 액션]
 */
export const useAsyncState = <T = any>(
  options: UseAsyncStateOptions = {}
): [AsyncState<T>, AsyncStateActions<T>] => {
  const { initialData = null, resetOnUnmount = true, debounceMs = 0 } = options;
  
  const [state, setState] = useState<AsyncState<T>>(
    createInitialState<T>(initialData)
  );
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const requestIdRef = useRef<number>(0);
  
  // 비동기 실행 함수 생성
  const { executeImmediate, executeDebouncedInternal } = createAsyncExecutor<T>({
    setState,
    abortControllerRef,
    requestIdRef,
  });
  
  // 디바운스 처리를 포함한 실행 함수
  const execute = useCallback(async (asyncFn: () => Promise<T>): Promise<T> => {
    // 기존 디바운스 타이머 클리어
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
    
    // 디바운싱이 활성화된 경우
    if (debounceMs > 0) {
      return executeDebouncedInternal(asyncFn, debounceMs, debounceTimerRef);
    }
    
    // 즉시 실행
    return executeImmediate(asyncFn);
  }, [debounceMs, executeImmediate, executeDebouncedInternal]);
  
  // 리셋 함수
  const reset = useCallback(() => {
    setState(createInitialState<T>(initialData));
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }
  }, [initialData]);
  
  // 개별 상태 설정 함수들
  const setData = useCallback((data: T | null) => {
    setState(prev => ({ ...prev, data }));
  }, []);
  
  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);
  
  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);
  
  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (resetOnUnmount) {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        
        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
      }
    };
  }, [resetOnUnmount]);
  
  const actions: AsyncStateActions<T> = {
    execute,
    reset,
    setData,
    setError,
    setLoading,
  };
  
  return [state, actions];
};