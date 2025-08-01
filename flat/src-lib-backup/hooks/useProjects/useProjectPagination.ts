/**
 * Project pagination and infinite scroll management
 */

import { useState, useCallback, useRef } from 'react';
import type { Project } from '../../types/project';
import { useInfiniteScroll } from '../useInfiniteScroll';

// Constants for pagination
const PAGINATION_CONSTANTS = {
  ITEMS_PER_PAGE: 50,
  PREFETCH_THRESHOLD: 0.7,
  SIMULATED_TOTAL_COUNT: 500,
} as const;

export interface UseProjectPaginationProps {
  loadProjects: (page: number) => Promise<Project[]>;
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export const useProjectPagination = ({
  loadProjects,
  projects,
  setProjects
}: UseProjectPaginationProps) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Race condition prevention
  const loadingRef = useRef(false);

  // Load more projects for infinite scroll
  const loadMoreProjects = useCallback(async () => {
    if (loadingRef.current || !hasMore || isLoadingMore) {
      return;
    }

    loadingRef.current = true;
    setIsLoadingMore(true);

    try {
      const nextPage = page + 1;
      const newProjects = await loadProjects(nextPage);
      
      if (newProjects.length === 0) {
        setHasMore(false);
      } else {
        setProjects(prev => [...prev, ...newProjects]);
        setPage(nextPage);
        
        // Update total count and check if we have more
        const newTotalLoaded = projects.length + newProjects.length;
        setTotalCount(newTotalLoaded);
        
        if (newTotalLoaded >= PAGINATION_CONSTANTS.SIMULATED_TOTAL_COUNT) {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Error loading more projects:', error);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [loadProjects, page, hasMore, isLoadingMore, projects.length, setProjects]);

  // Reset pagination state
  const resetPagination = useCallback(() => {
    setPage(1);
    setHasMore(true);
    setTotalCount(0);
    setIsLoadingMore(false);
    loadingRef.current = false;
  }, []);

  // Initialize with first page
  const initializePagination = useCallback(async () => {
    resetPagination();
    
    try {
      const initialProjects = await loadProjects(1);
      setProjects(initialProjects);
      setTotalCount(initialProjects.length);
      
      if (initialProjects.length < PAGINATION_CONSTANTS.ITEMS_PER_PAGE) {
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error initializing pagination:', error);
    }
  }, [loadProjects, setProjects, resetPagination]);

  // Infinite scroll hook
  const { observerRef } = useInfiniteScroll({
    hasMore,
    isLoading: isLoadingMore,
    onLoadMore: loadMoreProjects,
    threshold: 200
  });

  // Get pagination stats
  const getPaginationStats = useCallback(() => {
    return {
      currentPage: page,
      totalPages: Math.ceil(PAGINATION_CONSTANTS.SIMULATED_TOTAL_COUNT / PAGINATION_CONSTANTS.ITEMS_PER_PAGE),
      itemsPerPage: PAGINATION_CONSTANTS.ITEMS_PER_PAGE,
      totalCount: PAGINATION_CONSTANTS.SIMULATED_TOTAL_COUNT,
      loadedCount: projects.length,
      hasMore,
      isLoadingMore,
      loadingProgress: (projects.length / PAGINATION_CONSTANTS.SIMULATED_TOTAL_COUNT) * 100
    };
  }, [page, projects.length, hasMore, isLoadingMore]);

  // Jump to specific page (for traditional pagination)
  const jumpToPage = useCallback(async (targetPage: number) => {
    if (targetPage < 1 || loadingRef.current) return;
    
    loadingRef.current = true;
    setIsLoadingMore(true);
    
    try {
      // Calculate which projects we need to load
      const startIndex = (targetPage - 1) * PAGINATION_CONSTANTS.ITEMS_PER_PAGE;
      const endIndex = startIndex + PAGINATION_CONSTANTS.ITEMS_PER_PAGE;
      
      // If we're jumping ahead, we need to load all pages up to target
      if (targetPage > page) {
        const pagesToLoad = [];
        for (let p = page + 1; p <= targetPage; p++) {
          pagesToLoad.push(p);
        }
        
        const allNewProjects: Project[] = [];
        for (const p of pagesToLoad) {
          const pageProjects = await loadProjects(p);
          allNewProjects.push(...pageProjects);
        }
        
        setProjects(prev => [...prev, ...allNewProjects]);
        setPage(targetPage);
        setTotalCount(projects.length + allNewProjects.length);
      }
      
      // For jumping backwards, we already have the data
      if (targetPage <= page) {
        setPage(targetPage);
      }
    } catch (error) {
      console.error('Error jumping to page:', error);
    } finally {
      loadingRef.current = false;
      setIsLoadingMore(false);
    }
  }, [loadProjects, page, projects.length, setProjects]);

  // Refresh current view
  const refreshCurrentView = useCallback(async () => {
    const currentProjects = projects.slice(0, page * PAGINATION_CONSTANTS.ITEMS_PER_PAGE);
    const refreshedProjects: Project[] = [];
    
    for (let p = 1; p <= page; p++) {
      const pageProjects = await loadProjects(p);
      refreshedProjects.push(...pageProjects);
    }
    
    setProjects(refreshedProjects);
    setTotalCount(refreshedProjects.length);
  }, [loadProjects, page, projects.length, setProjects]);

  return {
    // State
    page,
    hasMore,
    totalCount,
    isLoadingMore,
    
    // Actions
    loadMoreProjects,
    resetPagination,
    initializePagination,
    jumpToPage,
    refreshCurrentView,
    
    // Utils
    getPaginationStats,
    observerRef,
    
    // Constants
    itemsPerPage: PAGINATION_CONSTANTS.ITEMS_PER_PAGE
  };
};