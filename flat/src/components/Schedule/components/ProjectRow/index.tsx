import React from 'react';
import type { Participant, Task } from '../../../../types/schedule';
import { getProjectRowCount } from '../../../../utils/taskUtils';
import { getTasksForFactory } from '../../../../utils/scheduleUtils';
import { ProjectRowGrid } from './ProjectRowGrid';
import { ProjectRowTasks } from './ProjectRowTasks';
import { ProjectRowDragPreview } from './ProjectRowDragPreview';
import { ProjectRowResizePreview } from './ProjectRowResizePreview';

interface ProjectRowProps {
  project: Participant;
  tasks: Task[];
  days: Date[];
  cellWidth: number;
  isAddFactoryRow: boolean;
  hoveredTaskId: number | null;
  isDraggingTask: boolean;
  resizePreview: any;
  dragPreview: any;
  draggedTask: Task | null;
  modalState: any;
  scrollRef: React.RefObject<HTMLDivElement>;
  allRows: Participant[];
  onGridClick: (e: React.MouseEvent, projectId: string, date: string) => void;
  onTaskClick: (task: Task) => void;
  onTaskDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onTaskDragEnd: () => void;
  onTaskDragOver: (e: React.DragEvent) => void;
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
  onTaskDragOver,
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
      className={`relative flex ${isAddFactoryRow ? 'bg-white border-b border-gray-200' : 'border-b border-gray-200'} project-row`}
      style={{ height: `${projectHeight}px`, minHeight: '50px' }}
    >
      <div className="flex-1 relative bg-white/50" data-project-id={project.id}>
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
          <div className="absolute inset-0 pointer-events-none">
            <div className="relative h-full pointer-events-auto">
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