import React from 'react';
import type { Participant, Task } from '../../../../types/schedule';
import { getProjectRowCount } from '../../../../utils/taskUtils';
import { getTasksForFactory } from '../../../../utils/scheduleUtils';
import { ProjectRowGrid } from './ProjectRowGrid';
import { ProjectRowTasks } from './ProjectRowTasks';
import { ProjectRowDragPreview } from './ProjectRowDragPreview';
import { ProjectRowResizePreview } from './ProjectRowResizePreview';
import { cn } from '../../../../utils/cn';
import './ProjectRow.css';

interface ProjectRowProps {
  project: Participant;
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  isAddFactoryRow: boolean;
  hoveredTaskId: number | null;
  isDraggingTask: boolean;
  resizePreview: {
    left: number;
    width: number;
    taskId: string;
    direction: 'start' | 'end';
    targetProjectId?: string;
  } | null;
  dragPreview: {
    projectId: string;
    startDate: string;
    endDate: string;
    targetProjectId?: string;
    dropX?: number;
    width?: number;
  } | null;
  draggedTask: Task | null;
  modalState: {
    isResizingTask?: boolean;
    isDraggingTask?: boolean;
  };
  scrollRef: React.RefObject<HTMLDivElement>;
  allRows: Participant[];
  onGridClick: (e: React.MouseEvent, projectId: string, date: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onTaskDragEnd: () => void;
  onTaskDrop: (e: React.DragEvent, projectId: string, dropIndex: number) => void;
  onTaskMouseDown: (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => void;
  onTaskHover: (taskId: number | null) => void;
  onTaskDelete?: (taskId: number) => void;
}

const ProjectRow: React.FC<ProjectRowProps> = React.memo(({
  project,
  tasks,
  days,
  cellWidth,
  isAddFactoryRow,
  hoveredTaskId,
  isDraggingTask,
  resizePreview,
  dragPreview,
  draggedTask,
  modalState,
  scrollRef,
  allRows,
  onGridClick,
  onTaskClick,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDrop,
  onTaskMouseDown,
  onTaskHover,
  onTaskDelete
}) => {
  // Use common filtering logic for consistency with Table View
  const projectTasks = React.useMemo(() => 
    getTasksForFactory(tasks, project), 
    [tasks, project]
  );
  
  // Calculate row dimensions
  const rowCount = isAddFactoryRow ? 1 : getProjectRowCount(project.id, tasks, project.name);
  const projectHeight = isAddFactoryRow ? 50 : Math.max(50, rowCount * 40 + 20);


  return (
    <div
      key={project.id}
      className={cn(
        'project-row',
        isAddFactoryRow && 'project-row--add-factory'
      )}
      style={{ '--project-height': `${projectHeight}px` } as React.CSSProperties}
    >
      <div className="project-row__content" data-project-id={project.id}>
        {/* Grid Cells Layer */}
        <ProjectRowGrid
          days={days}
          cellWidth={cellWidth}
          projectId={project.id}
          isAddFactoryRow={isAddFactoryRow}
          modalState={modalState}
          onGridClick={onGridClick}
        />

        {/* Tasks Layer */}
        {!isAddFactoryRow && projectTasks.length > 0 && (
          <div className="project-row__overlay">
            <div className="project-row__overlay-content">
              <ProjectRowTasks
                projectTasks={projectTasks}
                allRows={allRows}
                cellWidth={cellWidth}
                hoveredTaskId={hoveredTaskId}
                isDraggingTask={isDraggingTask}
                resizePreview={resizePreview}
                dragPreview={dragPreview}
                draggedTask={draggedTask}
                scrollRef={scrollRef}
                onTaskClick={onTaskClick}
                onTaskDragStart={onTaskDragStart}
                onTaskDragEnd={onTaskDragEnd}
                onTaskDrop={onTaskDrop}
                onTaskMouseDown={onTaskMouseDown}
                onTaskHover={onTaskHover}
                onTaskDelete={onTaskDelete}
                factoryId={project.id}
                factoryName={project.name}
              />
            </div>
          </div>
        )}

        {/* Drag Preview Layer */}
        {dragPreview && dragPreview.targetProjectId === project.id && (
          <ProjectRowDragPreview
            dragPreview={dragPreview}
            cellWidth={cellWidth}
          />
        )}

        {/* Resize Preview Layer */}
        {resizePreview && 
         resizePreview.targetProjectId === project.id && 
         resizePreview.taskId && 
         !modalState.isDraggingTask && (
          <ProjectRowResizePreview
            resizePreview={resizePreview}
          />
        )}
      </div>
    </div>
  );
});

ProjectRow.displayName = 'ProjectRow';

export default ProjectRow;