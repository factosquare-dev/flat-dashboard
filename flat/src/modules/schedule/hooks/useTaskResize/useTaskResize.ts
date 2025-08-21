import { useState, useEffect, useRef, useCallback } from 'react';
import type { ResizePreview, TaskControls, ModalState } from '@/shared/types/schedule';
import { 
  createTaskMouseDownHandler, 
  createMouseMoveHandler, 
  createMouseUpHandler,
  type ResizeState 
} from './eventHandlers';

export const useTaskResize = (
  days: Date[],
  cellWidth: number,
  scrollRef: React.RefObject<HTMLDivElement>,
  taskControls: TaskControls,
  modalState: ModalState,
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>
) => {
  const [resizePreview, setResizePreview] = useState<ResizePreview | null>(null);
  const [hoveredDateIndex, setHoveredDateIndex] = useState<number | null>(null);
  const [snapIndicatorX, setSnapIndicatorX] = useState<number | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const handleMouseMoveRef = useRef<(e: MouseEvent) => void>();
  const handleMouseUpRef = useRef<() => void>();

  const resizeState: ResizeState = {
    resizePreview,
    hoveredDateIndex,
    snapIndicatorX,
    setResizePreview,
    setHoveredDateIndex,
    setSnapIndicatorX
  };

  const handleTaskMouseDown = createTaskMouseDownHandler(setModalState, setResizePreview);

  const handleMouseMove = useCallback(
    createMouseMoveHandler(
      modalState,
      scrollRef,
      cellWidth,
      days,
      taskControls.tasks,
      resizeState,
      animationFrameRef
    ),
    [modalState.isDraggingTask, modalState.isResizingTask, modalState.resizingTask, modalState.resizeDirection, scrollRef, cellWidth, days, taskControls.tasks]
  );

  const handleMouseUp = useCallback(
    createMouseUpHandler(
      modalState,
      resizePreview,
      taskControls.updateTask,
      setModalState,
      setResizePreview,
      setHoveredDateIndex,
      setSnapIndicatorX
    ),
    [modalState.isDraggingTask, modalState.isResizingTask, modalState.resizingTask, resizePreview, taskControls, setModalState]
  );

  // Store callbacks in refs to avoid re-creating event listeners
  useEffect(() => {
    handleMouseMoveRef.current = handleMouseMove;
    handleMouseUpRef.current = handleMouseUp;
  }, [handleMouseMove, handleMouseUp]);

  // Set up global mouse event listeners
  useEffect(() => {
    if (!modalState.isResizingTask) return;
    
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (handleMouseMoveRef.current) {
        handleMouseMoveRef.current(e);
      }
    };
    
    const handleGlobalMouseUp = (e: MouseEvent) => {
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