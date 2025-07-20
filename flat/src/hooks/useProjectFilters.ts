import { useState } from 'react';
import type { Project, ProjectStatus, ServiceType, Priority } from '../types/project';

export const useProjectFilters = () => {
  const [statusFilters, setStatusFilters] = useState<ProjectStatus[]>(['시작전', '진행중', '완료']);
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | 'all'>('all');
  const [sortField, setSortField] = useState<keyof Project | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [searchValue, setSearchValue] = useState('');

  const handleSort = (field: keyof Project) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filterProjects = (projects: Project[]) => {
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
      return matchesStatus && matchesPriority && matchesServiceType && matchesSearch;
    });
  };

  const sortProjects = (projects: Project[]) => {
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
  };

  const getFilteredAndSortedProjects = (projects: Project[]) => {
    const filtered = filterProjects(projects);
    return sortProjects(filtered);
  };

  const handleStatusFilterToggle = (status: ProjectStatus) => {
    setStatusFilters(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

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
    handleSort,
    getFilteredAndSortedProjects,
    handleStatusFilterToggle
  };
};