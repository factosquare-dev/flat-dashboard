import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { LoadingFullScreen } from '../components/loading/LoadingSpinner';

interface LoadingContextValue {
  isLoading: boolean;
  loadingText: string | null;
  showLoading: (text?: string) => void;
  hideLoading: () => void;
  withLoading: <T>(promise: Promise<T>, text?: string) => Promise<T>;
}

const LoadingContext = createContext<LoadingContextValue | null>(null);

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within LoadingProvider');
  }
  return context;
};

interface LoadingProviderProps {
  children: React.ReactNode;
}

export const LoadingProvider: React.FC<LoadingProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState<string | null>(null);

  const showLoading = useCallback((text?: string) => {
    setIsLoading(true);
    setLoadingText(text || null);
  }, []);

  const hideLoading = useCallback(() => {
    setIsLoading(false);
    setLoadingText(null);
  }, []);

  const withLoading = useCallback(async <T,>(promise: Promise<T>, text?: string): Promise<T> => {
    try {
      showLoading(text);
      const result = await promise;
      return result;
    } finally {
      hideLoading();
    }
  }, [showLoading, hideLoading]);

  const value = useMemo(() => ({
    isLoading,
    loadingText,
    showLoading,
    hideLoading,
    withLoading,
  }), [isLoading, loadingText, showLoading, hideLoading, withLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {isLoading && (
        <LoadingFullScreen
          text={loadingText || '로딩 중...'}
        />
      )}
    </LoadingContext.Provider>
  );
};