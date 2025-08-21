/**
 * Debounced search hook
 * Delays search execution to reduce API calls
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { debounce } from '@/shared/utils/common';

interface UseDebouncedSearchOptions {
  delay?: number;
  minLength?: number;
  onSearch?: (query: string) => void | Promise<void>;
}

interface UseDebouncedSearchReturn {
  searchValue: string;
  debouncedValue: string;
  isSearching: boolean;
  setSearchValue: (value: string) => void;
  clearSearch: () => void;
  forceSearch: () => void;
}

export function useDebouncedSearch({
  delay = 300,
  minLength = 0,
  onSearch,
}: UseDebouncedSearchOptions = {}): UseDebouncedSearchReturn {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  const debouncedSearchRef = useRef<Function>();

  // Create debounced function
  useEffect(() => {
    debouncedSearchRef.current = debounce(async (value: string) => {
      setDebouncedValue(value);
      
      if (value.length >= minLength && onSearch) {
        setIsSearching(true);
        try {
          await onSearch(value);
        } finally {
          setIsSearching(false);
        }
      }
    }, delay);
  }, [delay, minLength, onSearch]);

  // Handle search value change
  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    
    if (value.length < minLength) {
      setDebouncedValue('');
      setIsSearching(false);
      return;
    }
    
    debouncedSearchRef.current?.(value);
  }, [minLength]);

  // Clear search
  const clearSearch = useCallback(() => {
    setSearchValue('');
    setDebouncedValue('');
    setIsSearching(false);
  }, []);

  // Force immediate search
  const forceSearch = useCallback(() => {
    if (searchValue.length >= minLength && onSearch) {
      setDebouncedValue(searchValue);
      setIsSearching(true);
      onSearch(searchValue).finally(() => setIsSearching(false));
    }
  }, [searchValue, minLength, onSearch]);

  return {
    searchValue,
    debouncedValue,
    isSearching,
    setSearchValue: handleSearchChange,
    clearSearch,
    forceSearch,
  };
}