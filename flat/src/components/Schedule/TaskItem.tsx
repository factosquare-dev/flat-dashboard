import React from 'react';
import type { Task } from '../../types/schedule';
import { cn } from '@/utils/cn';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  index: number;
  isHovered: boolean;
  onTaskClick: (task: Task) => void;
  onTaskDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  onTaskDragEnd: () => void;
  onTaskDragOver: (e: React.DragEvent) => void;
  onTaskDrop: (e: React.DragEvent, projectId: string, dropIndex: number) => void;
  onTaskMouseDown: (e: React.MouseEvent, task: Task, direction: 'start' | 'end') => void;
  onTaskHover: (taskId: number | null) => void;
  projectId: string;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  index,
  isHovered,
  onTaskClick,
  onTaskDragStart,
  onTaskDragEnd,
  onTaskDragOver,
  onTaskDrop,
  onTaskMouseDown,
  onTaskHover,
  projectId
}) => {

  return (
    <div
      className={cn(
        'task-item',
        task.color,
        isHovered && 'task-item--hovered',
        task.isCompleted && 'task-item--completed'
      )}
      style={{
        left: `${task.x}px`,
        width: `${task.width}px`
      }}
      onClick={() => onTaskClick(task)}
      draggable
      onDragStart={(e) => onTaskDragStart(e, task, index)}
      onDragEnd={onTaskDragEnd}
      onDragOver={onTaskDragOver}
      onDrop={(e) => onTaskDrop(e, projectId, index)}
      onMouseEnter={() => onTaskHover(task.id)}
      onMouseLeave={() => onTaskHover(null)}
    >
      {/* Resize handles */}
      <div
        className="task-item__resize-handle task-item__resize-handle--start"
        onMouseDown={(e) => {
          e.stopPropagation();
          onTaskMouseDown(e, task, 'start');
        }}
      />
      <div
        className="task-item__resize-handle task-item__resize-handle--end"
        onMouseDown={(e) => {
          e.stopPropagation();
          onTaskMouseDown(e, task, 'end');
        }}
      />
      
      {/* Task content */}
      <span className="task-item__content">
        {task.title}
      </span>
    </div>
  );
};

export default TaskItem;