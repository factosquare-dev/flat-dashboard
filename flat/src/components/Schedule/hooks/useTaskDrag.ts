import { useState, useEffect } from 'react';
import type { Task } from '../../../types/schedule';
import { findAvailableDateRange } from '../../../utils/taskUtils';
import { factories } from '../../../data/factories';
import { useAutoScroll } from './useAutoScroll';
import { useDragTooltip } from './useDragTooltip';
import { useDragPreview } from './useDragPreview';
import { useProjectFinder } from './useProjectFinder';
import { calculateDateFromX, calculateTaskDuration, calculateEndDate } from '../utils/dragCalculations';

interface DragState {
  offsetX: number;
  taskWidth: number;
}

export const useTaskDrag = (
  projects: any[],
  days: Date[],
  cellWidth: number,
  scrollRef: React.RefObject<HTMLDivElement>,
  taskControls: any,
  setModalState: any,
  modalState: any
) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const { dragTooltip, updateTooltip, clearTooltip } = useDragTooltip();
  const { dragPreview, updatePreview, clearPreview, initializePreview, validateFactoryCompatibility } = useDragPreview(projects);
  const { findProjectFromEvent } = useProjectFinder(scrollRef);
  const { handleAutoScroll, stopAutoScroll } = useAutoScroll(scrollRef, modalState.isDraggingTask);

  const handleTaskDragStart = (e: React.DragEvent, task: Task, index: number) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const taskWidth = rect.width;
    
    setDragState({ offsetX, taskWidth });
    setModalState((prev: any) => ({
      ...prev,
      isDraggingTask: true,
      draggedTask: task
    }));
    
    // Set initial tooltip immediately
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    updateTooltip(e.clientX, e.clientY, startDate, endDate);
    
    // Initialize preview with compatible project
    initializePreview(task);
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskIndex', index.toString());
    e.dataTransfer.setData('taskId', task.id.toString());
    
    // Custom drag image
    const dragImage = document.createElement('div');
    dragImage.style.width = '1px';
    dragImage.style.height = '1px';
    dragImage.style.position = 'absolute';
    dragImage.style.top = '-1000px';
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => document.body.removeChild(dragImage), 0);
  };

  const handleTaskDragEnd = () => {
    setModalState((prev: any) => ({
      ...prev,
      isDraggingTask: false,
      draggedTask: null
    }));
    clearTooltip();
    setDragState(null);
    clearPreview();
    stopAutoScroll();
  };

  // Global drag over handler with auto-scroll
  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      if (scrollRef.current && modalState.isDraggingTask && modalState.draggedTask && dragState) {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move';
        
        const rect = scrollRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragState.offsetX;
        const mouseX = e.clientX - rect.left;
        
        // Handle auto-scroll
        handleAutoScroll(mouseX, rect.width);
        
        // Calculate dates
        const startDate = calculateDateFromX(x, cellWidth, days);
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

    if (modalState.isDraggingTask) {
      // Set move cursor globally during drag
      document.body.style.cursor = 'move';
      
      document.addEventListener('dragover', handleGlobalDragOver);
      return () => {
        document.removeEventListener('dragover', handleGlobalDragOver);
        stopAutoScroll();
        // Reset cursor
        document.body.style.cursor = '';
      };
    }
  }, [modalState, dragState, scrollRef, cellWidth, days, handleAutoScroll, updateTooltip, findProjectFromEvent, updatePreview]);

  const handleTaskDragOver = (e: React.DragEvent, modalState: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (scrollRef.current && modalState.draggedTask && dragState) {
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragState.offsetX;
      
      // Calculate dates
      const startDate = calculateDateFromX(x, cellWidth, days);
      const taskDuration = calculateTaskDuration(modalState.draggedTask.startDate, modalState.draggedTask.endDate);
      const endDate = calculateEndDate(startDate, taskDuration);
      
      // Update tooltip
      updateTooltip(e.clientX, e.clientY, startDate, endDate);
      
      // Find and update preview for target project
      const projectId = findProjectFromEvent(e);
      updatePreview(projectId, startDate, endDate, modalState.draggedTask.factory);
    }
  };

  const handleTaskDrop = (e: React.DragEvent, targetProjectId: string, modalState: any) => {
    e.preventDefault();
    e.stopPropagation();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    
    if (!isNaN(taskId) && modalState.draggedTask && scrollRef.current && dragState) {
      const targetProject = projects.find(p => p.id === targetProjectId);
      const draggedTaskFactory = modalState.draggedTask.factory;
      
      // Check factory type compatibility
      if (!validateFactoryCompatibility(draggedTaskFactory, targetProject?.name || '')) {
        const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
        const targetFactory = factories.find(f => f.name === targetProject?.name);
        alert(`${draggedFactory?.type} 공장의 태스크는 ${targetFactory?.type} 공장으로 이동할 수 없습니다.`);
        clearPreview();
        return;
      }
      
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragState.offsetX;
      const newStartDate = calculateDateFromX(x, cellWidth, days);
      const taskDuration = calculateTaskDuration(modalState.draggedTask.startDate, modalState.draggedTask.endDate);
      
      // Find available date range
      const availableRange = findAvailableDateRange(
        targetProjectId,
        newStartDate.toISOString().split('T')[0],
        taskDuration,
        taskControls.tasks,
        taskId
      );
      
      // Update task
      taskControls.updateTask(taskId, {
        projectId: targetProjectId,
        factory: targetProject?.name || modalState.draggedTask.factory,
        startDate: availableRange.startDate,
        endDate: availableRange.endDate
      });
    }
    
    clearPreview();
  };

  return {
    dragTooltip,
    dragPreview,
    handleTaskDragStart,
    handleTaskDragEnd,
    handleTaskDragOver,
    handleTaskDrop
  };
};