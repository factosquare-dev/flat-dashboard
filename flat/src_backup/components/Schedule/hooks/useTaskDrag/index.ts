/**
 * useTaskDrag - Refactored main hook
 * Now uses focused utility modules for better maintainability
 */

import { useState, useEffect, useRef } from 'react';
import type { Task, ModalState, Participant, TaskControls } from '@/types/schedule';
import { useAutoScroll } from '@/components/Schedule/useAutoScroll';
import { useDragTooltip } from '@/components/Schedule/useDragTooltip';
import { useDragPreview } from '@/components/Schedule/useDragPreview';
import { useProjectFinder } from '@/components/Schedule/useProjectFinder';
import { useToast } from '@/hooks/useToast';
import { getDragImageElement } from '@/utils/schedule/globalState';
import { initializeDragState, setupDragImage, cleanupDragState } from './dragState';
import type { DragState } from './types';
import { createDragHandlers } from './dragHandlers';

export const useTaskDrag = (
  projects: Participant[],
  days: Date[],
  cellWidth: number,
  scrollRef: React.RefObject<HTMLDivElement>,
  taskControls: TaskControls,
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>,
  modalState: ModalState
) => {
  const dragStateRef = useRef<DragState | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Hooks
  const { error: toastError } = useToast();
  const { dragTooltip, updateTooltip, clearTooltip } = useDragTooltip();
  const { dragPreview, updatePreview, clearPreview, initializePreview, validateFactoryCompatibility } = useDragPreview(projects);
  const { findProjectFromEvent } = useProjectFinder(scrollRef);
  const { handleAutoScroll, stopAutoScroll } = useAutoScroll(scrollRef, modalState.isDraggingTask);

  // Create drag handlers
  const dragHandlers = createDragHandlers(
    projects,
    days,
    cellWidth,
    scrollRef,
    taskControls,
    setModalState,
    modalState,
    dragStateRef,
    cleanupTimeoutRef,
    toastError,
    updateTooltip,
    clearTooltip,
    updatePreview,
    clearPreview,
    findProjectFromEvent,
    handleAutoScroll,
    stopAutoScroll
  );

  const handleTaskDragStart = (e: React.DragEvent, task: Task, index: number) => {
    // Initialize drag state
    initializeDragState(task, setModalState, dragStateRef);
    
    // Setup drag image
    setupDragImage(e, task, cellWidth, dragStateRef);
    
    // Initialize preview
    initializePreview(task);
  };

  // Global drag event listeners
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      if (modalState.isDraggingTask) {
        e.preventDefault();
      }
    };

    const handleGlobalDrop = (e: DragEvent) => {
      if (modalState.isDraggingTask) {
        e.preventDefault();
      }
    };

    document.addEventListener('dragover', handleGlobalDragOver);
    document.addEventListener('drop', handleGlobalDrop);

    return () => {
      document.removeEventListener('dragover', handleGlobalDragOver);
      document.removeEventListener('drop', handleGlobalDrop);
    };
  }, [modalState.isDraggingTask]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
      
      // Clean up drag image if it exists
      const dragImage = getDragImageElement();
      if (dragImage && document.body.contains(dragImage)) {
        document.body.removeChild(dragImage);
      }
    };
  }, []);

  return {
    dragTooltip,
    dragPreview,
    handleTaskDragStart,
    handleTaskDragOver: dragHandlers.handleTaskDragOver,
    handleTaskDrop: dragHandlers.handleTaskDrop,
    handleTaskDragEnd: dragHandlers.handleTaskDragEnd,
    handleTaskDragLeave: dragHandlers.handleTaskDragLeave,
    validateFactoryCompatibility
  };
};