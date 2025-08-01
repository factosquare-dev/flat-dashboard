/**
 * Drag event handlers for useTaskDrag
 */

import type { ModalState, Participant, TaskControls } from '@/types/schedule';
import type { DragState } from './types';
import { GridCoordinateCalculator, calculateTaskDuration, calculateEndDate } from '@/utils/schedule/dragCalculations';
import { formatDateISO } from '@/utils/coreUtils';
import { UI_DELAYS } from '@/constants/time';
import { validateTaskDrop } from './dragValidation';
import { cleanupDragState, shouldAllowDrop } from './dragState';

export const createDragHandlers = (
  projects: Participant[],
  days: Date[],
  cellWidth: number,
  scrollRef: React.RefObject<HTMLDivElement>,
  taskControls: TaskControls,
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>,
  modalState: ModalState,
  dragStateRef: React.MutableRefObject<DragState | null>,
  cleanupTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
  toastError: (message: string) => void,
  updateTooltip: (x: number, y: number, startDate: Date, endDate: Date) => void,
  clearTooltip: () => void,
  updatePreview: (x: number, y: number, startDate: Date, endDate: Date) => void,
  clearPreview: () => void,
  findProjectFromEvent: (e: React.DragEvent) => string | null,
  handleAutoScroll: (e: React.DragEvent) => void,
  stopAutoScroll: () => void
) => {
  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!modalState.isDraggingTask || !modalState.draggedTask || !dragStateRef.current) {
      return;
    }
    
    const task = modalState.draggedTask;
    const calculator = new GridCoordinateCalculator(days, cellWidth);
    const coords = calculator.getCoordinatesFromEvent(e, scrollRef);
    
    if (!coords) return;
    
    const targetProject = findProjectFromEvent(e);
    if (!targetProject) return;
    
    // Calculate new dates
    const duration = calculateTaskDuration(task.startDate, task.endDate);
    const newStartDate = calculator.getDateFromDayIndex(coords.dayIndex);
    const newEndDate = calculateEndDate(newStartDate, duration);
    
    // Validate factory compatibility
    if (!shouldAllowDrop(e, task, targetProject, projects)) {
      return;
    }
    
    // Update tooltip and preview
    const rect = scrollRef.current?.getBoundingClientRect();
    if (rect) {
      const tooltipX = e.clientX - rect.left;
      const tooltipY = e.clientY - rect.top;
      updateTooltip(tooltipX, tooltipY, newStartDate, newEndDate);
      updatePreview(tooltipX, tooltipY, newStartDate, newEndDate);
    }
    
    // Handle auto-scroll
    handleAutoScroll(e);
  };

  const handleTaskDrop = (e: React.DragEvent) => {
    e.preventDefault();
    
    if (!modalState.isDraggingTask || !modalState.draggedTask || !dragStateRef.current) {
      return;
    }
    
    const task = modalState.draggedTask;
    const calculator = new GridCoordinateCalculator(days, cellWidth);
    const coords = calculator.getCoordinatesFromEvent(e, scrollRef);
    
    if (!coords) {
      toastError('잘못된 위치입니다.');
      return;
    }
    
    const targetProject = findProjectFromEvent(e);
    if (!targetProject) {
      toastError('대상 프로젝트를 찾을 수 없습니다.');
      return;
    }
    
    // Calculate new dates
    const duration = calculateTaskDuration(task.startDate, task.endDate);
    const newStartDate = calculator.getDateFromDayIndex(coords.dayIndex);
    const newEndDate = calculateEndDate(newStartDate, duration);
    
    const newStartDateStr = formatDateISO(newStartDate);
    const newEndDateStr = formatDateISO(newEndDate);
    
    // Validate the drop
    const validation = validateTaskDrop(
      task,
      targetProject,
      newStartDateStr,
      newEndDateStr,
      projects
    );
    
    if (!validation.isValid) {
      toastError(validation.reason || '작업을 이동할 수 없습니다.');
      return;
    }
    
    // Update task
    try {
      taskControls.updateTask(task.id, {
        startDate: newStartDateStr,
        endDate: newEndDateStr,
        factory: targetProject
      });
    } catch (error) {
      // Failed to update task
      toastError('작업 업데이트에 실패했습니다.');
    }
  };

  const handleTaskDragEnd = () => {
    
    // Stop auto-scroll
    stopAutoScroll();
    
    // Clear tooltip and preview
    clearTooltip();
    clearPreview();
    
    // Clean up with delay to ensure proper state management
    cleanupTimeoutRef.current = setTimeout(() => {
      cleanupDragState(setModalState, dragStateRef, cleanupTimeoutRef);
    }, UI_DELAYS.DRAG_CLEANUP);
  };

  const handleTaskDragLeave = (e: React.DragEvent) => {
    // Only clear if we're actually leaving the container
    const rect = e.currentTarget.getBoundingClientRect();
    const isInside = (
      e.clientX >= rect.left &&
      e.clientX <= rect.right &&
      e.clientY >= rect.top &&
      e.clientY <= rect.bottom
    );
    
    if (!isInside) {
      clearTooltip();
      clearPreview();
      stopAutoScroll();
    }
  };

  return {
    handleTaskDragOver,
    handleTaskDrop,
    handleTaskDragEnd,
    handleTaskDragLeave
  };
};