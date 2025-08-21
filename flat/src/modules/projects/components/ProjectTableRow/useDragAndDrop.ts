import React from 'react';
import { Project } from '@/shared/types/project';
import { ProjectId } from '@/shared/types/branded';
import { ProjectType } from '@/shared/types/enums';
import { isProjectType } from '@/shared/utils/projectTypeUtils';

interface UseDragAndDropProps {
  project: Project;
  onDragStart?: (e: React.DragEvent, projectId: ProjectId) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, project: Project) => void;
}

export const useDragAndDrop = ({
  project,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop
}: UseDragAndDropProps) => {
  const [isDragOver, setIsDragOver] = React.useState(false);
  
  const isMaster = isProjectType(project.type, ProjectType.MASTER);
  const isSub = isProjectType(project.type, ProjectType.SUB);
  
  const dragHandlers = {
    draggable: isSub,
    
    onDragStart: onDragStart && isSub ? (e: React.DragEvent) => {
      e.dataTransfer.effectAllowed = 'move';
      onDragStart(e, project.id);
    } : undefined,
    
    onDragEnd,
    
    onDragOver: isMaster ? (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setIsDragOver(true);
      if (onDragOver) onDragOver(e);
    } : undefined,
    
    onDragLeave: isMaster ? () => setIsDragOver(false) : undefined,
    
    onDrop: onDrop ? (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      onDrop(e, project);
    } : undefined
  };
  
  const mouseHandlers = {
    onMouseDown: isMaster ? (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    } : undefined,
    
    onMouseUp: isMaster ? (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
    } : undefined,
    
    onMouseMove: isMaster ? (e: React.MouseEvent) => {
      e.stopPropagation();
    } : undefined,
    
    onMouseLeave: isMaster ? (e: React.MouseEvent) => {
      e.stopPropagation();
    } : undefined
  };
  
  return {
    isDragOver,
    dragHandlers,
    mouseHandlers,
    isMaster,
    isSub
  };
};