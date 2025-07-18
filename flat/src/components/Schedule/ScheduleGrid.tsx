import React from 'react';
import type { Participant, Task, DragTooltip, ResizePreview } from '../../types/schedule';
import { isToday, isWeekend } from '../../utils/dateUtils';
import TimelineHeader from './TimelineHeader';
import ProjectRow from './ProjectRow';

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
  onGridClick: (e: React.MouseEvent) => void;
}

const ScheduleGrid: React.FC<ScheduleGridProps> = ({
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
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTaskClick,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDragOver,
  onTaskDrop,
  onTaskMouseDown,
  onTaskHover,
  onProjectDragStart,
  onProjectDragEnd,
  onProjectDragOver,
  onProjectDrop,
  onDeleteProject,
  onGridClick
}) => {
  // Find today's position for auto-scroll
  const todayIndex = days.findIndex(day => isToday(day));
  const todayPosition = todayIndex * cellWidth;

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto" ref={scrollRef}>
        <div 
          className="min-w-max"
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onClick={onGridClick}
        >
          <TimelineHeader days={days} cellWidth={cellWidth} />
          
          {/* Project rows */}
          {projects.map((project, index) => (
            <ProjectRow
              key={project.id}
              project={project}
              tasks={tasks}
              days={days}
              cellWidth={cellWidth}
              hoveredTaskId={hoveredTaskId}
              isDraggingProject={draggedProjectIndex === index}
              onTaskClick={onTaskClick}
              onTaskDragStart={onTaskDragStart}
              onTaskDragEnd={onTaskDragEnd}
              onTaskDragOver={onTaskDragOver}
              onTaskDrop={onTaskDrop}
              onTaskMouseDown={onTaskMouseDown}
              onTaskHover={onTaskHover}
              onProjectDragStart={onProjectDragStart}
              onProjectDragEnd={onProjectDragEnd}
              onProjectDragOver={onProjectDragOver}
              onProjectDrop={onProjectDrop}
              onDeleteProject={onDeleteProject}
              projectIndex={index}
              isDragOver={dragOverProjectIndex === index}
            />
          ))}
          
          {/* Today line */}
          {todayIndex >= 0 && (
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 pointer-events-none z-30"
              style={{ left: `${264 + todayPosition}px` }}
            />
          )}
        </div>
      </div>
      
      {/* Drag tooltip */}
      {isDraggingTask && dragTooltip && (
        <div
          className="fixed bg-gray-800 text-white px-2 py-1 rounded text-xs pointer-events-none z-50"
          style={{ left: dragTooltip.x + 10, top: dragTooltip.y - 30 }}
        >
          {dragTooltip.date}
        </div>
      )}
      
      {/* Resize preview */}
      {resizePreview && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg text-sm z-50">
          {resizePreview.startDate} ~ {resizePreview.endDate}
        </div>
      )}
    </div>
  );
};

export default ScheduleGrid;