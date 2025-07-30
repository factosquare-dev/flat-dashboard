import { useState, useMemo, useCallback } from 'react';
import type { Project, ProjectStatus, ServiceType, Priority } from '../types/project';

export const useProjectFilters = () => {
  const [statusFilters, setStatusFilters] = useState<ProjectStatus[]>(['시작전', '진행중', '완료', '중단']);
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
    return projects.filter(project => {
      const matchesStatus = statusFilters.includes(project.status);
      const matchesPriority = selectedPriority === 'all' || project.priority === selectedPriority;
      const matchesServiceType = selectedServiceType === 'all' || project.serviceType === selectedServiceType;
      const matchesSearch = searchValue === '' || 
        project.client.toLowerCase().includes(searchValue.toLowerCase()) ||
        project.manager.toLowerCase().includes(searchValue.toLowerCase()) ||
        project.manufacturer.toLowerCase().includes(searchValue.toLowerCase()) ||
        project.container.toLowerCase().includes(searchValue.toLowerCase()) ||
        project.packaging.toLowerCase().includes(searchValue.toLowerCase());
      
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
      
      return matchesStatus && matchesPriority && matchesServiceType && matchesSearch && matchesDateRange;
    });
  }, [statusFilters, selectedPriority, selectedServiceType, searchValue, dateRange]);

  const sortProjects = useCallback((projects: Project[]) => {
    if (!sortField) return projects;

    return [...projects].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      const aStr = String(aValue);
      const bStr = String(bValue);
      return sortDirection === 'asc' 
        ? aStr.localeCompare(bStr) 
        : bStr.localeCompare(aStr);
    });
  }, [sortField, sortDirection]);

  const getFilteredAndSortedProjects = useMemo(() => {
    return (projects: Project[]) => {
      const filtered = filterProjects(projects);
      return sortProjects(filtered);
    };
  }, [statusFilters, selectedPriority, selectedServiceType, searchValue, dateRange, sortField, sortDirection]);

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