import React from 'react';
import type { Participant, Task, DragTooltip, ResizePreview } from '../../types/schedule';
import { useProjectDragSelection } from './hooks/useProjectDragSelection';
import ScheduleProjectColumn from './components/ScheduleProjectColumn';
import ScheduleTimelineGrid from './components/ScheduleTimelineGrid';
import DragTooltipComponent from './components/DragTooltip';
import ResizePreviewComponent from './components/ResizePreview';
import ResizeIndicator from './components/ResizeIndicator';

interface ScheduleGridProps {
  projects: Participant[];
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  hoveredTaskId: number | null;
  draggedProjectIndex: number | null;
  dragOverProjectIndex: number | null;
  isDraggingTask: boolean;
  dragTooltip: DragTooltip | null;
  resizePreview: ResizePreview | null;
  hoveredDateIndex: number | null;
  snapIndicatorX: number | null;
  dragPreview: { projectId: string; startDate: string; endDate: string } | null;
  draggedTask: Task | null;
  selectedProjects: string[];
  modalState: any;
  setModalState: any;
  setProjects: (projects: Participant[]) => void;
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onTaskClick: (task: Task) => void;
  onTaskDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onTaskDragEnd: () => void;
  onTaskDragOver: (e: React.DragEvent) => void;
  onTaskDrop: (e: React.DragEvent, projectId: string, dropIndex: number) => void;
  onTaskMouseDown: (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => void;
  onTaskHover: (taskId: number | null) => void;
  onProjectDragStart: (e: React.DragEvent, index: number) => void;
  onProjectDragEnd: () => void;
  onProjectDragOver: (e: React.DragEvent) => void;
  onProjectDrop: (e: React.DragEvent, index: number) => void;
  onDeleteProject: (projectId: string) => void;
  onGridClick: (e: React.MouseEvent, projectId: string, date: string) => void;
  onProjectSelect: (projectId: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onAddFactory?: () => void;
  onTaskCreate?: (task: { projectId: string; factory: string; startDate: string; endDate: string }) => void;
  onTaskDelete?: (taskId: number) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = (props) => {
  const {
    projects,
    tasks,
    days,
    cellWidth,
    scrollRef,
    hoveredTaskId,
    draggedProjectIndex,
    dragOverProjectIndex,
    isDraggingTask,
    dragTooltip,
    resizePreview,
    hoveredDateIndex,
    snapIndicatorX,
    dragPreview,
    draggedTask,
    selectedProjects,
    modalState,
    setModalState,
    setProjects,
    onProjectSelect,
    onDeleteProject,
    onGridClick,
    onTaskCreate,
    onTaskDelete,
    onSelectAll,
    onProjectDragStart,
    onProjectDragEnd,
    onProjectDrop,
    onAddFactory,
    onTaskClick,
    onTaskDragStart,
    onTaskDragEnd,
    onTaskDragOver,
    onTaskDrop,
    onTaskMouseDown,
    onTaskHover,
    // ... other props
  } = props;

  // Use project drag selection hook
  const {
    isDragSelecting,
    dragStartIndex,
    dragEndIndex,
    handleProjectMouseDown,
    handleProjectMouseEnter
  } = useProjectDragSelection({
    projects,
    selectedProjects,
    onProjectSelect
  });

  return (
    <div 
      className="bg-white flex h-full overflow-hidden relative"
      onMouseMove={props.onMouseMove}
      onMouseUp={props.onMouseUp}
    >
      {/* Fixed left column - Project names */}
      <ScheduleProjectColumn
        projects={projects}
        tasks={tasks}
        selectedProjects={selectedProjects}
        draggedProjectIndex={draggedProjectIndex}
        dragOverProjectIndex={dragOverProjectIndex}
        modalState={modalState}
        setModalState={setModalState}
        onProjectSelect={onProjectSelect}
        onSelectAll={onSelectAll}
        onDeleteProject={onDeleteProject}
        onProjectDragStart={onProjectDragStart}
        onProjectDragEnd={onProjectDragEnd}
        onProjectDrop={onProjectDrop}
        onProjectMouseDown={handleProjectMouseDown}
        onProjectMouseEnter={handleProjectMouseEnter}
        onAddFactory={onAddFactory}
      />
      
      {/* Scrollable right column - Gantt chart */}
      <div 
        className="flex-1" 
        ref={scrollRef}
        style={{ 
          overflowX: 'auto',
          overflowY: 'hidden',
          backgroundColor: 'rgba(249, 250, 251, 0.3)'
        }}
      >
        <ScheduleTimelineGrid
          projects={projects}
          tasks={tasks}
          days={days}
          cellWidth={cellWidth}
          hoveredTaskId={hoveredTaskId}
          isDraggingTask={isDraggingTask}
          resizePreview={resizePreview}
          dragPreview={dragPreview}
          draggedTask={draggedTask}
          modalState={modalState}
          onGridClick={onGridClick}
          onTaskClick={onTaskClick}
          onTaskDragStart={onTaskDragStart}
          onTaskDragEnd={onTaskDragEnd}
          onTaskDragOver={onTaskDragOver}
          onTaskDrop={onTaskDrop}
          onTaskMouseDown={onTaskMouseDown}
          onTaskHover={onTaskHover}
          onTaskCreate={onTaskCreate}
          onTaskDelete={onTaskDelete}
        />
      </div>
      
      {/* Tooltips and Indicators */}
      {isDraggingTask && dragTooltip && (
        <DragTooltipComponent tooltip={dragTooltip} />
      )}
      
      {resizePreview && (
        <ResizePreviewComponent preview={resizePreview} />
      )}
    </div>
  );
};

export default ScheduleGrid;