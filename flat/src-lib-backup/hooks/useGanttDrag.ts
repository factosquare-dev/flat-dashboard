import { useState, useCallback, useEffect, useRef } from 'react';
import type { DragState, Task, Project, GridCell } from '../types/gantt';
import { GANTT_CONSTANTS, TOTAL_DAYS } from '../constants/gantt';
import { getDateIndex, getDuration, getDateFromIndex } from '../utils/ganttUtils';

interface UseGanttDragProps {
  projects: Project[];
  totalRows: number;
  updateTaskPosition: (taskId: string | number, newStartDate: string, newEndDate: string) => void;
}

export const useGanttDrag = ({ projects, totalRows, updateTaskPosition }: UseGanttDragProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTask: null,
    ghostPosition: null,
    hoveredCell: null,
    mouseOffset: { x: 0, y: 0 }
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Get grid cell from mouse position
  const getGridCellFromMouse = useCallback((e: MouseEvent): GridCell | null => {
    if (!gridRef.current || !timelineRef.current) return null;
    
    const gridRect = gridRef.current.getBoundingClientRect();
    const scrollLeft = timelineRef.current.scrollLeft;
    const scrollTop = timelineRef.current.scrollTop;
    
    const x = e.clientX - gridRect.left + scrollLeft;
    const y = e.clientY - gridRect.top + scrollTop;
    
    const col = Math.floor(x / GANTT_CONSTANTS.CELL_WIDTH);
    const row = Math.floor(y / GANTT_CONSTANTS.CELL_HEIGHT);
    
    // Validate bounds
    if (col < 0 || col >= TOTAL_DAYS || row < 0 || row >= totalRows) {
      return null;
    }
    
    // Check if row is a valid task row (not project header)
    let currentRow = 0;
    for (const project of projects) {
      if (currentRow === row) {
        return null; // Project header row
      }
      currentRow++;
      if (project.expanded) {
        const taskIndex = row - currentRow;
        if (taskIndex >= 0 && taskIndex < project.tasks.length) {
          return { row, col };
        }
        currentRow += project.tasks.length;
      }
    }
    
    return null;
  }, [projects, totalRows]);

  // Drag handlers
  const handleMouseDown = useCallback((e: React.MouseEvent, task: Task, taskElement: HTMLDivElement) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = taskElement.getBoundingClientRect();
    const mouseOffset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    
    setDragState({
      isDragging: true,
      draggedTask: task,
      ghostPosition: { x: e.clientX - mouseOffset.x, y: e.clientY - mouseOffset.y },
      hoveredCell: null,
      mouseOffset
    });
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedTask) return;
    
    const ghostPosition = {
      x: e.clientX - dragState.mouseOffset.x,
      y: e.clientY - dragState.mouseOffset.y
    };
    
    const hoveredCell = getGridCellFromMouse(e);
    
    setDragState(prev => ({
      ...prev,
      ghostPosition,
      hoveredCell
    }));
  }, [dragState.isDragging, dragState.draggedTask, dragState.mouseOffset, getGridCellFromMouse]);

  const handleMouseUp = useCallback((e: MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedTask) return;
    
    const dropCell = getGridCellFromMouse(e);
    
    if (dropCell) {
      const { draggedTask } = dragState;
      const duration = getDuration(draggedTask.startDate, draggedTask.endDate);
      const newStartDate = getDateFromIndex(dropCell.col);
      const newEndDate = getDateFromIndex(dropCell.col + duration - 1);
      
      updateTaskPosition(draggedTask.id, newStartDate, newEndDate);
    }
    
    setDragState({
      isDragging: false,
      draggedTask: null,
      ghostPosition: null,
      hoveredCell: null,
      mouseOffset: { x: 0, y: 0 }
    });
  }, [dragState, getGridCellFromMouse, updateTaskPosition]);

  // Add global mouse event listeners for drag operations
  useEffect(() => {
    if (!dragState.isDragging) return;

    const handleGlobalMouseMove = (e: MouseEvent) => handleMouseMove(e);
    const handleGlobalMouseUp = (e: MouseEvent) => handleMouseUp(e);
    
    // Set cursor and prevent text selection during drag
    document.body.style.cursor = 'grabbing';
    document.body.style.userSelect = 'none';
    
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [dragState.isDragging, handleMouseMove, handleMouseUp]);

  return {
    dragState,
    gridRef,
    timelineRef,
    handleMouseDown
  };
};