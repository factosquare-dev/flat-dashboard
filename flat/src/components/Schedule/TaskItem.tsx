import React from 'react';
import type { Task } from '../../types/schedule';

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
      className={`absolute flex items-center justify-center text-white text-xs font-medium rounded cursor-pointer transition-all ${
        task.color
      } ${isHovered ? 'ring-2 ring-offset-2 ring-blue-400 z-20' : 'z-10'} ${
        task.isCompleted ? 'opacity-60' : ''
      }`}
      style={{
        left: `${task.x}px`,
        width: `${task.width}px`,
        height: '32px',
        top: '50%',
        transform: 'translateY(-50%)'
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
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black hover:bg-opacity-20"
        onMouseDown={(e) => {
          e.stopPropagation();
          onTaskMouseDown(e, task, 'start');
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-black hover:bg-opacity-20"
        onMouseDown={(e) => {
          e.stopPropagation();
          onTaskMouseDown(e, task, 'end');
        }}
      />
      
      {/* Task content */}
      <span className="px-2 truncate pointer-events-none select-none">
        {task.title}
      </span>
    </div>
  );
};

export default TaskItem;