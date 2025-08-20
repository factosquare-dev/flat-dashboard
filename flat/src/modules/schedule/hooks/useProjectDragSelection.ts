import { useState, useEffect } from 'react';
import type { Participant } from '@/shared/types/schedule';

interface UseProjectDragSelectionProps {
  projects: Participant[];
  selectedProjects: string[];
  onProjectSelect: (projectId: string, checked: boolean) => void;
  isDisabled?: boolean;
}

export const useProjectDragSelection = ({
  projects,
  selectedProjects,
  onProjectSelect,
  isDisabled = false
}: UseProjectDragSelectionProps) => {
  const [isDragSelecting, setIsDragSelecting] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragEndIndex, setDragEndIndex] = useState<number | null>(null);
  const [dragAction, setDragAction] = useState<'select' | 'deselect' | null>(null);
  const [isMouseDown, setIsMouseDown] = useState(false);
  
  const handleProjectMouseDown = (index: number) => {
    if (isDisabled) return;
    if (index < 0 || index >= projects.length) return;
    
    setIsMouseDown(true);
    setDragStartIndex(index);
    setDragEndIndex(index);
    const projectId = projects[index].id;
    const isSelected = selectedProjects.includes(projectId);
    setDragAction(isSelected ? 'deselect' : 'select');
    // 드래그 시작 시점에는 선택 상태를 변경하지 않음
  };
  
  const handleProjectMouseEnter = (index: number) => {
    if (isDisabled) return;
    
    if (isMouseDown && dragStartIndex !== null) {
      // 마우스가 눌린 상태에서 다른 항목으로 이동하면 드래그 시작
      if (!isDragSelecting && index !== dragStartIndex) {
        setIsDragSelecting(true);
        // 시작 지점의 항목도 선택/해제
        if (dragStartIndex >= 0 && dragStartIndex < projects.length) {
          const startProjectId = projects[dragStartIndex].id;
          onProjectSelect(startProjectId, dragAction === 'select');
        }
      }
      
      if (isDragSelecting && dragAction) {
        setDragEndIndex(index);
        const start = Math.min(dragStartIndex, index);
        const end = Math.max(dragStartIndex, index);
        for (let i = start; i <= end; i++) {
          if (i >= 0 && i < projects.length) {
            const projectId = projects[i].id;
            const isSelected = selectedProjects.includes(projectId);
            if (dragAction === 'select' && !isSelected) {
              onProjectSelect(projectId, true);
            } else if (dragAction === 'deselect' && isSelected) {
              onProjectSelect(projectId, false);
            }
          }
        }
      }
    }
  };
  
  const handleMouseUp = () => {
    if (isDisabled) {
      setIsDragSelecting(false);
      setIsMouseDown(false);
      setDragStartIndex(null);
      setDragEndIndex(null);
      setDragAction(null);
      return;
    }
    
    // 드래그하지 않고 클릭만 한 경우
    if (!isDragSelecting && dragStartIndex !== null && isMouseDown) {
      if (dragStartIndex >= 0 && dragStartIndex < projects.length) {
        const projectId = projects[dragStartIndex].id;
        const isSelected = selectedProjects.includes(projectId);
        onProjectSelect(projectId, !isSelected);
      }
    }
    
    setIsDragSelecting(false);
    setIsMouseDown(false);
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