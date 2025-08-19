import { useState, useCallback, useRef } from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
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
    // Just pass the project to the edit handler, it will fetch fresh data
    const project = allProjects.find(p => p.id === projectId);
    if (project) {
      onEdit(project);
      setShowOptionsMenu(null);
    } else {
      console.error('[handleEditProject] Project not found:', projectId);
    }
  }, [allProjects, onEdit]);

  const handleDeleteProject = useCallback((projectId: ProjectId) => {
    onDelete(projectId);
    setShowOptionsMenu(null);
  }, [onDelete]);

  const handleDuplicateProject = useCallback((projectId: ProjectId) => {
    // Just pass the project to the duplicate handler, it will fetch fresh data
    const project = allProjects.find(p => p.id === projectId);
    if (project) {
      onDuplicate(project);
      setShowOptionsMenu(null);
    } else {
      console.error('[handleDuplicateProject] Project not found:', projectId);
    }
  }, [allProjects, onDuplicate]);

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
    
    // Dropped on empty space or independent SUB - make independent
    makeIndependent(projectId);
  }, [draggedProjectId, allProjects, makeIndependent]);

  const handleContainerDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    // Get dragged project ID
    const projectId = draggedProjectId || e.dataTransfer.getData('projectId');
    if (!projectId) return;
    
    // Find dragged project
    const draggedProject = allProjects.find(p => p.id === projectId);
    if (!draggedProject) return;
    
    // Only show drop zone for SUB projects that have a parent
    if (isProjectType(draggedProject.type, ProjectType.SUB) && draggedProject.parentId) {
      e.dataTransfer.dropEffect = 'move';
      
      // Check if we're over a project row
      const target = e.target as HTMLElement;
      const projectRow = target.closest('tr[role="row"]');
      
      if (!projectRow) {
        // Only show indicator when NOT over a project row
        setIsDraggingOver(true);
      } else {
        // Hide indicator when over a project row
        setIsDraggingOver(false);
      }
    }
  }, [draggedProjectId, allProjects]);

  const handleContainerDragLeave = useCallback((e: React.DragEvent) => {
    // Check if we're still within the container
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (containerRef.current && containerRef.current.contains(relatedTarget)) {
      // Still within container, check if over a project row
      const projectRow = relatedTarget.closest('tr[role="row"]');
      if (projectRow) {
        // Over a project row, hide the indicator
        setIsDraggingOver(false);
      }
      return;
    }
    // Left the container entirely
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