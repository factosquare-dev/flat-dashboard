import React from 'react';
import type { Participant, Task, TaskControls, DragControls, ModalState } from '../../types/schedule';
import { findAvailableDateRange } from '../../utils/taskUtils';
import ScheduleGrid from './ScheduleGrid';
import { factories, taskTypesByFactoryType } from '../../data/factories';
import { useTaskDrag } from './hooks/useTaskDrag';
import { useTaskResize } from './hooks/useTaskResize';
import DragPreview from './components/DragPreview';

interface ScheduleGridContainerProps {
  projects: Participant[];
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  taskControls: TaskControls;
  dragControls: DragControls;
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  selectedProjects: string[];
  setProjects: (projects: Participant[]) => void;
  onDeleteProject: (projectId: string) => void;
  onProjectSelect: (projectId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onAddFactory?: () => void;
  onTaskCreate?: (task: { projectId: string; factory: string; startDate: string; endDate: string }) => void;
  onGridWidthChange?: (width: number) => void;
}

import { getInteractionState, setInteractionMode, setPreventClickUntil } from './utils/globalState';
import { SCHEDULE_CONSTANTS } from './constants';

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
  selectedProjects,
  setProjects,
  onDeleteProject,
  onProjectSelect,
  onSelectAll,
  onAddFactory,
  onTaskCreate,
  onGridWidthChange
}) => {
  // Task drag hooks
  const {
    dragTooltip,
    dragPreview,
    handleTaskDragStart,
    handleTaskDragEnd: originalHandleTaskDragEnd,
    handleTaskDragOver,
    handleTaskDrop
  } = useTaskDrag(projects, days, cellWidth, scrollRef, taskControls, setModalState, modalState);
  
  // Wrap handleTaskDragEnd to update interaction state
  const handleTaskDragEnd = () => {
    originalHandleTaskDragEnd();
    // Update interaction state
    setInteractionMode('idle');
    setPreventClickUntil(Date.now() + SCHEDULE_CONSTANTS.INTERACTION_PREVENTION_DELAY);
  };

  // Task resize hooks  
  const {
    resizePreview,
    hoveredDateIndex,
    snapIndicatorX,
    handleTaskMouseDown,
    handleMouseMove,
    handleMouseUp: originalHandleMouseUp
  } = useTaskResize(days, cellWidth, scrollRef, taskControls, modalState, setModalState);
  
  
  // Note: handleMouseUp in useTaskResize already handles interaction state
  // No need to wrap it here

  const handleTaskClick = (task: Task) => {
    // Allow task clicks if it's a simple click (not a drag)
    if (dragControls.isDragClick() || !modalState.isDragging) {
      setModalState((prev: any) => ({
        ...prev,
        selectedTask: task,
        showTaskEditModal: true
      }));
    }
  };

  const handleGridClick = (e: React.MouseEvent, projectId: string, date: string) => {
    // Check interaction state
    const now = Date.now();
    const state = getInteractionState();
    if (state.mode !== 'idle' || now < state.preventClickUntil) {
      return;
    }
    
    // Additional safety check for ongoing operations
    if (modalState.isDraggingTask || modalState.isResizingTask) {
      return;
    }
    
    // Clear any lingering drag/resize state when opening modal
    setModalState((prev: any) => ({
      ...prev,
      showTaskModal: true,
      selectedProjectId: projectId,
      selectedDate: date,
      selectedFactory: projects.find(p => p.id === projectId)?.name || '',
      // Clear drag states
      isDraggingTask: false,
      draggedTask: null,
      isResizingTask: false,
      resizingTask: null,
      resizeDirection: null
    }));
  };

  const handleQuickTaskCreate = (taskData: { projectId: string; factory: string; startDate: string; endDate: string }) => {
    const factory = factories.find(f => f.name === taskData.factory);
    const defaultTaskType = factory ? taskTypesByFactoryType[factory.type]?.[0] || '태스크' : '태스크';
    
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      taskData.projectId,
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: taskData.projectId,
      title: defaultTaskType,
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory
    });
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
      const newProjects = [...projects];
      const [draggedProject] = newProjects.splice(modalState.draggedProjectIndex, 1);
      
      // Insert at the new position
      newProjects.splice(dropIndex, 0, draggedProject);
      
      // Update the projects state
      setProjects(newProjects);
      
      // Reset drag state
      setModalState(prev => ({
        ...prev,
        draggedProjectIndex: null,
        dragOverProjectIndex: null
      }));
    }
  };

  return (
    <div className="h-full">
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
        hoveredDateIndex={hoveredDateIndex}
        snapIndicatorX={snapIndicatorX}
        dragPreview={dragPreview} // Restore preview to grid for proper scrolling
        draggedTask={modalState.draggedTask}
        selectedProjects={selectedProjects}
        modalState={modalState}
        setModalState={setModalState}
        setProjects={setProjects}
        onMouseDown={dragControls.handleMouseDown}
        onMouseMove={modalState.isResizingTask ? handleMouseMove : dragControls.handleMouseMove}
        onMouseUp={modalState.isResizingTask ? originalHandleMouseUp : dragControls.handleMouseUp}
        onTaskClick={handleTaskClick}
        onTaskDragStart={handleTaskDragStart}
        onTaskDragEnd={handleTaskDragEnd}
        onTaskDragOver={(e) => handleTaskDragOver(e, modalState)}
        onTaskDrop={(e, projectId, taskIndex) => handleTaskDrop(e, projectId, modalState)}
        onTaskMouseDown={handleTaskMouseDown}
        onTaskHover={(taskId) => setModalState((prev: any) => ({ ...prev, hoveredTaskId: taskId }))}
        onProjectDragStart={handleProjectDragStart}
        onProjectDragEnd={handleProjectDragEnd}
        onProjectDragOver={handleProjectDragOver}
        onProjectDrop={handleProjectDrop}
        onDeleteProject={onDeleteProject}
        onGridClick={handleGridClick}
        onProjectSelect={onProjectSelect}
        onSelectAll={onSelectAll}
        onAddFactory={onAddFactory}
        onTaskCreate={onTaskCreate || handleQuickTaskCreate}
        onTaskDelete={(taskId) => taskControls.deleteTask(taskId)}
      />
    </div>
  );
};

export default ScheduleGridContainer;