import { useState } from 'react';
import type { Task, DragTooltip } from '../../../types/schedule';
import { findAvailableDateRange } from '../../../utils/taskUtils';
import { factories } from '../../../data/factories';

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
  setModalState: any
) => {
  const [dragTooltip, setDragTooltip] = useState<DragTooltip | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<{ projectId: string; startDate: string; endDate: string } | null>(null);

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
    setDragTooltip(null);
    setDragState(null);
    setDragPreview(null);
  };

  const handleTaskDragOver = (e: React.DragEvent, modalState: any) => {
    e.preventDefault();
    if (scrollRef.current && modalState.draggedTask && dragState) {
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragState.offsetX;
      const daysFromStart = Math.floor(x / cellWidth);
      const startDate = new Date(days[0]);
      startDate.setDate(startDate.getDate() + daysFromStart);
      
      // Calculate task duration
      const taskDuration = Math.ceil((new Date(modalState.draggedTask.endDate).getTime() - new Date(modalState.draggedTask.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + taskDuration);
      
      setDragTooltip({
        x: e.clientX,
        y: e.clientY,
        date: `${startDate.toISOString().split('T')[0]} ~ ${endDate.toISOString().split('T')[0]}`
      });
      
      // Find target project
      const targetElement = e.target as HTMLElement;
      const projectRow = targetElement.closest('[data-project-id]');
      if (projectRow) {
        const projectId = projectRow.getAttribute('data-project-id');
        if (projectId) {
          const targetProject = projects.find(p => p.id === projectId);
          const draggedTaskFactory = modalState.draggedTask.factory;
          const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
          const targetFactory = factories.find(f => f.name === targetProject?.name);
          
          // Check factory type compatibility
          if (draggedFactory && targetFactory && draggedFactory.type !== targetFactory.type) {
            setDragPreview(null);
          } else {
            setDragPreview({
              projectId,
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0]
            });
          }
        }
      }
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
      const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
      const targetFactory = factories.find(f => f.name === targetProject?.name);
      
      if (draggedFactory && targetFactory && draggedFactory.type !== targetFactory.type) {
        alert(`${draggedFactory.type} 공장의 태스크는 ${targetFactory.type} 공장으로 이동할 수 없습니다.`);
        setDragPreview(null);
        return;
      }
      
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragState.offsetX;
      const daysFromStart = Math.floor(x / cellWidth);
      const newStartDate = new Date(days[0]);
      newStartDate.setDate(newStartDate.getDate() + daysFromStart);
      
      // Maintain task duration
      const taskDuration = Math.ceil((new Date(modalState.draggedTask.endDate).getTime() - new Date(modalState.draggedTask.startDate).getTime()) / (1000 * 60 * 60 * 24));
      
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
    
    setDragPreview(null);
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