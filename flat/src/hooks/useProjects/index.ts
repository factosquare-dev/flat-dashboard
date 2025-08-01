/**
 * useProjects - Refactored main hook
 * Now uses focused sub-hooks for better maintainability
 */

import { useEffect, useState } from 'react';
import type { Project } from '../../types/project';
import type { ProjectId } from '../../types/branded';
import { getHierarchicalProjectsData, flattenProjects, toggleProject } from '@/data/hierarchicalProjects';
import { useProjectData } from './useProjectData';
import { useProjectSelection } from './useProjectSelection';
import { useProjectPagination } from './useProjectPagination';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

export const useProjects = () => {
  // Hierarchical data state (temporary until API is ready)
  const [hierarchicalData, setHierarchicalData] = useState<Project[]>(() => getHierarchicalProjectsData());
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
  
  // Listen for hierarchy changes and refresh data
  useEffect(() => {
    const handleHierarchyChange = () => {
      // Refresh hierarchical data from MockDatabase
      setHierarchicalData(getHierarchicalProjectsData());
    };
    
    window.addEventListener('projectHierarchyChanged', handleHierarchyChange);
    return () => {
      window.removeEventListener('projectHierarchyChanged', handleHierarchyChange);
    };
  }, []);

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
  const enhancedUpdateProject = (projectId: ProjectId, field: keyof Project, value: any) => {
    // Update MockDatabase first
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    const project = database.projects.get(projectId);
    
    if (project) {
      // Update the project in MockDatabase
      const updatedProject = { ...project, [field]: value };
      database.projects.set(projectId, updatedProject);
      
      // Refresh data from MockDatabase
      if (useHierarchicalMode) {
        // Get fresh data from MockDatabase
        const freshData = getHierarchicalProjectsData();
        setHierarchicalData(freshData);
      } else {
        updateProject(projectId, field, value);
      }
      
      // Dispatch event to notify other components
      window.dispatchEvent(new Event('projectHierarchyChanged'));
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