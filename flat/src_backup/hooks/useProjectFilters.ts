import { useState, useMemo, useCallback } from 'react';
import type { Project, ProjectStatus, ServiceType } from '@/types/project';
import { ProjectStatusLabel, ProjectType, Priority } from '@/types/enums';

export const useProjectFilters = () => {
  const [statusFilters, setStatusFilters] = useState<ProjectStatus[]>(['PLANNING', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']);
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | 'all'>('all');
  const [sortField, setSortField] = useState<keyof Project | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchValue, setSearchValue] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string | null; end: string | null }>({ start: null, end: null });

  const handleSort = useCallback((field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  }, [sortField, sortDirection]);

  const filterProjects = useCallback((projects: Project[]) => {
    console.log('[filterProjects] Input projects:', projects.length);
    console.log('[filterProjects] Selected priority:', selectedPriority, typeof selectedPriority);
    console.log('[filterProjects] Status filters:', statusFilters);
    
    // Debug first project's priority
    if (projects.length > 0) {
      console.log('[filterProjects] First project priority:', projects[0].priority, typeof projects[0].priority);
      console.log('[filterProjects] Sample SUB priorities:', 
        projects.filter(p => p.type === 'SUB' || p.type === ProjectType.SUB)
          .slice(0, 3)
          .map(p => ({ name: p.name, priority: p.priority, type: typeof p.priority }))
      );
    }
    
    const filtered = projects.filter(project => {
      const matchesStatus = statusFilters.includes(project.status);
      
      // Priority filter - special handling for MASTER projects
      let matchesPriority = selectedPriority === 'all';
      if (!matchesPriority) {
        if (project.type === ProjectType.MASTER) {
          // For MASTER projects, check if any child SUB project matches the priority
          const childSubs = projects.filter(p => 
            p.type === ProjectType.SUB && p.parentId === project.id
          );
          // MASTER matches if it has any child that matches the priority filter
          matchesPriority = childSubs.some(sub => sub.priority === selectedPriority);
        } else {
          // For SUB and other projects, check directly
          matchesPriority = project.priority === selectedPriority;
        }
      }
      
      const matchesServiceType = selectedServiceType === 'all' || project.serviceType === selectedServiceType;
      const matchesSearch = searchValue === '' || 
        project.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        (project.client && project.client.toLowerCase().includes(searchValue.toLowerCase())) ||
        (project.customer && project.customer.name.toLowerCase().includes(searchValue.toLowerCase())) ||
        (project.manager && project.manager.toLowerCase().includes(searchValue.toLowerCase())) ||
        (typeof project.manufacturer === 'string' && project.manufacturer.toLowerCase().includes(searchValue.toLowerCase())) ||
        (typeof project.container === 'string' && project.container.toLowerCase().includes(searchValue.toLowerCase())) ||
        (typeof project.packaging === 'string' && project.packaging.toLowerCase().includes(searchValue.toLowerCase()));
      
      // 날짜 필터링 로직
      let matchesDateRange = true;
      if (dateRange.start || dateRange.end) {
        const filterStart = dateRange.start ? new Date(dateRange.start) : null;
        const filterEnd = dateRange.end ? new Date(dateRange.end) : null;
        
        if (project.startDate || project.endDate) {
          const projectStart = project.startDate ? new Date(project.startDate) : null;
          const projectEnd = project.endDate ? new Date(project.endDate) : null;
          
          // 프로젝트 기간이 필터 기간과 겹치는지 확인
          matchesDateRange = false;
          
          if (filterStart && filterEnd && projectStart && projectEnd) {
            // 프로젝트가 필터 기간과 하루라도 겹치는 경우
            matchesDateRange = projectStart <= filterEnd && projectEnd >= filterStart;
          } else if (filterStart && !filterEnd) {
            // 시작일만 설정된 경우
            matchesDateRange = projectEnd ? projectEnd >= filterStart : true;
          } else if (!filterStart && filterEnd) {
            // 종료일만 설정된 경우
            matchesDateRange = projectStart ? projectStart <= filterEnd : true;
          }
        }
      }
      
      const result = matchesStatus && matchesPriority && matchesServiceType && matchesSearch && matchesDateRange;
      
      if (!result && project.type === 'MASTER') {
        console.log('[filterProjects] MASTER filtered out:', {
          name: project.name,
          matchesStatus,
          matchesPriority,
          matchesServiceType,
          matchesSearch,
          matchesDateRange
        });
      }
      
      return result;
    });
    
    console.log('[filterProjects] Output filtered:', filtered.length);
    return filtered;
  }, [statusFilters, selectedPriority, selectedServiceType, searchValue, dateRange]);

  // Remove sorting from here as it's now handled in hierarchical structure
  const sortProjects = useCallback((projects: Project[]) => {
    // Sorting is now handled by sortHierarchicalProjects in ProjectTableSection
    // to maintain parent-child relationships properly
    return projects;
  }, []);

  const getFilteredAndSortedProjects = useMemo(() => {
    return (projects: Project[]) => {
      const filtered = filterProjects(projects);
      return sortProjects(filtered);
    };
  }, [filterProjects, sortProjects]);

  const handleStatusFilterToggle = useCallback((status: ProjectStatus) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  }, []);

  return {
    statusFilters,
    setStatusFilters,
    selectedPriority,
    setSelectedPriority,
    selectedServiceType,
    setSelectedServiceType,
    sortField,
    sortDirection,
    searchValue,
    setSearchValue,
    dateRange,
    setDateRange,
    handleSort,
    getFilteredAndSortedProjects,
    handleStatusFilterToggle
  };
};