/**
 * Loading Store using Zustand
 * Global loading state management
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface LoadingState {
  isLoading: boolean;
  loadingText: string | null;
  loadingCount: number; // Support multiple concurrent loading states
  
  // Actions
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>, text?: string) => Promise<T>;
  forceHideLoading: () => void; // Emergency reset
}

export const useLoadingStore = create<LoadingState>()(
  devtools(
    (set, get) => ({
      isLoading: false,
      loadingText: null,
      loadingCount: 0,
      
      showLoading: (text?: string) => {
        set((state) => ({
          isLoading: true,
          loadingText: text || state.loadingText,
          loadingCount: state.loadingCount + 1,
        }));
      },
      
      hideLoading: () => {
        set((state) => {
          const newCount = Math.max(0, state.loadingCount - 1);
          return {
            loadingCount: newCount,
            isLoading: newCount > 0,
            loadingText: newCount > 0 ? state.loadingText : null,
          };
        });
      },
      
      withLoading: async <T,>(promise: Promise<T>, text?: string): Promise<T> => {
        const { showLoading, hideLoading } = get();
        try {
          showLoading(text);
          const result = await promise;
          return result;
        } finally {
          hideLoading();
        }
      },
      
      forceHideLoading: () => {
        set({
          isLoading: false,
          loadingText: null,
          loadingCount: 0,
        });
      },
    }),
    {
      name: 'loading-store',
    }
  )
);

// Convenience hooks
export const useLoading = () => {
  const { isLoading, loadingText, showLoading, hideLoading, withLoading } = useLoadingStore();
  return { isLoading, loadingText, showLoading, hideLoading, withLoading };
};

export const useLoadingActions = () => {
  const { showLoading, hideLoading, withLoading, forceHideLoading } = useLoadingStore();
  return { showLoading, hideLoading, withLoading, forceHideLoading };
};