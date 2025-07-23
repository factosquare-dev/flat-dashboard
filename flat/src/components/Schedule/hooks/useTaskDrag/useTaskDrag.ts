import { useState, useEffect, useRef } from 'react';
import type { UseTaskDragProps, UseTaskDragReturn, DragState } from './types';
import { useAutoScroll } from '../useAutoScroll';
import { useDragTooltip } from '../useDragTooltip';
import { useDragPreview } from '../useDragPreview';
import { useProjectFinder } from '../useProjectFinder';
import { useToast } from '../../../../hooks/useToast';
import { UI_DELAYS } from '../../../../constants/time';
import { createDragStartHandler, createDragEndHandler, createDragOverHandler } from './dragHandlers';
import { createDropHandler } from './dropHandler';
import { createGlobalDragOverHandler } from './globalDragHandler';

export const useTaskDrag = ({
  projects,
  days,
  cellWidth,
  scrollRef,
  taskControls,
  setModalState,
  modalState
}: UseTaskDragProps): UseTaskDragReturn => {
  const dragStateRef = useRef<DragState | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { error: toastError } = useToast();
  const { dragTooltip, updateTooltip, clearTooltip } = useDragTooltip();
  const { dragPreview, updatePreview, clearPreview, initializePreview, validateFactoryCompatibility } = useDragPreview(projects);
  const { findProjectFromEvent } = useProjectFinder(scrollRef);
  const { handleAutoScroll, stopAutoScroll } = useAutoScroll(scrollRef, modalState.isDraggingTask);

  const handleTaskDragStart = createDragStartHandler(
    setModalState,
    dragStateRef,
    updateTooltip,
    initializePreview
  );

  const handleTaskDragEnd = createDragEndHandler(
    modalState,
    setModalState,
    dragStateRef,
    cleanupTimeoutRef,
    clearTooltip,
    clearPreview,
    stopAutoScroll
  );

  const handleTaskDragOver = createDragOverHandler(
    scrollRef,
    modalState,
    dragStateRef,
    days,
    cellWidth,
    updateTooltip,
    findProjectFromEvent,
    updatePreview
  );

  const handleTaskDrop = createDropHandler(
    projects,
    days,
    cellWidth,
    scrollRef,
    taskControls,
    setModalState,
    dragStateRef,
    validateFactoryCompatibility,
    toastError,
    clearPreview
  );

  // Cleanup state if no drop occurred
  useEffect(() => {
    let cleanupTimeout: NodeJS.Timeout;
    
    if (!modalState.isDraggingTask && dragStateRef.current) {
      cleanupTimeout = setTimeout(() => {
        dragStateRef.current = null;
      }, UI_DELAYS.RESIZE_CLEANUP);
    }
    
    return () => {
      if (cleanupTimeout) clearTimeout(cleanupTimeout);
    };
  }, [modalState.isDraggingTask]);

  // Global drag over handler with auto-scroll
  useEffect(() => {
    const handleGlobalDragOver = createGlobalDragOverHandler(
      scrollRef,
      modalState,
      dragStateRef,
      days,
      cellWidth,
      handleAutoScroll,
      updateTooltip,
      findProjectFromEvent,
      updatePreview
    );

    console.log('[DRAG] useEffect trigger check:', {
      isDraggingTask: modalState.isDraggingTask,
      draggedTaskId: modalState.draggedTask?.id,
      hasScrollRef: !!scrollRef.current
    });

    if (modalState.isDraggingTask) {
      console.log('[DRAG] Setting up global dragover handler');
      // Set move cursor globally during drag
      document.body.style.cursor = 'move';
      
      document.addEventListener('dragover', handleGlobalDragOver);
      // Also add drop handler to prevent default behavior
      const handleGlobalDrop = (e: DragEvent) => {
        console.log('[DRAG] Global drop detected, preventing default');
        e.preventDefault();
      };
      document.addEventListener('drop', handleGlobalDrop);
      
      return () => {
        console.log('[DRAG] Cleaning up global handlers');
        document.removeEventListener('dragover', handleGlobalDragOver);
        document.removeEventListener('drop', handleGlobalDrop);
        stopAutoScroll();
        // Reset cursor
        document.body.style.cursor = '';
      };
    } else {
      console.log('[DRAG] Not setting up handlers - isDraggingTask is false');
    }
  }, [modalState.isDraggingTask, modalState.isResizingTask, modalState.draggedTask, scrollRef, cellWidth, days, handleAutoScroll, updateTooltip, findProjectFromEvent, updatePreview, stopAutoScroll]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (cleanupTimeoutRef.current) {
        clearTimeout(cleanupTimeoutRef.current);
      }
    };
  }, []);

  return {
    dragTooltip,
    dragPreview,
    handleTaskDragStart,
    handleTaskDragEnd,
    handleTaskDragOver,
    handleTaskDrop
  };
};