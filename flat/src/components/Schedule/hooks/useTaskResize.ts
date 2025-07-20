import { useState } from 'react';
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
    setModalState((prev: any) => ({
      ...prev,
      isResizingTask: true,
      resizingTask: task,
      resizeDirection: direction
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (modalState.isResizingTask && modalState.resizingTask && modalState.resizeDirection && scrollRef.current) {
      e.preventDefault();
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft;
      const daysFromStart = Math.floor(x / cellWidth);
      const newDate = new Date(days[0]);
      newDate.setDate(newDate.getDate() + daysFromStart);
      const dateStr = newDate.toISOString().split('T')[0];
      
      // Prevent start and end dates from crossing
      if (modalState.resizeDirection === 'start') {
        const endDate = new Date(modalState.resizingTask.endDate);
        if (newDate <= endDate) {
          setResizePreview({
            taskId: modalState.resizingTask.id,
            startDate: dateStr,
            endDate: modalState.resizingTask.endDate
          });
        }
      } else {
        const startDate = new Date(modalState.resizingTask.startDate);
        if (newDate >= startDate) {
          setResizePreview({
            taskId: modalState.resizingTask.id,
            startDate: modalState.resizingTask.startDate,
            endDate: dateStr
          });
        }
      }
    }
  };

  const handleMouseUp = () => {
    if (modalState.isResizingTask && modalState.resizingTask && resizePreview) {
      // Find available date range when resizing
      const duration = Math.ceil((new Date(resizePreview.endDate).getTime() - new Date(resizePreview.startDate).getTime()) / (1000 * 60 * 60 * 24));
      const availableRange = findAvailableDateRange(
        modalState.resizingTask.projectId,
        resizePreview.startDate,
        duration,
        taskControls.tasks,
        modalState.resizingTask.id
      );
      
      taskControls.updateTask(modalState.resizingTask.id, {
        startDate: availableRange.startDate,
        endDate: availableRange.endDate
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

  return {
    resizePreview,
    handleTaskMouseDown,
    handleMouseMove,
    handleMouseUp
  };
};