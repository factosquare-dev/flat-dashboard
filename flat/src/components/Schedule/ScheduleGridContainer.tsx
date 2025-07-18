import React, { useState } from 'react';
import type { Participant, Task, DragTooltip, ResizePreview } from '../../types/schedule';
import { getDateFromX } from '../../utils/dateUtils';
import ScheduleGrid from './ScheduleGrid';

interface ScheduleGridContainerProps {
  projects: Participant[];
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  taskControls: any;
  dragControls: any;
  modalState: any;
  setModalState: any;
  onDeleteProject: (projectId: string) => void;
}

const ScheduleGridContainer: React.FC<ScheduleGridContainerProps> = ({
  projects,
  tasks,
  days,
  cellWidth,
  scrollRef,
  taskControls,
  dragControls,
  modalState,
  setModalState,
  onDeleteProject
}) => {
  const [dragTooltip, setDragTooltip] = useState<DragTooltip | null>(null);
  const [resizePreview, setResizePreview] = useState<ResizePreview | null>(null);

  const handleTaskClick = (task: Task) => {
    if (!dragControls.isDragClick()) return;
    setModalState((prev: any) => ({
      ...prev,
      selectedTask: task,
      showTaskEditModal: true
    }));
  };

  const handleGridClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('.task-item') && scrollRef.current) {
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - 264;
      const clickedDate = getDateFromX(x, days[0], cellWidth);
      
      const projectElement = target.closest('[data-project-id]');
      if (projectElement) {
        const projectId = projectElement.getAttribute('data-project-id');
        if (projectId) {
          const newTask = taskControls.addTask({
            title: '새 작업',
            projectId,
            startDate: clickedDate.toISOString().split('T')[0],
            endDate: clickedDate.toISOString().split('T')[0],
            details: ''
          });
          setModalState((prev: any) => ({
            ...prev,
            selectedTask: newTask,
            showTaskEditModal: true
          }));
        }
      }
    }
  };

  const handleTaskDragStart = (e: React.DragEvent, task: Task, index: number) => {
    setModalState((prev: any) => ({
      ...prev,
      isDraggingTask: true,
      draggedTask: task
    }));
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('taskIndex', index.toString());
  };

  const handleTaskDragEnd = () => {
    setModalState((prev: any) => ({
      ...prev,
      isDraggingTask: false,
      draggedTask: null
    }));
    setDragTooltip(null);
  };

  const handleTaskDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (scrollRef.current) {
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - 264;
      const hoverDate = getDateFromX(x, days[0], cellWidth);
      setDragTooltip({
        x: e.clientX,
        y: e.clientY,
        date: hoverDate.toISOString().split('T')[0]
      });
    }
  };

  const handleTaskDrop = (e: React.DragEvent, targetProjectId: string, dropIndex: number) => {
    e.preventDefault();
    const dragIndex = parseInt(e.dataTransfer.getData('taskIndex'));
    if (!isNaN(dragIndex) && modalState.draggedTask) {
      taskControls.reorderTasks(dragIndex, dropIndex, targetProjectId);
    }
  };

  const handleTaskMouseDown = (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => {
    e.preventDefault();
    setModalState((prev: any) => ({
      ...prev,
      isResizingTask: true,
      resizingTask: task,
      resizeDirection: direction
    }));
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (modalState.isResizingTask && modalState.resizingTask && modalState.resizeDirection && scrollRef.current) {
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - 264;
      const newDate = getDateFromX(x, days[0], cellWidth);
      const dateStr = newDate.toISOString().split('T')[0];
      
      if (modalState.resizeDirection === 'start') {
        setResizePreview({
          taskId: modalState.resizingTask.id,
          startDate: dateStr,
          endDate: modalState.resizingTask.endDate
        });
      } else {
        setResizePreview({
          taskId: modalState.resizingTask.id,
          startDate: modalState.resizingTask.startDate,
          endDate: dateStr
        });
      }
    }
  };

  const handleMouseUp = () => {
    if (modalState.isResizingTask && modalState.resizingTask && resizePreview) {
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

  const handleProjectDragStart = (e: React.DragEvent, index: number) => {
    setModalState((prev: any) => ({
      ...prev,
      draggedProjectIndex: index
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProjectDragEnd = () => {
    setModalState((prev: any) => ({
      ...prev,
      draggedProjectIndex: null,
      dragOverProjectIndex: null
    }));
  };

  const handleProjectDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleProjectDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (modalState.draggedProjectIndex !== null && modalState.draggedProjectIndex !== dropIndex) {
      console.log('Project drop not implemented yet');
    }
  };

  return (
    <ScheduleGrid
      projects={projects}
      tasks={tasks}
      days={days}
      cellWidth={cellWidth}
      scrollRef={scrollRef}
      hoveredTaskId={modalState.hoveredTaskId}
      draggedProjectIndex={modalState.draggedProjectIndex}
      dragOverProjectIndex={modalState.dragOverProjectIndex}
      isDraggingTask={modalState.isDraggingTask}
      dragTooltip={dragTooltip}
      resizePreview={resizePreview}
      onMouseDown={modalState.isResizingTask ? handleMouseMove : dragControls.handleMouseDown}
      onMouseMove={modalState.isResizingTask ? handleMouseMove : dragControls.handleMouseMove}
      onMouseUp={modalState.isResizingTask ? handleMouseUp : dragControls.handleMouseUp}
      onTaskClick={handleTaskClick}
      onTaskDragStart={handleTaskDragStart}
      onTaskDragEnd={handleTaskDragEnd}
      onTaskDragOver={handleTaskDragOver}
      onTaskDrop={handleTaskDrop}
      onTaskMouseDown={handleTaskMouseDown}
      onTaskHover={(taskId) => setModalState((prev: any) => ({ ...prev, hoveredTaskId: taskId }))}
      onProjectDragStart={handleProjectDragStart}
      onProjectDragEnd={handleProjectDragEnd}
      onProjectDragOver={handleProjectDragOver}
      onProjectDrop={handleProjectDrop}
      onDeleteProject={onDeleteProject}
      onGridClick={handleGridClick}
    />
  );
};

export default ScheduleGridContainer;