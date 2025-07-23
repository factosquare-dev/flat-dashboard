/**
 * useProjects - Refactored main hook
 * Now uses focused sub-hooks for better maintainability
 */

import { useEffect, useState } from 'react';
import type { Project } from '../../types/project';
import { hierarchicalProjects, flattenProjects, toggleProject } from '../../data/hierarchicalProjects';
import { useProjectData } from './useProjectData';
import { useProjectSelection } from './useProjectSelection';
import { useProjectPagination } from './useProjectPagination';

export const useProjects = () => {
  // Hierarchical data state (temporary until API is ready)
  const [hierarchicalData, setHierarchicalData] = useState<Project[]>(hierarchicalProjects);
  const [useHierarchicalMode, setUseHierarchicalMode] = useState(false);

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
    projects: useHierarchicalMode ? flattenProjects(hierarchicalData) : projects,
    onSelectionChange: (selectedIds) => {
      // Handle selection change if needed
      console.log('Selection changed:', selectedIds);
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
    projects: useHierarchicalMode ? flattenProjects(hierarchicalData) : projects,
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
  const enhancedUpdateProject = (projectId: string, field: keyof Project, value: any) => {
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

  const enhancedDeleteProjects = (projectIds: string[]) => {
    if (useHierarchicalMode) {
      setHierarchicalData(prev => 
        prev.filter(project => {
          // Remove if it's a top-level project being deleted
          if (projectIds.includes(project.id)) {
            return false;
          }
          // Filter children if any are being deleted
          if (project.children) {
            project.children = project.children.filter(child => !projectIds.includes(child.id));
          }
          return true;
        })
      );
    } else {
      projectIds.forEach(id => deleteProject(id));
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