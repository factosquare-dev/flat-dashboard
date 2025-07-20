import React from 'react';
import type { Task } from '../../../types/schedule';

interface TaskItemProps {
  task: Task;
  startDate: Date;
  endDate: Date;
  left: number;
  width: number;
  top: number;
  isDragging: boolean;
  isResizing: boolean;
  isHovered: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onClick: (e: React.MouseEvent) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onResizeStart: (e: React.MouseEvent, direction: 'start' | 'end') => void;
  onDelete?: () => void;
}

const TaskItem: React.FC<TaskItemProps> = ({
  task,
  startDate,
  endDate,
  left,
  width,
  top,
  isDragging,
  isResizing,
  isHovered,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onClick,
  onMouseEnter,
  onMouseLeave,
  onResizeStart,
  onDelete
}) => {
  const isCompleted = task.isCompleted || task.status === 'completed' || task.status === 'approved';
  
  return (
    <div
      className={`absolute px-3 py-1.5 rounded-lg text-xs transition-all pointer-events-auto group shadow-sm hover:shadow-lg hover:scale-[1.02] whitespace-nowrap ${
        isHovered ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      } ${isResizing ? 'opacity-70 cursor-ew-resize' : isDragging ? 'opacity-50 cursor-grabbing' : 'cursor-grab'} ${
        isCompleted
          ? 'bg-blue-500 text-white' 
          : 'bg-white border-2 border-blue-500 text-blue-600'
      }`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        top: `${top}px`,
        height: '30px'
      }}
      draggable
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="truncate font-medium whitespace-nowrap">{task.title}</div>
      
      {/* Resize handles - same size for all tasks */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 hover:bg-blue-400 hover:bg-opacity-50 z-10 transition-colors group-hover:bg-blue-300 group-hover:bg-opacity-30"
        style={{ cursor: 'ew-resize' }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResizeStart(e, 'start');
        }}
        onMouseEnter={(e) => e.stopPropagation()}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-2 hover:bg-blue-400 hover:bg-opacity-50 z-10 transition-colors group-hover:bg-blue-300 group-hover:bg-opacity-30"
        style={{ cursor: 'ew-resize' }}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResizeStart(e, 'end');
        }}
        onMouseEnter={(e) => e.stopPropagation()}
      />
      
      {/* Delete button */}
      {isHovered && onDelete && (
        <button
          className="absolute w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg z-20 transition-all"
          style={{
            top: '-8px',
            right: '-8px'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default TaskItem;