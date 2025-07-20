import { useState, useEffect } from 'react';
import type { Task, ResizePreview } from '../../../types/schedule';
import { findAvailableDateRange } from '../../../utils/taskUtils';

// Common date calculation function for resize
// For resize, we want the date where the edge of the task will be
const calculateDateFromX = (x: number, cellWidth: number, days: Date[], isEndDate: boolean = false): Date => {
  // For better UX, use snap zones for more intuitive date selection
  // Start date: snap to the start of the cell (left edge)
  // End date: snap to the end of the cell (right edge) to include the full day
  
  if (isEndDate) {
    // For end dates, we want to snap to cell boundaries
    // If cursor is in first half of cell, snap to end of previous cell
    // If cursor is in second half of cell, snap to end of current cell
    const cellIndex = Math.floor(x / cellWidth);
    const cellOffset = x % cellWidth;
    
    if (cellOffset < cellWidth * 0.5) {
      // Snap to end of previous day
      const selectedIndex = Math.max(0, cellIndex - 1);
      return new Date(days[selectedIndex]);
    } else {
      // Snap to end of current day
      const selectedIndex = Math.min(cellIndex, days.length - 1);
      return new Date(days[selectedIndex]);
    }
  } else {
    // For start dates, snap to cell boundaries
    // If cursor is in first half of cell, snap to start of current cell
    // If cursor is in second half of cell, snap to start of next cell
    const cellIndex = Math.floor(x / cellWidth);
    const cellOffset = x % cellWidth;
    
    if (cellOffset < cellWidth * 0.5) {
      // Snap to start of current day
      return new Date(days[cellIndex]);
    } else {
      // Snap to start of next day
      const selectedIndex = Math.min(cellIndex + 1, days.length - 1);
      return new Date(days[selectedIndex]);
    }
  }
};

export const useTaskResize = (
  days: Date[],
  cellWidth: number,
  scrollRef: React.RefObject<HTMLDivElement>,
  taskControls: any,
  modalState: any,
  setModalState: any
) => {
  const [resizePreview, setResizePreview] = useState<ResizePreview | null>(null);
  const [hoveredDateIndex, setHoveredDateIndex] = useState<number | null>(null);
  const [snapIndicatorX, setSnapIndicatorX] = useState<number | null>(null);

  const handleTaskMouseDown = (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    setModalState((prev: any) => ({
      ...prev,
      isResizingTask: true,
      resizingTask: task,
      resizeDirection: direction
    }));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (modalState.isResizingTask && modalState.resizingTask && modalState.resizeDirection && scrollRef.current) {
      e.preventDefault();
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft;
      
      // Use common calculation with isEndDate parameter for accurate date selection
      const isEndDate = modalState.resizeDirection === 'end';
      const newDate = calculateDateFromX(x, cellWidth, days, isEndDate);
      const dateStr = newDate.toISOString().split('T')[0];
      
      // Track which date index is being hovered for visual feedback
      const hoveredIndex = days.findIndex(day => 
        day.toISOString().split('T')[0] === dateStr
      );
      setHoveredDateIndex(hoveredIndex);
      
      // Calculate snap indicator position
      if (hoveredIndex >= 0) {
        if (isEndDate) {
          // For end date, show indicator at the right edge of the selected cell
          setSnapIndicatorX((hoveredIndex + 1) * cellWidth);
        } else {
          // For start date, show indicator at the left edge of the selected cell
          setSnapIndicatorX(hoveredIndex * cellWidth);
        }
      }
      
      const task = modalState.resizingTask;
      let previewStartDate = task.startDate;
      let previewEndDate = task.endDate;
      
      // Get all tasks in the same project except current task
      const projectTasks = taskControls.tasks.filter((t: Task) => 
        t.projectId === task.projectId && t.id !== task.id
      );
      
      if (modalState.resizeDirection === 'start') {
        // Resizing start date
        const endDate = new Date(task.endDate);
        
        // Can't move start date past end date (but can be same date for 1-day task)
        if (newDate > endDate) {
          previewStartDate = endDate.toISOString().split('T')[0];
        } else {
          // Check for overlap with other tasks
          let validDate = dateStr;
          let hasOverlap = false;
          
          for (const otherTask of projectTasks) {
            const otherStart = new Date(otherTask.startDate);
            const otherEnd = new Date(otherTask.endDate);
            
            // Check if new date range would overlap
            if (newDate <= otherEnd && endDate >= otherStart) {
              hasOverlap = true;
              // If overlapping, set to day after other task ends
              validDate = new Date(otherEnd.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              break;
            }
          }
          
          previewStartDate = hasOverlap ? validDate : dateStr;
        }
      } else {
        // Resizing end date
        const startDate = new Date(task.startDate);
        
        // Can't move end date before start date (but can be same date for 1-day task)
        if (newDate < startDate) {
          previewEndDate = startDate.toISOString().split('T')[0];
        } else {
          // Check for overlap with other tasks
          let validDate = dateStr;
          let hasOverlap = false;
          
          for (const otherTask of projectTasks) {
            const otherStart = new Date(otherTask.startDate);
            const otherEnd = new Date(otherTask.endDate);
            
            // Check if new date range would overlap
            if (startDate <= otherEnd && newDate >= otherStart) {
              hasOverlap = true;
              // If overlapping, set to day before other task starts
              validDate = new Date(otherStart.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              break;
            }
          }
          
          previewEndDate = hasOverlap ? validDate : dateStr;
        }
      }
      
      setResizePreview({
        taskId: task.id,
        startDate: previewStartDate,
        endDate: previewEndDate
      });
    }
  };

  const handleMouseUp = () => {
    if (modalState.isResizingTask && modalState.resizingTask && resizePreview) {
      // Apply the preview dates directly since we already validated them during resize
      taskControls.updateTask(modalState.resizingTask.id, {
        startDate: resizePreview.startDate,
        endDate: resizePreview.endDate
      });
    }
    setModalState((prev: any) => ({
      ...prev,
      isResizingTask: false,
      resizingTask: null,
      resizeDirection: null
    }));
    setResizePreview(null);
    setHoveredDateIndex(null);
    setSnapIndicatorX(null);
  };

  // Set up global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
    };
    
    const handleGlobalMouseUp = (e: MouseEvent) => {
      handleMouseUp();
    };
    
    if (modalState.isResizingTask) {
      // Set resize cursor globally
      document.body.style.cursor = 'ew-resize';
      
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        // Reset cursor
        document.body.style.cursor = '';
      };
    }
  }, [modalState.isResizingTask, modalState.resizingTask, modalState.resizeDirection]);

  return {
    resizePreview,
    hoveredDateIndex,
    snapIndicatorX,
    handleTaskMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};