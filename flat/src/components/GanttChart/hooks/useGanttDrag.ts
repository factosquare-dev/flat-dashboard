/**
 * GanttChart drag and drop logic hook
 */

import { useState, useCallback, useRef } from 'react';
import type { DragState, Task, Project } from '../types';
import { getRowFromY, getColFromX, getDateFromIndex } from '../utils/ganttCalculations';

interface UseGanttDragProps {
  projects: Project[];
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

export const useGanttDrag = ({ projects, setProjects }: UseGanttDragProps) => {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedTask: null,
    ghostPosition: null,
    hoveredCell: null,
    mouseOffset: { x: 0, y: 0 }
  });

  const isDraggingRef = useRef(false);
  
  // Helper function to calculate task duration
  const getDuration = useCallback((startDate: string, endDate: string): number => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }, []);

  // Handle mouse down on task
  const handleMouseDown = useCallback((e: React.MouseEvent, task: Task, element: HTMLElement) => {
    e.preventDefault();
    
    const rect = element.getBoundingClientRect();
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

    isDraggingRef.current = true;
  }, []);

  // Handle mouse move during drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragState.isDragging || !dragState.draggedTask) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Update ghost position
    const ghostPosition = {
      x: e.clientX - dragState.mouseOffset.x,
      y: e.clientY - dragState.mouseOffset.y
    };

    // Calculate grid position
    const row = getRowFromY(y);
    const col = getColFromX(x);

    // Check if position is valid (within bounds)
    const isValidPosition = row >= 0 && col >= 0 && 
      row < projects.reduce((sum, p) => sum + 1 + (p.expanded ? p.tasks.length : 0), 0);

    setDragState(prev => ({
      ...prev,
      ghostPosition,
      hoveredCell: isValidPosition ? { row, col } : null
    }));
  }, [dragState.isDragging, dragState.draggedTask, dragState.mouseOffset, projects]);

  // Handle mouse up - end drag
  const handleMouseUp = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedTask || !dragState.hoveredCell) {
      setDragState({
        isDragging: false,
        draggedTask: null,
        ghostPosition: null,
        hoveredCell: null,
        mouseOffset: { x: 0, y: 0 }
      });
      isDraggingRef.current = false;
      return;
    }

    const { draggedTask, hoveredCell } = dragState;
    const { row, col } = hoveredCell;

    // Check if this is a valid drop position (task row, not project header)
    let currentRow = 0;
    let isValidDrop = false;
    let targetProject: Project | null = null;

    for (const project of projects) {
      // Project header row
      if (currentRow === row) {
        isValidDrop = false;
        break;
      }
      currentRow++;

      // Task rows
      if (project.expanded) {
        for (let i = 0; i < project.tasks.length; i++) {
          if (currentRow === row) {
            isValidDrop = true;
            targetProject = project;
            break;
          }
          currentRow++;
        }
      }
      
      if (isValidDrop) break;
    }

    if (isValidDrop && targetProject) {
      // Calculate new dates
      const duration = getDuration(draggedTask.startDate, draggedTask.endDate);
      const newStartDate = getDateFromIndex(col);
      const newEndDate = getDateFromIndex(col + duration - 1);

      // Update task position
      setProjects(prev => {
        return prev.map(project => {
          if (project.id === targetProject.id) {
            return {
              ...project,
              tasks: project.tasks.map(task =>
                task.id === draggedTask.id
                  ? { ...task, startDate: newStartDate, endDate: newEndDate, projectId: project.id }
                  : task
              )
            };
          } else {
            // Remove task from original project if it's different
            return {
              ...project,
              tasks: project.tasks.filter(task => task.id !== draggedTask.id)
            };
          }
        });
      });
    }

    // Reset drag state
    setDragState({
      isDragging: false,
      draggedTask: null,
      ghostPosition: null,
      hoveredCell: null,
      mouseOffset: { x: 0, y: 0 }
    });
    isDraggingRef.current = false;
  }, [dragState, projects, setProjects, getDuration]);

  return {
    dragState,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    isDragging: isDraggingRef.current
  };
};