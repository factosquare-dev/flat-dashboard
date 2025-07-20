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
      className={`absolute px-3 py-1.5 rounded-lg text-xs cursor-move transition-all pointer-events-auto group shadow-sm hover:shadow-lg hover:scale-[1.02] ${
        isHovered ? 'ring-2 ring-blue-400 ring-offset-2' : ''
      } ${isResizing ? 'opacity-70' : ''} ${isDragging ? 'opacity-50 cursor-grabbing' : ''} ${
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
      <div className="truncate font-medium">{task.title}</div>
      
      {/* Resize handles */}
      <div
        className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400 hover:bg-opacity-50 z-10 transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart(e, 'start');
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-blue-400 hover:bg-opacity-50 z-10 transition-colors"
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart(e, 'end');
        }}
      />
      
      {/* Delete button */}
      {isHovered && onDelete && (
        <button
          className="absolute w-4 h-4 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg z-20 transform translate-x-1/2 -translate-y-1/2 transition-all"
          style={{
            top: '0',
            right: '0'
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