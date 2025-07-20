import { useState, useEffect } from 'react';
import type { Participant } from '../../../types/schedule';

interface UseProjectDragSelectionProps {
  projects: Participant[];
  selectedProjects: string[];
  onProjectSelect: (projectId: string, checked: boolean) => void;
}

export const useProjectDragSelection = ({
  projects,
  selectedProjects,
  onProjectSelect
}: UseProjectDragSelectionProps) => {
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragEndIndex, setDragEndIndex] = useState<number | null>(null);
  const [dragAction, setDragAction] = useState<'select' | 'deselect' | null>(null);
  
  const handleProjectMouseDown = (index: number) => {
    setIsDragSelecting(true);
    setDragStartIndex(index);
    setDragEndIndex(index);
    const projectId = projects[index].id;
    const isSelected = selectedProjects.includes(projectId);
    setDragAction(isSelected ? 'deselect' : 'select');
    onProjectSelect(projectId, !isSelected);
  };
  
  const handleProjectMouseEnter = (index: number) => {
    if (isDragSelecting && dragStartIndex !== null && dragAction) {
      setDragEndIndex(index);
      const start = Math.min(dragStartIndex, index);
      const end = Math.max(dragStartIndex, index);
      for (let i = start; i <= end; i++) {
        const projectId = projects[i].id;
        const isSelected = selectedProjects.includes(projectId);
        if (dragAction === 'select' && !isSelected) {
          onProjectSelect(projectId, true);
        } else if (dragAction === 'deselect' && isSelected) {
          onProjectSelect(projectId, false);
        }
      }
    }
  };
  
  const handleMouseUp = () => {
    setIsDragSelecting(false);
    setDragStartIndex(null);
    setDragEndIndex(null);
    setDragAction(null);
  };
  
  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  return {
    isDragSelecting,
    dragStartIndex,
    dragEndIndex,
    handleProjectMouseDown,
    handleProjectMouseEnter
  };
};