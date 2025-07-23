import React from 'react';
import type { Task, ModalState, Participant } from '../../../../types/schedule';
import type { DragState } from './types';
import { GridCoordinateCalculator, calculateTaskDuration, calculateEndDate } from '../../utils/dragCalculations';
import { findAvailableDateRange } from '../../../../utils/taskUtils';
import { formatDateISO } from '../../../../utils/dateUtils';
import { factories } from '../../../../data/factories';

export const createDropHandler = (
  projects: Participant[],
  days: Date[],
  cellWidth: number,
  scrollRef: React.RefObject<HTMLDivElement>,
  taskControls: any,
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>,
  dragStateRef: React.MutableRefObject<DragState | null>,
  validateFactoryCompatibility: (draggedFactory: string, targetFactory: string) => boolean,
  toastError: (title: string, message: string) => void,
  clearPreview: () => void
) => {
  return (e: React.DragEvent, targetProjectId: string, modalState: ModalState) => {
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
        toastError(
          '태스크 이동 불가',
          `${draggedFactory?.type} 공장의 태스크는 ${targetFactory?.type} 공장으로 이동할 수 없습니다.`
        );
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
        newStartDate: formatDateISO(newStartDate),
        taskDuration
      });
      
      // Find available date range
      const availableRange = findAvailableDateRange(
        targetProjectId,
        formatDateISO(newStartDate),
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
};