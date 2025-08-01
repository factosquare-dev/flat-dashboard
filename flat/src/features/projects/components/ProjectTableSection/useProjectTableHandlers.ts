import { useState, useCallback, useRef } from 'react';
import type { Project } from '../../../../types/project';
import type { ProjectId } from '../../../../types/branded';
import { ProjectTableService } from '@/services/projectTable.service';
import { useProjectHierarchy } from '@/hooks/useProjectHierarchy';
import { ProjectType } from '@/types/enums';
import { isProjectType } from '@/utils/projectTypeUtils';

interface UseProjectTableHandlersProps {
  projects: Project[];
  allProjects: Project[];
  selectedRows: string[];
  setSelectedRows: (rows: string[]) => void;
  onEdit: (project: Project) => void;
  onDelete: (projectId: ProjectId) => void;
  onDuplicate: (project: Project) => void;
  onSelectProject: (project: Project) => void;
}

export const useProjectTableHandlers = ({
  projects,
  allProjects,
  selectedRows,
  setSelectedRows,
  onEdit,
  onDelete,
  onDuplicate,
  onSelectProject
}: UseProjectTableHandlersProps) => {
  const [showOptionsMenu, setShowOptionsMenu] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { makeIndependent } = useProjectHierarchy();

  const handleSelectAllProjects = useCallback((checked: boolean) => {
    if (checked) {
      setSelectedRows(projects?.map(p => p.id) ?? []);
    } else {
      setSelectedRows([]);
    }
  }, [projects, setSelectedRows]);

  const handleSelectRow = useCallback((projectId: string, checked: boolean) => {
    const newSelection = ProjectTableService.handleRowSelection(
      projectId,
      checked,
      allProjects,
      selectedRows
    );
    setSelectedRows(newSelection);
  }, [allProjects, selectedRows, setSelectedRows]);

  const handleShowOptionsMenu = useCallback((
    projectId: string, 
    position: { top: number; left: number }, 
    event?: React.MouseEvent
  ) => {
    if (event) {
      event.stopPropagation();
    }
    if (showOptionsMenu === projectId) {
      setShowOptionsMenu(null);
      setDropdownPosition(null);
    } else {
      setDropdownPosition(position);
      setShowOptionsMenu(projectId);
    }
  }, [showOptionsMenu]);

  const handleEditProject = useCallback((projectId: ProjectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onEdit(project);
      setShowOptionsMenu(null);
    }
  }, [projects, onEdit]);

  const handleDeleteProject = useCallback((projectId: ProjectId) => {
    onDelete(projectId);
    setShowOptionsMenu(null);
  }, [onDelete]);

  const handleDuplicateProject = useCallback((projectId: ProjectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      onDuplicate(project);
      setShowOptionsMenu(null);
    }
  }, [projects, onDuplicate]);

  // Container drag and drop handlers
  const handleContainerDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    
    const projectId = draggedProjectId || e.dataTransfer.getData('projectId');
    if (!projectId) return;
    
    const draggedProject = allProjects.find(p => p.id === projectId);
    if (!draggedProject) return;
    
    // Only handle SUB projects
    if (!isProjectType(draggedProject.type, ProjectType.SUB)) return;
    
    // Already independent
    if (!draggedProject.parentId) return;
    
    // Check drop location
    const target = e.target as HTMLElement;
    const projectRow = target.closest('tr[role="row"]');
    
    if (projectRow) {
      const targetProjectId = projectRow.getAttribute('data-id');
      if (targetProjectId) {
        const targetProject = allProjects.find(p => p.id === targetProjectId);
        // Make independent if not dropped on MASTER
        if (targetProject && !isProjectType(targetProject.type, ProjectType.MASTER)) {
          makeIndependent(projectId);
        }
      }
    } else {
      // Dropped on empty space - make independent
      makeIndependent(projectId);
    }
  }, [draggedProjectId, allProjects, makeIndependent]);

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setIsDraggingOver(true);
  }, []);

  const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (containerRef.current && containerRef.current.contains(relatedTarget)) {
      return;
    }
    setIsDraggingOver(false);
  }, []);

  return {
    showOptionsMenu,
    dropdownPosition,
    handleSelectAllProjects,
    handleSelectRow,
    handleShowOptionsMenu,
    handleEditProject,
    handleDeleteProject,
    handleDuplicateProject,
    setShowOptionsMenu,
    setDropdownPosition,
    // Drag and drop
    isDraggingOver,
    draggedProjectId,
    containerRef,
    handleContainerDrop,
    handleContainerDragOver,
    handleContainerDragLeave,
    setDraggedProjectId
  };
};