import type { Task, ResizePreview, ModalState } from '../../../../types/schedule';
import { setInteractionMode, setPreventClickUntil } from '../../utils/globalState';
import { SCHEDULE_CONSTANTS } from '../../constants';
import { calculateResizeDateFromX, calculateHoveredDateIndex, calculateSnapIndicatorX } from './dateCalculations';
import { validateResizeStartDate, validateResizeEndDate, getProjectTasks } from './resizeValidation';
import { formatDateISO } from '../../../../utils/dateUtils';

export interface ResizeEventHandlers {
  handleTaskMouseDown: (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => void;
  handleMouseMove: (e: MouseEvent) => void;
  handleMouseUp: () => void;
}

export interface ResizeState {
  resizePreview: ResizePreview | null;
  hoveredDateIndex: number | null;
  snapIndicatorX: number | null;
  setResizePreview: React.Dispatch<React.SetStateAction<ResizePreview | null>>;
  setHoveredDateIndex: React.Dispatch<React.SetStateAction<number | null>>;
  setSnapIndicatorX: React.Dispatch<React.SetStateAction<number | null>>;
}

export const createTaskMouseDownHandler = (
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>,
  setResizePreview: React.Dispatch<React.SetStateAction<ResizePreview | null>>
) => (
  e: React.MouseEvent,
  task: Task,
  direction: 'start' | 'end'
) => {
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

export const createMouseMoveHandler = (
  modalState: ModalState,
  scrollRef: React.RefObject<HTMLDivElement>,
  cellWidth: number,
  days: Date[],
  tasks: Task[],
  resizeState: ResizeState,
  animationFrameRef: React.MutableRefObject<number | null>
) => (e: MouseEvent) => {
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
      
      // Track which date index is being hovered for visual feedback
      const hoveredIndex = calculateHoveredDateIndex(x, cellWidth, days);
      
      // Only update state if values have changed to reduce re-renders
      if (resizeState.hoveredDateIndex !== hoveredIndex) {
        resizeState.setHoveredDateIndex(hoveredIndex);
      }
      
      // Calculate snap indicator position
      if (hoveredIndex >= 0) {
        const newSnapX = calculateSnapIndicatorX(hoveredIndex, cellWidth, isEndDate);
        if (resizeState.snapIndicatorX !== newSnapX) {
          resizeState.setSnapIndicatorX(newSnapX);
        }
      }
      
      const task = modalState.resizingTask;
      const projectTasks = getProjectTasks(tasks, task.projectId, task.id);
      
      let previewStartDate = task.startDate;
      let previewEndDate = task.endDate;
      
      if (modalState.resizeDirection === 'start') {
        const result = validateResizeStartDate(newDate, task, projectTasks);
        previewStartDate = result.validStartDate;
      } else {
        const result = validateResizeEndDate(newDate, task, projectTasks);
        previewEndDate = result.validEndDate;
      }
      
      // Only update preview if dates have changed
      if (!resizeState.resizePreview || 
          resizeState.resizePreview.startDate !== previewStartDate || 
          resizeState.resizePreview.endDate !== previewEndDate) {
        resizeState.setResizePreview({
          taskId: task.id,
          startDate: previewStartDate,
          endDate: previewEndDate
        });
      }
    });
  }
};

export const createMouseUpHandler = (
  modalState: ModalState,
  resizePreview: ResizePreview | null,
  taskUpdateFn: (taskId: string, updates: Partial<Task>) => void,
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>,
  setResizePreview: React.Dispatch<React.SetStateAction<ResizePreview | null>>,
  setHoveredDateIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setSnapIndicatorX: React.Dispatch<React.SetStateAction<number | null>>
) => () => {
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
    
    taskUpdateFn(modalState.resizingTask.id, {
      startDate: resizePreview.startDate,
      endDate: resizePreview.endDate
    });
  }
  
  // Reset interaction state
  setInteractionMode('idle');
  setPreventClickUntil(Date.now() + SCHEDULE_CONSTANTS.INTERACTION_PREVENTION_DELAY);
  
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