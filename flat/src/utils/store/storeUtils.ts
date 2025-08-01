import { StateCreator } from 'zustand';
import { produce } from 'immer';

/**
 * Utility functions for Zustand store management
 */

// Type for slice configuration
export type SliceCreator<
  TState extends object,
  TActions extends object = {}
> = StateCreator<
  TState & TActions,
  [],
  [],
  TState & TActions
>;

/**
 * Create an immer-based state updater
 */
export const createImmerUpdater = <T extends object>(
  set: (fn: (state: T) => void) => void
) => {
  return (updater: (draft: T) => void) => {
    set((state) => produce(state, updater));
  };
};

/**
 * Create async action with loading and error handling
 */
export const createAsyncAction = <TState extends { isLoading?: boolean; error?: string | null }>(
  set: (fn: (state: TState) => void) => void,
  action: () => Promise<void>
) => {
  return async () => {
    set((state) => {
      state.isLoading = true;
      state.error = null;
    });
    
    try {
      await action();
    } catch (error) {
      set((state) => {
        state.error = error instanceof Error ? error.message : 'An error occurred';
      });
    } finally {
      set((state) => {
        state.isLoading = false;
      });
    }
  };
};

/**
 * Batch multiple state updates
 */
export const batchUpdates = <T extends object>(
  set: (fn: (state: T) => void) => void,
  updates: Array<(state: T) => void>
) => {
  set((state) => {
    updates.forEach(update => update(state));
  });
};

/**
 * Create a reset function for a slice
 */
export const createReset = <T extends object>(
  initialState: T,
  set: (state: T) => void
) => {
  return () => set(initialState);
};

/**
 * Create computed/derived state
 */
export const createComputed = <TState, TComputed>(
  selector: (state: TState) => TComputed,
  memoize = true
): ((state: TState) => TComputed) => {
  if (!memoize) return selector;
  
  let lastState: TState;
  let lastResult: TComputed;
  let initialized = false;
  
  return (state: TState) => {
    if (!initialized || state !== lastState) {
      lastState = state;
      lastResult = selector(state);
      initialized = true;
    }
    return lastResult;
  };
};

/**
 * Create a debounced action
 */
export const createDebouncedAction = <T extends (...args: unknown[]) => unknown>(
  action: T,
  delay: number
): T & { cancel: () => void } => {
  let timeoutId: NodeJS.Timeout | null = null;
  
  const debounced = ((...args: Parameters<T>) => {
    if (timeoutId) clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      action(...args);
      timeoutId = null;
    }, delay);
  }) as T;
  
  const debouncedWithCancel = debounced as T & { cancel: () => void };
  debouncedWithCancel.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };
  
  return debouncedWithCancel;
};

/**
 * Persist middleware helper
 */
export const createPersistConfig = <T extends Record<string, unknown>>(
  name: string, 
  include?: string[], 
  exclude?: string[]
) => {
  return {
    name,
    partialize: include
      ? (state: T) => {
          const result: Partial<T> = {};
          include.forEach(key => {
            if (key in state) result[key as keyof T] = state[key as keyof T];
          });
          return result;
        }
      : exclude
      ? (state: T) => {
          const result = { ...state };
          exclude.forEach(key => delete result[key as keyof T]);
          return result;
        }
      : undefined,
  };
};

/**
 * Logger middleware for development
 */
export const createLogger = <T extends object>(storeName: string) => {
  return (config: StateCreator<T>) => (
    set: StateCreator<T>['setState'], 
    get: StateCreator<T>['getState'], 
    api: StateCreator<T>['api']
  ) => {
    return config(
      (...args: Parameters<typeof set>) => {
        if (process.env.NODE_ENV === 'development') {
          console.log(`[${storeName}] State update:`, args);
        }
        set(...args);
      },
      get,
      api
    );
  };
};