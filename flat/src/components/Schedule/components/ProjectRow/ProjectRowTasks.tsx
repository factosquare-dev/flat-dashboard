import React from 'react';
import type { Task, Participant } from '@/types/schedule';
import TaskItem from '../TaskItem';
import { assignTaskRows } from '@/utils/taskUtils';
import { GridCoordinateCalculator } from '../../utils/dragCalculations';

interface ProjectRowTasksProps {
  projectTasks: Task[];
  allRows: Participant[];
  cellWidth: number;
  hoveredTaskId: number | null;
  isDraggingTask: boolean;
  resizePreview: {
    left: number;
    width: number;
    taskId: string;
    direction: 'start' | 'end';
  } | null;
  dragPreview: {
    projectId: string;
    startDate: string;
    endDate: string;
  } | null;
  draggedTask: Task | null;
  scrollRef: React.RefObject<HTMLDivElement>;
  onTaskClick: (task: Task) => void;
  onTaskDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onTaskDragEnd: () => void;
  onTaskDrop: (e: React.DragEvent, projectId: string, dropIndex: number) => void;
  onTaskMouseDown: (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => void;
  onTaskHover: (taskId: number | null) => void;
  onTaskDelete?: (taskId: number) => void;
  factoryId: string;
  factoryName: string;
}

export const ProjectRowTasks: React.FC<ProjectRowTasksProps> = React.memo(({
  projectTasks,
  allRows,
  cellWidth,
  hoveredTaskId,
  isDraggingTask,
  resizePreview,
  dragPreview,
  draggedTask,
  scrollRef,
  onTaskClick,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDrop,
  onTaskMouseDown,
  onTaskHover,
  onTaskDelete,
  factoryId,
  factoryName,
}) => {
  // Assign tasks to rows
  const tasksWithRows = React.useMemo(() => {
    return assignTaskRows(projectTasks, factoryId, factoryName);
  }, [projectTasks, factoryId, factoryName]);

  // Process each task row independently
  const renderTasks = () => {
    const rows: Map<number, JSX.Element[]> = new Map();
    
    tasksWithRows.forEach((task, index) => {
      const rowNumber = task.rowIndex || 0;
      if (!rows.has(rowNumber)) {
        rows.set(rowNumber, []);
      }

      const taskElement = (
        <div
          key={`${task.id}-${index}`}
          className="absolute task-wrapper"
          style={{
            left: `${task.x}px`,
            top: `${10 + rowNumber * 40}px`,
            width: `${task.width}px`,
            height: '30px',
            zIndex: hoveredTaskId === task.id ? 50 : 10
          }}
          onDragOver={(e) => {
            if (isDraggingTask) {
              e.preventDefault();
              e.stopPropagation();
              e.dataTransfer.dropEffect = 'move';
            }
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const gridCalculator = new GridCoordinateCalculator(cellWidth, allRows);
            const dropIndex = gridCalculator.calculateDropIndex(e, scrollRef);
            
            onTaskDrop(e, factoryId, dropIndex);
          }}
        >
          <TaskItem
            task={task}
            startDate={new Date(task.startDate)}
            endDate={new Date(task.endDate)}
            left={0}
            width={task.width || 0}
            top={10 + (task.rowIndex || 0) * 40}
            isDragging={draggedTask?.id === task.id}
            isResizing={resizePreview?.taskId === task.id}
            isHovered={hoveredTaskId === task.id}
            isDraggingAnyTask={isDraggingTask}
            dragPreview={dragPreview}
            allRows={allRows}
            modalState={{ isResizingTask: false, isDraggingTask: isDraggingTask }}
            onDragStart={(e) => onTaskDragStart(e, task, index)}
            onDragEnd={onTaskDragEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => e.preventDefault()}
            onClick={() => onTaskClick(task)}
            onMouseEnter={() => onTaskHover(task.id)}
            onMouseLeave={() => onTaskHover(null)}
            onResizeStart={(e, direction) => onTaskMouseDown(e, task, direction)}
            onDelete={onTaskDelete ? () => onTaskDelete(task.id) : undefined}
          />
        </div>
      );
      
      rows.get(rowNumber)!.push(taskElement);
    });

    // Flatten all rows into a single array
    return Array.from(rows.values()).flat();
  };

  return <>{renderTasks()}</>;
});