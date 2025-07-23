/**
 * GanttChart TaskRenderer component - renders tasks and project headers
 */

import React, { useCallback } from 'react';
import type { Project, Task, DragState } from './types';
import { GANTT_CONSTANTS, totalDays } from './constants';
import { getDateIndex, calculateTaskPosition } from './utils/ganttCalculations';

interface TaskRendererProps {
  projects: Project[];
  dragState: DragState;
  onToggleProject: (projectId: string) => void;
  onMouseDown: (e: React.MouseEvent, task: Task, element: HTMLElement) => void;
}

const TaskRenderer: React.FC<TaskRendererProps> = ({
  projects,
  dragState,
  onToggleProject,
  onMouseDown
}) => {
  // Helper function to calculate task duration
  const getDuration = useCallback((startDate: string, endDate: string): number => {
    const start = getDateIndex(startDate);
    const end = getDateIndex(endDate);
    return end - start + 1;
  }, []);

  // Helper function to render individual project header
  const renderProjectHeader = useCallback((project: Project, row: number) => (
    <button
      key={`project-${project.id}`}
      className={`absolute flex items-center px-2 font-medium text-sm ${project.color} text-white cursor-pointer w-full text-left`}
      style={{
        left: 0,
        top: row * GANTT_CONSTANTS.CELL_HEIGHT,
        width: totalDays * GANTT_CONSTANTS.CELL_WIDTH,
        height: GANTT_CONSTANTS.CELL_HEIGHT
      }}
      onClick={() => onToggleProject(project.id)}
      aria-expanded={project.expanded}
      aria-label={`${project.name} 프로젝트 ${project.expanded ? '접기' : '펼치기'}`}
    >
      <span className="mr-2" aria-hidden="true">{project.expanded ? '▼' : '▶'}</span>
      {project.name}
    </button>
  ), [onToggleProject]);

  // Helper function to render individual task
  const renderTask = useCallback((task: Task, row: number) => {
    const startCol = getDateIndex(task.startDate);
    const duration = getDuration(task.startDate, task.endDate);
    const isDragging = dragState.isDragging && dragState.draggedTask?.id === task.id;
    
    return (
      <div
        key={`task-${task.id}`}
        className={`absolute flex items-center px-2 text-xs text-white rounded shadow-sm cursor-move ${
          task.color
        } ${isDragging ? 'opacity-0' : 'hover:opacity-90'}`}
        style={{
          left: startCol * GANTT_CONSTANTS.CELL_WIDTH + 2,
          top: row * GANTT_CONSTANTS.CELL_HEIGHT + 4,
          width: duration * GANTT_CONSTANTS.CELL_WIDTH - 4,
          height: GANTT_CONSTANTS.CELL_HEIGHT - 8
        }}
        onMouseDown={(e) => onMouseDown(e, task, e.currentTarget)}
      >
        <span className="truncate">{task.title}</span>
      </div>
    );
  }, [dragState.isDragging, dragState.draggedTask, onMouseDown, getDuration]);

  // Render preview indicator for drag operations
  const renderPreviewIndicator = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedTask || !dragState.hoveredCell) return null;
    
    const duration = getDuration(dragState.draggedTask.startDate, dragState.draggedTask.endDate);
    const { row, col } = dragState.hoveredCell;
    
    return (
      <div
        className="absolute border-2 border-blue-400 bg-blue-100 opacity-60 rounded pointer-events-none z-30"
        style={{
          left: col * GANTT_CONSTANTS.CELL_WIDTH + 2,
          top: row * GANTT_CONSTANTS.CELL_HEIGHT + 4,
          width: duration * GANTT_CONSTANTS.CELL_WIDTH - 4,
          height: GANTT_CONSTANTS.CELL_HEIGHT - 8
        }}
      />
    );
  }, [dragState.isDragging, dragState.draggedTask, dragState.hoveredCell, getDuration]);

  // Render ghost task during drag
  const renderGhostTask = useCallback(() => {
    if (!dragState.isDragging || !dragState.draggedTask || !dragState.ghostPosition) return null;
    
    const duration = getDuration(dragState.draggedTask.startDate, dragState.draggedTask.endDate);
    
    return (
      <div
        className={`absolute flex items-center px-2 text-xs text-white rounded shadow-lg cursor-move opacity-80 z-40 ${dragState.draggedTask.color}`}
        style={{
          left: dragState.ghostPosition.x,
          top: dragState.ghostPosition.y,
          width: duration * GANTT_CONSTANTS.CELL_WIDTH - 4,
          height: GANTT_CONSTANTS.CELL_HEIGHT - 8,
          pointerEvents: 'none'
        }}
      >
        <span className="truncate">{dragState.draggedTask.title}</span>
      </div>
    );
  }, [dragState.isDragging, dragState.draggedTask, dragState.ghostPosition, getDuration]);

  // Main render function
  const renderTasks = () => {
    const elements: JSX.Element[] = [];
    let currentRow = 0;
    
    projects.forEach((project) => {
      // Project header
      elements.push(renderProjectHeader(project, currentRow));
      currentRow++;
      
      // Tasks
      if (project.expanded) {
        project.tasks.forEach((task) => {
          elements.push(renderTask(task, currentRow));
          currentRow++;
        });
      }
    });
    
    return elements;
  };

  return (
    <div className="absolute inset-0 z-10">
      {renderTasks()}
      {renderPreviewIndicator()}
      {renderGhostTask()}
    </div>
  );
};

export default TaskRenderer;