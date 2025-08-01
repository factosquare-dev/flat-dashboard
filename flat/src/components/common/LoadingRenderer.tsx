/**
 * Global loading renderer using Zustand store
 * Renders fullscreen loading overlay when loading is active
 */

import React from 'react';
import { useLoadingStore } from '@/stores/loadingStore';
import { LoadingFullScreen } from '../loading/LoadingSpinner';

export const LoadingRenderer: React.FC = () => {
  const isLoading = useLoadingStore(state => state.isLoading);
  const loadingText = useLoadingStore(state => state.loadingText);
  
  if (!isLoading) {
    return null;
  }
  
  return (
    <LoadingFullScreen
      text={loadingText || '로딩 중...'}
    />
  );
};

export default LoadingRenderer;