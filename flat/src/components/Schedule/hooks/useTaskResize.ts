import { useState, useEffect, useRef, useCallback } from 'react';
import type { Task, ResizePreview } from '../../../types/schedule';
import { findAvailableDateRange } from '../../../utils/taskUtils';
import { GridCoordinateCalculator } from '../utils/dragCalculations';
import { setInteractionMode, setPreventClickUntil } from '../utils/globalState';

// Resize-specific date calculation with snap zones
const calculateResizeDateFromX = (
  x: number, 
  cellWidth: number, 
  days: Date[], 
  isEndDate: boolean = false
): Date => {
  // Create calculator for resize operations
  const calculator = new GridCoordinateCalculator({ days, cellWidth });
  
  // Use snap zones for better UX during resize
  const safeCellWidth = cellWidth || 1; // Guard against division by zero
  const cellIndex = Math.floor(x / safeCellWidth);
  const cellOffset = x % safeCellWidth;
  const snapThreshold = safeCellWidth * 0.5;
  
  if (isEndDate) {
    // For end dates, snap to cell end boundaries
    const targetIndex = cellOffset < snapThreshold 
      ? Math.max(0, cellIndex - 1)  // Snap to end of previous day
      : Math.min(cellIndex, days.length - 1); // Snap to end of current day
    
    // Bounds check
    if (targetIndex < 0 || targetIndex >= days.length) {
      return new Date(days[Math.max(0, Math.min(days.length - 1, targetIndex))]);
    }
    
    return new Date(days[targetIndex]);
  } else {
    // For start dates, snap to cell start boundaries  
    const targetIndex = cellOffset < snapThreshold
      ? cellIndex  // Snap to start of current day
      : Math.min(cellIndex + 1, days.length - 1); // Snap to start of next day
    
    // Bounds check
    if (targetIndex < 0 || targetIndex >= days.length) {
      return new Date(days[Math.max(0, Math.min(days.length - 1, targetIndex))]);
    }
    
    return new Date(days[targetIndex]);
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
  const animationFrameRef = useRef<number | null>(null);
  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>();
  const handleMouseUpRef = useRef<() => void>();

  const handleTaskMouseDown = (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    
    // CRITICAL: Clear any drag state before starting resize
    setModalState((prev: any) => ({
      ...prev,
      isDraggingTask: false,
      draggedTask: null,
      isResizingTask: true,
      resizingTask: task,
      resizeDirection: direction
    }));
    
    // Set initial preview immediately
    setResizePreview({
      taskId: task.id,
      startDate: task.startDate,
      endDate: task.endDate
    });
    
    // Set global interaction state
    setInteractionMode('resizing');
    
    console.log('[RESIZE START] Starting resize (cleared drag state):', { taskId: task.id, direction });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    // CRITICAL: Skip if dragging to prevent conflicts
    if (modalState.isDraggingTask) {
      console.log('[RESIZE] Skipping mousemove - drag in progress');
      return;
    }
    
    if (modalState.isResizingTask && modalState.resizingTask && modalState.resizeDirection && scrollRef.current) {
      e.preventDefault();
      
      // Cancel previous animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      // Use requestAnimationFrame for smooth updates
      animationFrameRef.current = requestAnimationFrame(() => {
        if (!scrollRef.current) return;
        
        const rect = scrollRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollRef.current.scrollLeft;
        
      
      // Use unified calculation with snap zones for resize
      const isEndDate = modalState.resizeDirection === 'end';
      const newDate = calculateResizeDateFromX(x, cellWidth, days, isEndDate);
      const dateStr = newDate.toISOString().split('T')[0];
      
      // Track which date index is being hovered for visual feedback
      const hoveredIndex = days.findIndex(day => 
        day.toISOString().split('T')[0] === dateStr
      );
      
      // Only update state if values have changed to reduce re-renders
      if (hoveredDateIndex !== hoveredIndex) {
        setHoveredDateIndex(hoveredIndex);
      }
      
      // Calculate snap indicator position
      if (hoveredIndex >= 0) {
        const newSnapX = isEndDate ? (hoveredIndex + 1) * cellWidth : hoveredIndex * cellWidth;
        if (snapIndicatorX !== newSnapX) {
          setSnapIndicatorX(newSnapX);
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
      
      // Only update preview if dates have changed
      if (!resizePreview || 
          resizePreview.startDate !== previewStartDate || 
          resizePreview.endDate !== previewEndDate) {
        setResizePreview({
          taskId: task.id,
          startDate: previewStartDate,
          endDate: previewEndDate
        });
      }
      });
    }
  }, [modalState.isDraggingTask, modalState.isResizingTask, modalState.resizingTask, modalState.resizeDirection, scrollRef, cellWidth, days, taskControls.tasks]);

  const handleMouseUp = useCallback(() => {
    console.log('[RESIZE] ========== MOUSE UP - ENDING RESIZE ==========');
    
    // CRITICAL: Skip if dragging to prevent conflicts
    if (modalState.isDraggingTask) {
      console.log('[RESIZE] Skipping mouseup - drag in progress');
      return;
    }
    
    console.log('[RESIZE] Current state:', {
      isResizingTask: modalState.isResizingTask,
      hasResizingTask: !!modalState.resizingTask,
      hasResizePreview: !!resizePreview,
      taskId: modalState.resizingTask?.id,
      previewDates: resizePreview ? {
        startDate: resizePreview.startDate,
        endDate: resizePreview.endDate
      } : null
    });
    
    if (modalState.isResizingTask && modalState.resizingTask && resizePreview) {
      // Apply the preview dates directly since we already validated them during resize
      console.log('[RESIZE] Applying resize:', {
        taskId: modalState.resizingTask.id,
        startDate: resizePreview.startDate,
        endDate: resizePreview.endDate
      });
      
      taskControls.updateTask(modalState.resizingTask.id, {
        startDate: resizePreview.startDate,
        endDate: resizePreview.endDate
      });
    }
    
    // Reset interaction state
    setInteractionMode('idle');
    setPreventClickUntil(Date.now() + 300);
    
    setModalState((prev: any) => ({
      ...prev,
      isResizingTask: false,
      resizingTask: null,
      resizeDirection: null
    }));
    setResizePreview(null);
    setHoveredDateIndex(null);
    setSnapIndicatorX(null);
  }, [modalState.isDraggingTask, modalState.isResizingTask, modalState.resizingTask, resizePreview, taskControls, setModalState]);

  // Store callbacks in refs to avoid re-creating event listeners
  useEffect(() => {
    handleMouseMoveRef.current = handleMouseMove;
    handleMouseUpRef.current = handleMouseUp;
  }, [handleMouseMove, handleMouseUp]);

  // Set up global mouse event listeners
  useEffect(() => {
    if (!modalState.isResizingTask) return;
    
    console.log('[RESIZE] Setting up global mouse listeners');
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (handleMouseMoveRef.current) {
        handleMouseMoveRef.current(e);
      }
    };
    
    const handleGlobalMouseUp = (e: MouseEvent) => {
      console.log('[RESIZE] MouseUp caught');
      if (handleMouseUpRef.current) {
        handleMouseUpRef.current();
      }
    };
    
    // Set resize cursor globally
    document.body.style.cursor = 'ew-resize';
    
    // Single set of listeners with capture phase
    document.addEventListener('mousemove', handleGlobalMouseMove, true);
    document.addEventListener('mouseup', handleGlobalMouseUp, true);
    window.addEventListener('mouseup', handleGlobalMouseUp, true);
    
    return () => {
      console.log('[RESIZE] Cleaning up mouse listeners');
      document.removeEventListener('mousemove', handleGlobalMouseMove, true);
      document.removeEventListener('mouseup', handleGlobalMouseUp, true);
      window.removeEventListener('mouseup', handleGlobalMouseUp, true);
      document.body.style.cursor = '';
    };
  }, [modalState.isResizingTask]); // Remove handleMouseUp from dependencies

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return {
    resizePreview,
    hoveredDateIndex,
    snapIndicatorX,
    handleTaskMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};