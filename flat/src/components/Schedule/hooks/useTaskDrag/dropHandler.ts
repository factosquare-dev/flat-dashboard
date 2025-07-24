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
    
    const taskIdStr = e.dataTransfer.getData('taskId');
    const taskId = parseInt(taskIdStr);
    
    if (!isNaN(taskId) && modalState.draggedTask && scrollRef.current && dragStateRef.current) {
      const targetProject = projects.find(p => p.id === targetProjectId);
      const draggedTaskFactory = modalState.draggedTask.factory;
      
      // Check factory type compatibility
      if (!validateFactoryCompatibility(draggedTaskFactory, targetProject?.name || '')) {
        const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
        const targetFactory = factories.find(f => f.name === targetProject?.name);
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
      
      // Find available date range
      const availableRange = findAvailableDateRange(
        targetProjectId,
        formatDateISO(newStartDate),
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
    
    // Always clear state after drop attempt
    clearPreview();
    setModalState((prev) => ({
      ...prev,
      isDraggingTask: false,
      draggedTask: null
    }));
    dragStateRef.current = null;
  };
};