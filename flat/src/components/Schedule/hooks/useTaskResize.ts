import { useState, useEffect } from 'react';
import type { Task, ResizePreview } from '../../../types/schedule';
import { findAvailableDateRange } from '../../../utils/taskUtils';

export const useTaskResize = (
  days: Date[],
  cellWidth: number,
  scrollRef: React.RefObject<HTMLDivElement>,
  taskControls: any,
  modalState: any,
  setModalState: any
) => {
  const [resizePreview, setResizePreview] = useState<ResizePreview | null>(null);

  const handleTaskMouseDown = (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Resize started:', { task, direction });
    setModalState((prev: any) => ({
      ...prev,
      isResizingTask: true,
      resizingTask: task,
      resizeDirection: direction
    }));
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (modalState.isResizingTask && modalState.resizingTask && modalState.resizeDirection && scrollRef.current) {
      e.preventDefault();
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft;
      const dayIndex = Math.floor(x / cellWidth);
      
      // Ensure dayIndex is within valid range
      if (dayIndex < 0 || dayIndex >= days.length) return;
      
      const newDate = new Date(days[dayIndex]);
      const dateStr = newDate.toISOString().split('T')[0];
      
      const task = modalState.resizingTask;
      let previewStartDate = task.startDate;
      let previewEndDate = task.endDate;
      
      // Get all tasks in the same project except current task
      const projectTasks = taskControls.tasks.filter((t: Task) => 
        t.projectId === task.projectId && t.id !== task.id
      );
      
      if (modalState.resizeDirection === 'start') {
        // Resizing start date
        const endDate = new Date(task.endDate);
        
        // Can't move start date past end date (but can be same date for 1-day task)
        if (newDate > endDate) {
          previewStartDate = endDate.toISOString().split('T')[0];
        } else {
          // Check for overlap with other tasks
          let validDate = dateStr;
          let hasOverlap = false;
          
          for (const otherTask of projectTasks) {
            const otherStart = new Date(otherTask.startDate);
            const otherEnd = new Date(otherTask.endDate);
            
            // Check if new date range would overlap
            if (newDate <= otherEnd && endDate >= otherStart) {
              hasOverlap = true;
              // If overlapping, set to day after other task ends
              validDate = new Date(otherEnd.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              break;
            }
          }
          
          previewStartDate = hasOverlap ? validDate : dateStr;
        }
      } else {
        // Resizing end date
        const startDate = new Date(task.startDate);
        
        // Can't move end date before start date (but can be same date for 1-day task)
        if (newDate < startDate) {
          previewEndDate = startDate.toISOString().split('T')[0];
        } else {
          // Check for overlap with other tasks
          let validDate = dateStr;
          let hasOverlap = false;
          
          for (const otherTask of projectTasks) {
            const otherStart = new Date(otherTask.startDate);
            const otherEnd = new Date(otherTask.endDate);
            
            // Check if new date range would overlap
            if (startDate <= otherEnd && newDate >= otherStart) {
              hasOverlap = true;
              // If overlapping, set to day before other task starts
              validDate = new Date(otherStart.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
              break;
            }
          }
          
          previewEndDate = hasOverlap ? validDate : dateStr;
        }
      }
      
      setResizePreview({
        taskId: task.id,
        startDate: previewStartDate,
        endDate: previewEndDate
      });
    }
  };

  const handleMouseUp = () => {
    if (modalState.isResizingTask && modalState.resizingTask && resizePreview) {
      console.log('Applying resize:', resizePreview);
      // Apply the preview dates directly since we already validated them during resize
      taskControls.updateTask(modalState.resizingTask.id, {
        startDate: resizePreview.startDate,
        endDate: resizePreview.endDate
      });
    }
    setModalState((prev: any) => ({
      ...prev,
      isResizingTask: false,
      resizingTask: null,
      resizeDirection: null
    }));
    setResizePreview(null);
  };

  // Set up global mouse event listeners
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
    };
    
    const handleGlobalMouseUp = (e: MouseEvent) => {
      handleMouseUp();
    };
    
    if (modalState.isResizingTask) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [modalState.isResizingTask, modalState.resizingTask, modalState.resizeDirection]);

  return {
    resizePreview,
    handleTaskMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};