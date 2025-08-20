import { useState } from 'react';
import { Project } from '@/shared/types/project';
import { ProjectType } from '@/shared/types/enums';
import { isProjectType } from '@/shared/utils/projectTypeUtils';
import { useProjectHierarchy } from '@/shared/hooks/useProjectHierarchy';
import type { DragHandlers } from '../types';

export const useDragHandlers = (
  projects: Project[],
  onDragStart?: (projectId: string) => void,
  onDragEnd?: () => void
): DragHandlers => {
  const [draggedProjectId, setDraggedProjectId] = useState<string | null>(null);
  const { moveToMaster, makeIndependent, canBeMoved, canAcceptChildren } = useProjectHierarchy();

  const handleProjectDragStart = (e: React.DragEvent, projectId: string) => {
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProjectId(projectId);
    onDragStart?.(projectId);

    // Add visual feedback
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '0.5';
  };

  const handleProjectDragEnd = (e: React.DragEvent) => {
    setDraggedProjectId(null);
    onDragEnd?.();
    
    // Remove visual feedback
    const element = e.currentTarget as HTMLElement;
    element.style.opacity = '1';
  };

  const handleProjectDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleProjectDragLeave = (e: React.DragEvent) => {
    // Optional: Add visual feedback when leaving
  };

  const handleProjectDrop = (e: React.DragEvent, targetProject?: Project) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedProjectId) return;

    // If no target project, make the dragged project independent
    if (!targetProject) {
      const draggedProject = projects.find(p => p.id === draggedProjectId);
      if (draggedProject && isProjectType(draggedProject, ProjectType.SUB)) {
        makeIndependent(draggedProjectId);
      }
      setDraggedProjectId(null);
      return;
    }

    const draggedProject = projects.find(p => p.id === draggedProjectId);
    if (!draggedProject) return;

    // Prevent dropping on itself
    if (targetProject.id === draggedProjectId) return;

    // Check if we can perform the move
    if (!canBeMoved(draggedProject)) {
      console.log('Cannot move this project');
      setDraggedProjectId(null);
      return;
    }

    // Check if target can accept children
    if (!canAcceptChildren(targetProject)) {
      console.log('Target cannot accept children');
      setDraggedProjectId(null);
      return;
    }

    // Perform the move
    moveToMaster(draggedProjectId, targetProject.id);
    setDraggedProjectId(null);
  };

  return {
    draggedProjectId,
    handleProjectDragStart,
    handleProjectDragEnd,
    handleProjectDragOver,
    handleProjectDragLeave,
    handleProjectDrop
  };
};