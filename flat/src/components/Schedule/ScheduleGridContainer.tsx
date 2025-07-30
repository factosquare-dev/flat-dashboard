import React from 'react';
import type { ScheduleFactory, Task, TaskControls, DragControls, ModalState } from '../../types/schedule';
import { findAvailableDateRange } from '../../utils/taskUtils';
import ScheduleGrid from './ScheduleGrid';
import { factories, taskTypesByFactoryType } from '../../data/factories';
import { useTaskDrag } from './hooks/useTaskDrag';
import { useTaskResize } from './hooks/useTaskResize';

interface ScheduleGridContainerProps {
  projects: ScheduleFactory[];
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  taskControls: TaskControls;
  dragControls: DragControls;
  modalState: ModalState;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  selectedProjects: string[];
  setProjects: (projects: ScheduleFactory[]) => void;
  onDeleteProject: (projectId: string) => void;
  onProjectSelect: (projectId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onAddFactory?: () => void;
  onTaskCreate?: (task: { projectId: string; factoryId: string; factory: string; startDate: string; endDate: string }) => void;
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
  onTaskCreate
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
      setModalState(prev => ({
        ...prev,
        selectedTask: task,
        showTaskEditModal: true
      }));
    }
  };

  const handleGridClick = (e: React.MouseEvent, factoryId: string, date: string) => {
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
    setModalState((prev: ModalState) => ({
      ...prev,
      showTaskModal: true,
      selectedFactoryId: factoryId,
      selectedDate: date,
      selectedFactory: projects.find(p => p.id === factoryId)?.name || '',
      // Clear drag states
      isDraggingTask: false,
      draggedTask: null,
      isResizingTask: false,
      resizingTask: null,
      resizeDirection: null
    }));
  };

  const handleQuickTaskCreate = (taskData: { projectId: string; factoryId: string; factory: string; startDate: string; endDate: string }) => {
    const factory = factories.find(f => f.id === taskData.factoryId);
    const defaultTaskType = factory ? taskTypesByFactoryType[factory.type]?.[0] || '태스크' : '태스크';
    
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      taskData.projectId, // 이제 올바른 projectId
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: taskData.projectId, // 올바른 projectId
      title: defaultTaskType,
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: factory?.name || taskData.factory,
      factoryId: taskData.factoryId // factoryId 추가
    });
  };

  const handleProjectDragStart = (e: React.DragEvent, index: number) => {
    setModalState((prev: ModalState) => ({
      ...prev,
      draggedProjectIndex: index
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleProjectDragEnd = () => {
    setModalState((prev: ModalState) => ({
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
    <div className="h-full overflow-y-auto">
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
        dragPreview={dragPreview}
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
        onTaskDrop={(e, projectId) => handleTaskDrop(e, projectId, modalState)}
        onTaskMouseDown={handleTaskMouseDown}
        onTaskHover={(taskId) => setModalState(prev => ({ ...prev, hoveredTaskId: taskId }))}
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