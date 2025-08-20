import { useState, useEffect } from 'react';

const STORAGE_KEY = 'projectTableHeaderVisibility';

export const useHeaderVisibility = () => {
  const [isHeaderVisible, setIsHeaderVisible] = useState<boolean>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? true : saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isHeaderVisible));
  }, [isHeaderVisible]);

  const toggleHeaderVisibility = () => {
    setIsHeaderVisible(prev => !prev);
  };

  return {
    isHeaderVisible,
    toggleHeaderVisibility
  };
};