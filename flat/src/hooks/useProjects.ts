/**
 * useProjects - Refactored main hook
 * Now uses focused sub-hooks for better maintainability
 */

import { useEffect, useState, useMemo } from 'react';
import type { Project } from '../../types/project';
import { getHierarchicalProjectsData, flattenProjects, toggleProject } from '../data/hierarchicalProjects';
import { useProjectData } from './useProjects/useProjectData';
import { useProjectSelection } from './useProjects/useProjectSelection';
import { useProjectPagination } from './useProjects/useProjectPagination';

export const useProjects = () => {
  // Hierarchical data state (temporary until API is ready)
  const [hierarchicalData, setHierarchicalData] = useState<Project[]>(() => getHierarchicalProjectsData());
  const [useHierarchicalMode, setUseHierarchicalMode] = useState(false);

  // Memoize flattened hierarchical data
  const flattenedHierarchicalData = useMemo(
    () => useHierarchicalMode ? flattenProjects(hierarchicalData) : [],
    [hierarchicalData, useHierarchicalMode]
  );

  // Data management hook
  const {
    projects,
    setProjects,
    schedules,
    isLoading: isDataLoading,
    loadProjects,
    updateProject,
    addProject,
    deleteProject,
    bulkUpdateProjects,
    refreshProjects,
    loadSchedule
  } = useProjectData({
    onProjectsUpdate: (updatedProjects) => {
      // Sync with hierarchical data if needed
      if (useHierarchicalMode) {
        // Update hierarchical structure logic here
      }
    }
  });

  // Selection management hook
  const {
    selectedRows,
    selectedProjects,
    selectionState,
    toggleProjectSelection,
    toggleAllProjects,
    selectProjects,
    deselectProjects,
    clearSelection,
    selectRange,
    isProjectSelected,
    getSelectionStats,
    bulkOperations
  } = useProjectSelection({
    projects: useHierarchicalMode ? flattenedHierarchicalData : projects,
    onSelectionChange: (selectedIds) => {
      // Handle selection change if needed
    }
  });

  // Pagination management hook
  const {
    page,
    hasMore,
    totalCount,
    isLoadingMore,
    loadMoreProjects,
    resetPagination,
    initializePagination,
    jumpToPage,
    refreshCurrentView,
    getPaginationStats,
    observerRef,
    itemsPerPage
  } = useProjectPagination({
    loadProjects,
    projects: useHierarchicalMode ? flattenedHierarchicalData : projects,
    setProjects: useHierarchicalMode ? 
      (newProjects) => {
        // Convert flat projects back to hierarchical if needed
        setHierarchicalData(typeof newProjects === 'function' ? newProjects(hierarchicalData) : newProjects);
      } : setProjects
  });

  // Initialize data on mount
  useEffect(() => {
    if (!useHierarchicalMode) {
      initializePagination();
    }
  }, [initializePagination, useHierarchicalMode]);

  // Hierarchical data methods
  const toggleProjectExpansion = (projectId: string) => {
    setHierarchicalData(prev => toggleProject(prev, projectId));
  };

  const switchToHierarchicalMode = () => {
    setUseHierarchicalMode(true);
    clearSelection();
  };

  const switchToFlatMode = () => {
    setUseHierarchicalMode(false);
    clearSelection();
    initializePagination();
  };

  // Enhanced update methods that work with both modes
  const enhancedUpdateProject = <K extends keyof Project>(projectId: string, field: K, value: Project[K]) => {
    if (useHierarchicalMode) {
      setHierarchicalData(prev => 
        prev.map(project => {
          if (project.id === projectId) {
            return { ...project, [field]: value };
          }
          if (project.children) {
            return {
              ...project,
              children: project.children.map(child =>
                child.id === projectId ? { ...child, [field]: value } : child
              )
            };
          }
          return project;
        })
      );
    } else {
      updateProject(projectId, field, value);
    }
  };

  const enhancedDeleteProjects = (projectIds: string | string[]) => {
    // Convert single ID to array for consistent handling
    const idsToDelete = Array.isArray(projectIds) ? projectIds : [projectIds];
    if (useHierarchicalMode) {
      setHierarchicalData(prev => 
        prev.reduce<Project[]>((acc, project) => {
          // Remove if it's a top-level project being deleted
          if (idsToDelete.includes(project.id)) {
            return acc;
          }
          // Filter children if any are being deleted
          if (project.children) {
            const filteredChildren = project.children.filter(child => !idsToDelete.includes(child.id));
            if (filteredChildren.length > 0 || !project.children.length) {
              acc.push({ ...project, children: filteredChildren });
            }
          } else {
            acc.push(project);
          }
          return acc;
        }, [])
      );
    } else {
      idsToDelete.forEach(id => deleteProject(id));
    }
    clearSelection();
  };

  // Get current projects based on mode
  const currentProjects = useHierarchicalMode ? 
    flattenProjects(hierarchicalData) : 
    projects;

  // Combined loading state
  const isLoading = isDataLoading || isLoadingMore;

  return {
    // Data
    projects: currentProjects,
    hierarchicalData,
    schedules,
    selectedRows,
    selectedProjects,
    
    // State
    isLoading,
    hasMore,
    totalCount,
    page,
    useHierarchicalMode,
    selectionState,
    
    // Project operations
    updateProject: enhancedUpdateProject,
    addProject,
    deleteProject: enhancedDeleteProjects,
    bulkUpdateProjects,
    refreshProjects,
    loadSchedule,
    
    // Selection operations
    toggleProjectSelection,
    toggleAllProjects,
    selectProjects,
    deselectProjects,
    clearSelection,
    selectRange,
    isProjectSelected,
    getSelectionStats,
    bulkOperations,
    
    // Pagination operations
    loadMoreProjects,
    resetPagination,
    jumpToPage,
    refreshCurrentView,
    getPaginationStats,
    observerRef,
    itemsPerPage,
    
    // Hierarchical operations
    toggleProjectExpansion,
    switchToHierarchicalMode,
    switchToFlatMode,
    
    // Utils
    stats: {
      total: currentProjects.length,
      selected: selectedRows.length,
      loading: isLoading,
      pagination: getPaginationStats(),
      selection: getSelectionStats()
    }
  };
};