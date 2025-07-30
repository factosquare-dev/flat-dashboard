/**
 * Common pagination hook
 * Provides pagination state and controls
 */

import { useState, useCallback, useMemo } from 'react';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

interface UsePaginationReturn {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  startIndex: number;
  endIndex: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setPageSize: (size: number) => void;
  setTotalItems: (total: number) => void;
  reset: () => void;
}

export function usePagination({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
}: UsePaginationOptions = {}): UsePaginationReturn {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSizeState] = useState(initialPageSize);
  const [total, setTotal] = useState(totalItems);

  const totalPages = useMemo(() => {
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  const startIndex = useMemo(() => {
    return (currentPage - 1) * pageSize;
  }, [currentPage, pageSize]);

  const endIndex = useMemo(() => {
    return Math.min(startIndex + pageSize - 1, total - 1);
  }, [startIndex, pageSize, total]);

  const hasNextPage = currentPage < totalPages;
  const hasPreviousPage = currentPage > 1;

  const setPage = useCallback((page: number) => {
    const validPage = Math.max(1, Math.min(page, totalPages || 1));
    setCurrentPage(validPage);
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (hasNextPage) {
      setCurrentPage(prev => prev + 1);
    }
  }, [hasNextPage]);

  const previousPage = useCallback(() => {
    if (hasPreviousPage) {
      setCurrentPage(prev => prev - 1);
    }
  }, [hasPreviousPage]);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    // Reset to first page when page size changes
    setCurrentPage(1);
  }, []);

  const setTotalItems = useCallback((total: number) => {
    setTotal(total);
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
    setPageSizeState(initialPageSize);
    setTotal(totalItems);
  }, [initialPage, initialPageSize, totalItems]);

  return {
    currentPage,
    pageSize,
    totalPages,
    totalItems: total,
    startIndex,
    endIndex,
    hasNextPage,
    hasPreviousPage,
    setPage,
    nextPage,
    previousPage,
    setPageSize,
    setTotalItems,
    reset,
  };
}