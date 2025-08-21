/**
 * Project selection management
 */

import { useState, useCallback, useMemo } from 'react';
import type { Project } from '@/shared/types/project';
import type { ProjectId } from '@/shared/types/branded';

export interface UseProjectSelectionProps {
  projects: Project[];
  onSelectionChange?: (selectedIds: ProjectId[]) => void;
}

export const useProjectSelection = ({ 
  projects, 
  onSelectionChange 
}: UseProjectSelectionProps) => {
  const [selectedRows, setSelectedRows] = useState<ProjectId[]>([]);

  // Memoized selection state
  const selectionState = useMemo(() => {
    const totalCount = projects.length;
    const selectedCount = selectedRows.length;
    const isAllSelected = totalCount > 0 && selectedCount === totalCount;
    const isPartiallySelected = selectedCount > 0 && selectedCount < totalCount;
    
    return {
      totalCount,
      selectedCount,
      isAllSelected,
      isPartiallySelected,
      hasSelection: selectedCount > 0
    };
  }, [projects.length, selectedRows.length]);

  // Get selected projects
  const selectedProjects = useMemo(() => {
    return projects.filter(project => selectedRows.includes(project.id));
  }, [projects, selectedRows]);

  // Toggle single project selection
  const toggleProjectSelection = useCallback((projectId: ProjectId) => {
    setSelectedRows(prev => {
      const newSelection = prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId];
      
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Toggle all projects selection
  const toggleAllProjects = useCallback(() => {
    setSelectedRows(prev => {
      const newSelection = prev.length === projects.length 
        ? [] 
        : projects.map(project => project.id);
      
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [projects, onSelectionChange]);

  // Select multiple projects
  const selectProjects = useCallback((projectIds: ProjectId[]) => {
    setSelectedRows(prev => {
      const uniqueIds = [...new Set([...prev, ...projectIds])];
      onSelectionChange?.(uniqueIds);
      return uniqueIds;
    });
  }, [onSelectionChange]);

  // Deselect multiple projects
  const deselectProjects = useCallback((projectIds: ProjectId[]) => {
    setSelectedRows(prev => {
      const newSelection = prev.filter(id => !projectIds.includes(id));
      onSelectionChange?.(newSelection);
      return newSelection;
    });
  }, [onSelectionChange]);

  // Clear all selections
  const clearSelection = useCallback(() => {
    setSelectedRows([]);
    onSelectionChange?.([]);
  }, [onSelectionChange]);

  // Select range of projects (for shift+click)
  const selectRange = useCallback((startId: ProjectId, endId: ProjectId) => {
    const startIndex = projects.findIndex(p => p.id === startId);
    const endIndex = projects.findIndex(p => p.id === endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const [start, end] = startIndex < endIndex 
      ? [startIndex, endIndex] 
      : [endIndex, startIndex];
    
    const rangeIds = projects.slice(start, end + 1).map(p => p.id);
    selectProjects(rangeIds);
  }, [projects, selectProjects]);

  // Check if project is selected
  const isProjectSelected = useCallback((projectId: ProjectId) => {
    return selectedRows.includes(projectId);
  }, [selectedRows]);

  // Get selection statistics
  const getSelectionStats = useCallback(() => {
    const selected = selectedProjects;
    const statusCounts = selected.reduce((acc, project) => {
      acc[project.status] = (acc[project.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const priorityCounts = selected.reduce((acc, project) => {
      acc[project.priority] = (acc[project.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return {
      total: selected.length,
      statusCounts,
      priorityCounts,
      averageProgress: selected.length > 0 
        ? selected.reduce((sum, p) => sum + p.progress, 0) / selected.length 
        : 0
    };
  }, [selectedProjects]);

  // Bulk operations for selected projects
  const bulkOperations = useMemo(() => {
    return {
      updateStatus: (status: string, onUpdate: (ids: ProjectId[], updates: any) => void) => {
        onUpdate(selectedRows, { status });
      },
      updatePriority: (priority: string, onUpdate: (ids: ProjectId[], updates: any) => void) => {
        onUpdate(selectedRows, { priority });
      },
      delete: (onDelete: (ids: ProjectId[]) => void) => {
        selectedRows.forEach(id => onDelete([id]));
        clearSelection();
      }
    };
  }, [selectedRows, clearSelection]);

  return {
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
  };
};