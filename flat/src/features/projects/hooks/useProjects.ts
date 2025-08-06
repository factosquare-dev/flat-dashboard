import { useState, useEffect, useCallback } from 'react';
import { projectService } from '../services';
import type { Project, ProjectFilter } from '../types';
import type { PaginationParams, SortParams } from '../../common/types';
import { useDebounce } from '@/hooks/common/useDebounce';
import { logger } from '@/utils/logger';

interface UseProjectsOptions {
  filters?: ProjectFilter;
  pagination?: PaginationParams;
  sort?: SortParams;
  enabled?: boolean;
}

interface UseProjectsReturn {
  projects: Project[];
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  updateFilters: (filters: ProjectFilter) => void;
  updatePagination: (pagination: PaginationParams) => void;
  updateSort: (sort: SortParams) => void;
}

export function useProjects(options: UseProjectsOptions = {}): UseProjectsReturn {
  const [projects, setProjects] = useState<Project[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const [filters, setFilters] = useState(options.filters ?? {});
  const [pagination, setPagination] = useState(options.pagination ?? { page: 1, limit: 20 });
  const [sort, setSort] = useState(options.sort ?? { field: 'createdAt', order: 'desc' });
  
  // Debounce search filter
  const debouncedFilters = useDebounce(filters, 300);

  const fetchProjects = useCallback(async () => {
    if (options.enabled === false) return;
    
    setLoading(true);
    setError(null);
    
    try {
      logger.info('Fetching projects', { filters: debouncedFilters, pagination, sort });
      
      const response = await projectService.getProjects(
        debouncedFilters,
        pagination,
        sort
      );
      
      if (response.success && response.data) {
        setProjects(response.data.projects);
        setTotal(response.data.total);
      } else {
        throw new Error(response.error?.message || 'Failed to fetch projects');
      }
    } catch (err) {
      const error = err as Error;
      logger.error('Failed to fetch projects', error);
      setError(error);
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [debouncedFilters, pagination, sort, options.enabled]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const updateFilters = useCallback((newFilters: ProjectFilter) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  const updatePagination = useCallback((newPagination: PaginationParams) => {
    setPagination(newPagination);
  }, []);

  const updateSort = useCallback((newSort: SortParams) => {
    setSort(newSort);
  }, []);

  return {
    projects,
    total,
    loading,
    error,
    refetch: fetchProjects,
    updateFilters,
    updatePagination,
    updateSort,
  };
}