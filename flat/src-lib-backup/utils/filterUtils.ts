/**
 * Common filtering and sorting utilities
 */

import type { Project, Priority, ServiceType, ProjectStatus } from '../types/project';

export interface FilterOptions {
  searchQuery?: string;
  priority?: Priority | 'all';
  serviceType?: ServiceType | 'all';
  statusFilters?: ProjectStatus[];
  dateRange?: {
    start: string | null;
    end: string | null;
  };
}

export interface SortOptions {
  field: keyof Project;
  direction: 'asc' | 'desc';
}

/**
 * Filter projects based on multiple criteria
 */
export function filterProjects(
  projects: Project[],
  options: FilterOptions
): Project[] {
  return projects.filter(project => {
    // Search filter
    if (options.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      const searchableFields = [
        project.client,
        project.manager,
        project.productType,
        project.manufacturer,
        project.container,
        project.packaging,
      ];
      
      if (!searchableFields.some(field => field?.toLowerCase().includes(query))) {
        return false;
      }
    }
    
    // Priority filter
    if (options.priority && options.priority !== 'all' && project.priority !== options.priority) {
      return false;
    }
    
    // Service type filter
    if (options.serviceType && options.serviceType !== 'all' && project.serviceType !== options.serviceType) {
      return false;
    }
    
    // Status filter
    if (options.statusFilters && options.statusFilters.length > 0 && !options.statusFilters.includes(project.status)) {
      return false;
    }
    
    // Date range filter
    if (options.dateRange?.start || options.dateRange?.end) {
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);
      
      if (options.dateRange.start) {
        const rangeStart = new Date(options.dateRange.start);
        if (projectEnd < rangeStart) return false;
      }
      
      if (options.dateRange.end) {
        const rangeEnd = new Date(options.dateRange.end);
        if (projectStart > rangeEnd) return false;
      }
    }
    
    return true;
  });
}

/**
 * Sort projects by a specific field
 */
export function sortProjects(
  projects: Project[],
  options: SortOptions
): Project[] {
  return [...projects].sort((a, b) => {
    const aValue = a[options.field];
    const bValue = b[options.field];
    
    if (aValue === null || aValue === undefined) return 1;
    if (bValue === null || bValue === undefined) return -1;
    
    let comparison = 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return options.direction === 'asc' ? comparison : -comparison;
  });
}

/**
 * Apply both filtering and sorting
 */
export function filterAndSortProjects(
  projects: Project[],
  filterOptions: FilterOptions,
  sortOptions?: SortOptions
): Project[] {
  let result = filterProjects(projects, filterOptions);
  
  if (sortOptions) {
    result = sortProjects(result, sortOptions);
  }
  
  return result;
}