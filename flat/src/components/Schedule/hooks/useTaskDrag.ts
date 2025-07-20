import { useState, useEffect } from 'react';
import type { Task, DragTooltip } from '../../../types/schedule';
import { findAvailableDateRange } from '../../../utils/taskUtils';
import { factories } from '../../../data/factories';

interface DragState {
  offsetX: number;
  taskWidth: number;
}

// Common date calculation function
const calculateDateFromX = (x: number, cellWidth: number, days: Date[]): Date => {
  const daysFromStart = Math.round(x / cellWidth);
  const clampedDays = Math.max(0, Math.min(daysFromStart, days.length - 1));
  return new Date(days[clampedDays]);
};

export const useTaskDrag = (
  projects: any[],
  days: Date[],
  cellWidth: number,
  scrollRef: React.RefObject<HTMLDivElement>,
  taskControls: any,
  setModalState: any,
  modalState: any
) => {
  const [dragTooltip, setDragTooltip] = useState<DragTooltip | null>(null);
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [dragPreview, setDragPreview] = useState<{ projectId: string; startDate: string; endDate: string } | null>(null);
  const [lastValidProjectId, setLastValidProjectId] = useState<string | null>(null);

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
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('ko-KR', { 
        month: 'short', 
        day: 'numeric' 
      });
    };
    
    const startDate = new Date(task.startDate);
    const endDate = new Date(task.endDate);
    const taskDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    setDragTooltip({
      x: e.clientX,
      y: e.clientY,
      date: `${formatDate(startDate)} ~ ${formatDate(endDate)} (${taskDuration + 1}일)`
    });
    
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
    setLastValidProjectId(null);
  };

  // Global drag over handler with auto-scroll
  useEffect(() => {
    let scrollInterval: NodeJS.Timeout | null = null;
    
    const handleGlobalDragOver = (e: DragEvent) => {
      if (scrollRef.current && modalState.isDraggingTask && modalState.draggedTask && dragState) {
        e.preventDefault();
        e.dataTransfer!.dropEffect = 'move'; // Ensure move cursor instead of not-allowed
        
        const rect = scrollRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragState.offsetX;
        
        // Auto-scroll logic
        const scrollZone = 100; // Pixels from edge to trigger scroll
        const scrollSpeed = 10; // Pixels per frame
        const mouseX = e.clientX - rect.left;
        
        // Clear existing interval
        if (scrollInterval) {
          clearInterval(scrollInterval);
          scrollInterval = null;
        }
        
        // Check if we need to scroll
        if (mouseX < scrollZone) {
          // Scroll left
          scrollInterval = setInterval(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollLeft = Math.max(0, scrollRef.current.scrollLeft - scrollSpeed);
            }
          }, 16); // ~60fps
        } else if (mouseX > rect.width - scrollZone) {
          // Scroll right
          scrollInterval = setInterval(() => {
            if (scrollRef.current) {
              scrollRef.current.scrollLeft = Math.min(
                scrollRef.current.scrollWidth - rect.width,
                scrollRef.current.scrollLeft + scrollSpeed
              );
            }
          }, 16);
        }
        
        // Always show tooltip when dragging - use common calculation
        const startDate = calculateDateFromX(x, cellWidth, days);
        
        // Calculate task duration
        const taskDuration = Math.ceil((new Date(modalState.draggedTask.endDate).getTime() - new Date(modalState.draggedTask.startDate).getTime()) / (1000 * 60 * 60 * 24));
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + taskDuration);
        
        // Format dates for display
        const formatDate = (date: Date) => {
          return date.toLocaleDateString('ko-KR', { 
            month: 'short', 
            day: 'numeric' 
          });
        };
        
        setDragTooltip({
          x: e.clientX,
          y: e.clientY,
          date: `${formatDate(startDate)} ~ ${formatDate(endDate)} (${taskDuration + 1}일)`
        });
        
        // Update preview based on last valid project
        if (lastValidProjectId && dragPreview) {
          setDragPreview({
            projectId: lastValidProjectId,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          });
        }
      }
    };

    if (modalState.isDraggingTask) {
      // Set move cursor globally during drag
      document.body.style.cursor = 'move';
      
      document.addEventListener('dragover', handleGlobalDragOver);
      return () => {
        document.removeEventListener('dragover', handleGlobalDragOver);
        if (scrollInterval) {
          clearInterval(scrollInterval);
        }
        // Reset cursor
        document.body.style.cursor = '';
      };
    }
  }, [modalState, dragState, scrollRef, cellWidth, days]);

  const handleTaskDragOver = (e: React.DragEvent, modalState: any) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (scrollRef.current && modalState.draggedTask && dragState) {
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragState.offsetX;
      // Use common calculation
      const startDate = calculateDateFromX(x, cellWidth, days);
      
      // Calculate task duration
      const taskDuration = Math.ceil((new Date(modalState.draggedTask.endDate).getTime() - new Date(modalState.draggedTask.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + taskDuration);
      
      // Format dates for display
      const formatDate = (date: Date) => {
        return date.toLocaleDateString('ko-KR', { 
          month: 'short', 
          day: 'numeric' 
        });
      };
      
      setDragTooltip({
        x: e.clientX,
        y: e.clientY,
        date: `${formatDate(startDate)} ~ ${formatDate(endDate)} (${taskDuration + 1}일)`
      });
      
      // Find target project - search up the DOM tree
      let element: HTMLElement | null = e.target as HTMLElement;
      let projectRow: HTMLElement | null = null;
      
      // Keep searching up until we find a project row
      while (element && !projectRow) {
        if (element.hasAttribute('data-project-id')) {
          projectRow = element;
        }
        element = element.parentElement;
      }
      
      if (projectRow) {
        const projectId = projectRow.getAttribute('data-project-id');
        if (projectId && projectId !== 'ADD_FACTORY_ROW_ID') {
          const targetProject = projects.find(p => p.id === projectId);
          const draggedTaskFactory = modalState.draggedTask.factory;
          const draggedFactory = factories.find(f => f.name === draggedTaskFactory);
          const targetFactory = factories.find(f => f.name === targetProject?.name);
          
          // Check factory type compatibility
          if (draggedFactory && targetFactory && draggedFactory.type !== targetFactory.type) {
            setDragPreview(null);
          } else {
            setLastValidProjectId(projectId);
            setDragPreview({
              projectId,
              startDate: startDate.toISOString().split('T')[0],
              endDate: endDate.toISOString().split('T')[0]
            });
          }
        } else {
          setDragPreview(null);
        }
      } else {
        // If no project row found, keep last valid preview
        if (lastValidProjectId) {
          setDragPreview({
            projectId: lastValidProjectId,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0]
          });
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
      // Use common calculation
      const newStartDate = calculateDateFromX(x, cellWidth, days);
      
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