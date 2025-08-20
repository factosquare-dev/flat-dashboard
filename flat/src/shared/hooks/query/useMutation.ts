import { useCallback, useRef } from 'react';
import { useAsyncState } from '@/useAsyncState';
import type { MutationOptions, MutationResult } from './types';
import { executeWithRetry } from './retryLogic';

export const useMutation = <T = any, P = any>(
  mutationFn: (variables: P) => Promise<T>,
  options: MutationOptions<T, P> = {}
): MutationResult<T, P> => {
  const {
    onSuccess,
    onError,
    onSettled,
    retry = 0,
    retryDelay = 1000,
    ...asyncOptions
  } = options;

  const [state, actions] = useAsyncState<T>(asyncOptions);
  const variablesRef = useRef<P | undefined>(undefined);

  const executeMutation = useCallback(async (variables: P): Promise<T> => {
    variablesRef.current = variables;

    try {
      const result = await executeWithRetry(
        () => mutationFn(variables),
        { 
          retry, 
          retryDelay,
          onError: (error) => {
            if (onError) {
              onError(error, variables);
            }
          }
        },
        0
      );
      
      if (onSuccess) {
        onSuccess(result, variables);
      }
      
      return result;
    } finally {
      if (onSettled) {
        onSettled(
          state.data, 
          state.error ? new Error(state.error) : null, 
          variables
        );
      }
    }
  }, [mutationFn, retry, retryDelay, onSuccess, onError, onSettled, state.data, state.error]);

  const mutate = useCallback(async (variables: P): Promise<T> => {
    return actions.execute(() => executeMutation(variables));
  }, [actions, executeMutation]);

  const mutateAsync = mutate;

  const reset = useCallback(() => {
    variablesRef.current = undefined;
    actions.reset();
  }, [actions]);

  return {
    ...state,
    mutate,
    mutateAsync,
    reset,
    isIdle: !state.loading && !state.error && !state.success,
    variables: variablesRef.current,
  };
};