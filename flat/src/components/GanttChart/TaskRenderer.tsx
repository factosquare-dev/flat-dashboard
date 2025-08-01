/**
 * GanttChart TaskRenderer component - renders tasks and project headers
 */

import React, { useCallback } from 'react';
import { logger } from '@/utils/logger';
import type { Project, Task, DragState } from './types';
import { GANTT_CONSTANTS, getTotalDays } from './constants';
import { getDateIndex } from './utils/ganttCalculations';

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
  const totalDays = getTotalDays();
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
  ), [onToggleProject, totalDays]);

  // Helper function to render individual task
  const renderTask = useCallback((task: Task, row: number) => {
    const startCol = getDateIndex(task.startDate);
    const duration = getDuration(task.startDate, task.endDate);
    const isDragging = dragState.isDragging && dragState.draggedTask?.id === task.id;
    
    // Debug logging for first task
    if (task.title === '원료 수령') {
      logger.debug('[TaskRenderer] Rendering task', {
        title: task.title,
        startDate: task.startDate,
        startCol,
        cellWidth: GANTT_CONSTANTS.CELL_WIDTH,
        xPosition: startCol * GANTT_CONSTANTS.CELL_WIDTH
      });
    }
    
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
    
    logger.debug('[TaskRenderer] Rendering projects', { count: projects.length });
    
    projects.forEach((project) => {
      // Project header
      elements.push(renderProjectHeader(project, currentRow));
      currentRow++;
      
      // Tasks
      if (project.expanded) {
        logger.debug('[TaskRenderer] Project expanded', {
          projectName: project.name,
          taskCount: project.tasks.length
        });
        project.tasks.forEach((task) => {
          elements.push(renderTask(task, currentRow));
          currentRow++;
        });
      } else {
        logger.debug('[TaskRenderer] Project collapsed', {
          projectName: project.name
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

// Custom comparison function for React.memo
const arePropsEqual = (prevProps: TaskRendererProps, nextProps: TaskRendererProps) => {
  // Check if projects array reference or length changed
  if (prevProps.projects !== nextProps.projects || 
      prevProps.projects.length !== nextProps.projects.length) {
    return false;
  }
  
  // Check if drag state changed
  if (prevProps.dragState.isDragging !== nextProps.dragState.isDragging ||
      prevProps.dragState.draggedTask?.id !== nextProps.dragState.draggedTask?.id ||
      prevProps.dragState.hoveredCell?.row !== nextProps.dragState.hoveredCell?.row ||
      prevProps.dragState.hoveredCell?.col !== nextProps.dragState.hoveredCell?.col ||
      prevProps.dragState.ghostPosition?.x !== nextProps.dragState.ghostPosition?.x ||
      prevProps.dragState.ghostPosition?.y !== nextProps.dragState.ghostPosition?.y) {
    return false;
  }
  
  // Check if callbacks changed (they should be memoized with useCallback in parent)
  if (prevProps.onToggleProject !== nextProps.onToggleProject ||
      prevProps.onMouseDown !== nextProps.onMouseDown) {
    return false;
  }
  
  return true;
};

export default React.memo(TaskRenderer, arePropsEqual);