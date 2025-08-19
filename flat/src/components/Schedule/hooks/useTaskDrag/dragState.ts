/**
 * Drag state management utilities for useTaskDrag
 */

import type { Task, ModalState } from '@/types/schedule';
import type { DragState } from './types';
import { setInteractionMode, setDragImageElement } from '@/utils/schedule/globalState';

export const initializeDragState = (
  task: Task,
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>,
  dragStateRef: React.MutableRefObject<DragState | null>
) => {
  // Clear any resize state before starting drag
  setModalState((prev) => ({
    ...prev,
    isResizingTask: false,
    resizingTask: null,
    resizeDirection: null
  }));
  
  // Set global interaction state
  setInteractionMode('dragging');
  
  // Set modal state for drag
  setModalState((prev) => ({
    ...prev,
    isDraggingTask: true,
    draggedTask: task,
    isResizingTask: false,
    resizingTask: null,
    resizeDirection: null
  }));
};

export const setupDragImage = (
  e: React.DragEvent,
  task: Task,
  cellWidth: number,
  dragStateRef: React.MutableRefObject<DragState | null>
) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const offsetX = e.clientX - rect.left;
  const taskWidth = rect.width;
  
  // Store drag state
  dragStateRef.current = { offsetX, taskWidth };
  
  // Create custom drag image
  const dragImage = document.createElement('div');
  dragImage.innerHTML = task.title || 'Task';
  dragImage.style.cssText = `
    position: absolute;
    top: -1000px;
    left: -1000px;
    background: ${task.color || '#3b82f6'};
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    z-index: 9999;
    pointer-events: none;
  `;
  
  document.body.appendChild(dragImage);
  e.dataTransfer.setDragImage(dragImage, offsetX, 10);
  setDragImageElement(dragImage);
  
  // Clean up drag image after a delay
  setTimeout(() => {
    if (document.body.contains(dragImage)) {
      document.body.removeChild(dragImage);
    }
  }, 50);
};

export const cleanupDragState = (
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>,
  dragStateRef: React.MutableRefObject<DragState | null>,
  cleanupTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>
) => {
  // Clear timeout if it exists
  if (cleanupTimeoutRef.current) {
    clearTimeout(cleanupTimeoutRef.current);
    cleanupTimeoutRef.current = null;
  }
  
  // Reset drag state
  dragStateRef.current = null;
  
  // Reset modal state
  setModalState((prev) => ({
    ...prev,
    isDraggingTask: false,
    draggedTask: null,
    isResizingTask: false,
    resizingTask: null,
    resizeDirection: null
  }));
  
  // Reset global interaction state
  setInteractionMode('idle');
};

export const shouldAllowDrop = (
  e: React.DragEvent,
  task: Task,
  targetFactory: string,
  factories: any[]
): boolean => {
  const taskFactory = task.factory;
  
  if (!taskFactory || !targetFactory) {
    return true; // Allow if no factory constraints
  }
  
  // Find factory objects
  const sourceFactory = factories.find(f => f.name === taskFactory);
  const targetFactoryObj = factories.find(f => f.name === targetFactory);
  
  if (!sourceFactory || !targetFactoryObj) {
    return true; // Allow if factory not found (fallback)
  }
  
  // Check type compatibility
  const isCompatible = sourceFactory.type === targetFactoryObj.type;
  
  if (!isCompatible) {
    return false;
  }
  
  return true;
};