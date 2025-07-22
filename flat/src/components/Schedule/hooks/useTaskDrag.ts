import { useState, useEffect, useRef } from 'react';
import type { Task, ModalState, Participant } from '../../../types/schedule';
import { findAvailableDateRange } from '../../../utils/taskUtils';
import { factories } from '../../../data/factories';
import { useAutoScroll } from './useAutoScroll';
import { useDragTooltip } from './useDragTooltip';
import { useDragPreview } from './useDragPreview';
import { useProjectFinder } from './useProjectFinder';
import { GridCoordinateCalculator, calculateTaskDuration, calculateEndDate } from '../utils/dragCalculations';
import { setInteractionMode, setDragImageElement, getDragImageElement } from '../utils/globalState';

interface DragState {
  offsetX: number;
  taskWidth: number;
}

export const useTaskDrag = (
  projects: Participant[],
  days: Date[],
  cellWidth: number,
  scrollRef: React.RefObject<HTMLDivElement>,
  taskControls: any,
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>,
  modalState: ModalState
) => {
  const dragStateRef = useRef<DragState | null>(null);
  const cleanupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { dragTooltip, updateTooltip, clearTooltip } = useDragTooltip();
  const { dragPreview, updatePreview, clearPreview, initializePreview, validateFactoryCompatibility } = useDragPreview(projects);
  const { findProjectFromEvent } = useProjectFinder(scrollRef);
  const { handleAutoScroll, stopAutoScroll } = useAutoScroll(scrollRef, modalState.isDraggingTask);

  const handleTaskDragStart = (e: React.DragEvent, task: Task, index: number) => {
    console.log('[DRAG START] Starting drag for task:', { taskId: task.id, title: task.title, index });
    
    // CRITICAL: Clear any resize state before starting drag
    setModalState((prev) => ({
      ...prev,
      isResizingTask: false,
      resizingTask: null,
      resizeDirection: null
    }));
    
    // Set global interaction state
    setInteractionMode('dragging');
    
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const taskWidth = rect.width;
    
    console.log('[DRAG START] Drag calculations:', { 
      clientX: e.clientX, 
      rectLeft: rect.left, 
      offsetX, 
      taskWidth 
    });
    
    const newDragState = { offsetX, taskWidth };
    dragStateRef.current = newDragState;
    setModalState((prev) => {
      const newState = {
        ...prev,
        isDraggingTask: true,
        draggedTask: task
      };
      console.log('[DRAG START] Updated modalState:', {
        isDraggingTask: newState.isDraggingTask,
        draggedTask: newState.draggedTask?.id
      });
      return newState;
    });
    
    // Set initial tooltip immediately
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    updateTooltip(e.clientX, e.clientY, startDate, endDate);
    
    // Initialize preview with compatible project
    initializePreview(task);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskIndex', index.toString());
    e.dataTransfer.setData('taskId', task.id.toString());
    e.dataTransfer.setData('text/plain', 'task-drag');
    
    console.log('[DRAG START] DataTransfer set:', { 
      taskIndex: index.toString(), 
      taskId: task.id.toString() 
    });
    
    // Custom drag image - transparent 1x1 pixel
    const dragImage = document.createElement('div');
    dragImage.style.width = '1px';
    dragImage.style.height = '1px';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    dragImage.style.opacity = '0';
    dragImage.style.pointerEvents = 'none';
    dragImage.setAttribute('data-drag-image', 'true');
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    
    // Store reference for cleanup
    setDragImageElement(dragImage);
    
    console.log('[DRAG START] Drag started successfully');
  };

  const handleTaskDragEnd = () => {
    console.log('[DRAG END] Drag ended');
    
    // Clear UI immediately
    clearTooltip();
    clearPreview();
    stopAutoScroll();
    
    // Clean up drag image
    const dragImage = getDragImageElement();
    if (dragImage && document.body.contains(dragImage)) {
      document.body.removeChild(dragImage);
      setDragImageElement(undefined);
    }
    
    // Clear any existing timeout
    if (cleanupTimeoutRef.current) {
      clearTimeout(cleanupTimeoutRef.current);
    }
    
    // If drag ends without drop, clean up after a delay
    cleanupTimeoutRef.current = setTimeout(() => {
      if (modalState.isDraggingTask) {
        console.log('[DRAG END] Cleaning up drag state after timeout');
        setModalState((prev) => ({
          ...prev,
          isDraggingTask: false,
          draggedTask: null
        }));
        dragStateRef.current = null;
      }
    }, 300);
  };

  // Cleanup state if no drop occurred
  useEffect(() => {
    let cleanupTimeout: NodeJS.Timeout;
    
    if (!modalState.isDraggingTask && dragStateRef.current) {
      cleanupTimeout = setTimeout(() => {
        dragStateRef.current = null;
      }, 200);
    }
    
    return () => {
      if (cleanupTimeout) clearTimeout(cleanupTimeout);
    };
  }, [modalState.isDraggingTask]);

  // Global drag over handler with auto-scroll
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      // CRITICAL: Skip if resizing to prevent conflicts
      if (modalState.isResizingTask) {
        console.log('[DRAG] Skipping dragover - resize in progress');
        return;
      }
      
      if (scrollRef.current && modalState.isDraggingTask && modalState.draggedTask && dragStateRef.current) {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
        
        const rect = scrollRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragStateRef.current.offsetX;
        const mouseX = e.clientX - rect.left;
        
        console.log('[DRAG OVER] Global drag over:', {
          clientX: e.clientX,
          mouseX,
          x,
          hasScrollRef: !!scrollRef.current,
          isDraggingTask: modalState.isDraggingTask,
          hasDraggedTask: !!modalState.draggedTask,
          hasDragState: !!dragStateRef.current
        });
        
        // Handle auto-scroll
        handleAutoScroll(mouseX, rect.width);
        
        // Calculate dates using unified coordinate calculator
        const calculator = new GridCoordinateCalculator({
          days,
          cellWidth,
          scrollLeft: scrollRef.current.scrollLeft,
          containerRect: rect
        });
        
        const startDate = calculator.mouseXToDate(e.clientX, true);
        const taskDuration = calculateTaskDuration(modalState.draggedTask.startDate, modalState.draggedTask.endDate);
        const endDate = calculateEndDate(startDate, taskDuration);
        
        
        // Update tooltip
        updateTooltip(e.clientX, e.clientY, startDate, endDate);
        
        // Update preview
        const dragEvent = { clientX: e.clientX, clientY: e.clientY, target: e.target } as React.DragEvent;
        const projectId = findProjectFromEvent(dragEvent);
        
        
        updatePreview(projectId, startDate, endDate, modalState.draggedTask.factory);
      }
    };

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

  const handleTaskDragOver = (e: React.DragEvent, modalState: ModalState) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (scrollRef.current && modalState.draggedTask && dragStateRef.current) {
      const rect = scrollRef.current.getBoundingClientRect();
      
      // Calculate dates using unified calculator
      const calculator = new GridCoordinateCalculator({
        days,
        cellWidth,
        scrollLeft: scrollRef.current.scrollLeft,
        containerRect: rect
      });
      const startDate = calculator.mouseXToDate(e.clientX, true);
      const taskDuration = calculateTaskDuration(modalState.draggedTask.startDate, modalState.draggedTask.endDate);
      const endDate = calculateEndDate(startDate, taskDuration);
      
      // Update tooltip
      updateTooltip(e.clientX, e.clientY, startDate, endDate);
      
      // Find and update preview for target project
      const projectId = findProjectFromEvent(e);
      updatePreview(projectId, startDate, endDate, modalState.draggedTask.factory);
    }
  };

  const handleTaskDrop = (e: React.DragEvent, targetProjectId: string, modalState: ModalState) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('[DROP] ========== handleTaskDrop CALLED ==========');
    console.log('[DROP] Drop event triggered:', { 
      targetProjectId,
      eventType: e.type,
      hasDataTransfer: !!e.dataTransfer,
      modalState: {
        isDraggingTask: modalState?.isDraggingTask,
        hasDraggedTask: !!modalState?.draggedTask,
        draggedTaskId: modalState?.draggedTask?.id
      }
    });
    
    e.preventDefault();
    e.stopPropagation();
    
    const taskIdStr = e.dataTransfer.getData('taskId');
    console.log('[DROP] Retrieved taskId string:', taskIdStr, 'length:', taskIdStr.length);
    
    const taskId = parseInt(taskIdStr);
    
    console.log('[DROP] Retrieved taskId from dataTransfer:', taskId);
    console.log('[DROP] Drop validation:', {
      taskId,
      isNaN: isNaN(taskId),
      hasDraggedTask: !!modalState.draggedTask,
      hasScrollRef: !!scrollRef.current,
      hasDragStateRef: !!dragStateRef.current
    });
    
    if (!isNaN(taskId) && modalState.draggedTask && scrollRef.current && dragStateRef.current) {
      const targetProject = projects.find(p => p.id === targetProjectId);
      const draggedTaskFactory = modalState.draggedTask.factory;
      
      console.log('[DROP] Target project:', targetProject);
      console.log('[DROP] Factory compatibility check:', {
        draggedTaskFactory,
        targetProjectName: targetProject?.name
      });
      
      // Check factory type compatibility
      if (!validateFactoryCompatibility(draggedTaskFactory, targetProject?.name || '')) {
        const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
        const targetFactory = factories.find(f => f.name === targetProject?.name);
        console.log('[DROP] Factory compatibility FAILED:', {
          draggedFactory,
          targetFactory
        });
        alert(`${draggedFactory?.type} 공장의 태스크는 ${targetFactory?.type} 공장으로 이동할 수 없습니다.`);
        clearPreview();
        return;
      }
      
      const rect = scrollRef.current.getBoundingClientRect();
      
      // Use unified coordinate calculator for drop positioning
      const calculator = new GridCoordinateCalculator({
        days,
        cellWidth,
        scrollLeft: scrollRef.current.scrollLeft,
        containerRect: rect
      });
      
      const newStartDate = calculator.mouseXToDate(e.clientX, true);
      const taskDuration = calculateTaskDuration(modalState.draggedTask.startDate, modalState.draggedTask.endDate);
      
      console.log('[DROP] Position calculations (detailed):', {
        clientX: e.clientX,
        rectLeft: rect.left,
        scrollLeft: scrollRef.current.scrollLeft,
        offsetX: dragStateRef.current.offsetX,
        newStartDate: newStartDate.toISOString().split('T')[0],
        taskDuration
      });
      
      // Find available date range
      const availableRange = findAvailableDateRange(
        targetProjectId,
        newStartDate.toISOString().split('T')[0],
        taskDuration,
        taskControls.tasks,
        taskId
      );
      
      console.log('[DROP] Available range found:', availableRange);
      
      // Update task
      console.log('[DROP] Updating task with:', {
        taskId,
        projectId: targetProjectId,
        factory: targetProject?.name || modalState.draggedTask.factory,
        startDate: availableRange.startDate,
        endDate: availableRange.endDate
      });
      
      taskControls.updateTask(taskId, {
        projectId: targetProjectId,
        factory: targetProject?.name || modalState.draggedTask.factory,
        startDate: availableRange.startDate,
        endDate: availableRange.endDate
      });
      
      console.log('[DROP] Task update completed');
    } else {
      console.log('[DROP] Drop validation failed, skipping update');
    }
    
    // Always clear state after drop attempt
    console.log('[DROP] Clearing drag state');
    clearPreview();
    setModalState((prev) => ({
      ...prev,
      isDraggingTask: false,
      draggedTask: null
    }));
    dragStateRef.current = null;
  };

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