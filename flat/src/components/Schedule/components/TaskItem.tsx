import React from 'react';
import type { Task, Participant } from '../../../types/schedule';
import { getInteractionState } from '../utils/globalState';

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
  isDraggingAnyTask?: boolean;
  dragPreview?: { projectId: string; startDate: string; endDate: string } | null;
  allRows?: Participant[];
  modalState?: {
    isResizingTask?: boolean;
    resizingTask?: Task;
    isDraggingTask?: boolean;
  };
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

const TaskItem: React.FC<TaskItemProps> = React.memo(({
  task,
  startDate,
  endDate,
  left,
  width,
  top,
  isDragging,
  isResizing,
  isHovered,
  isDraggingAnyTask = false,
  dragPreview,
  allRows = [],
  modalState,
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
  
  
  const isClickBlocked = () => {
    const state = getInteractionState();
    const now = Date.now();
    return state.mode !== 'idle' || now < state.preventClickUntil;
  };
  
  return (
    <div
      className={`absolute px-3 py-1.5 rounded-lg text-xs group shadow-sm whitespace-nowrap ${
        isDraggingAnyTask && !isDragging ? 'pointer-events-none' : 'pointer-events-auto'
      } ${
        isHovered && !isResizing ? 'ring-2 ring-blue-400 ring-offset-2 shadow-lg scale-[1.02]' : ''
      } ${isResizing ? 'opacity-70 cursor-ew-resize' : isDragging ? 'opacity-20 cursor-grabbing' : 'cursor-grab hover:shadow-lg hover:scale-[1.02]'} ${
        isCompleted
          ? 'bg-blue-500 text-white' 
          : 'bg-white border-2 border-blue-500 text-blue-600'
      } ${isResizing || isDragging ? '' : 'transition-all'}`}
      style={{
        left: `${left}px`,
        width: `${width}px`,
        top: `${top}px`,
        height: '30px',
        willChange: isResizing ? 'left, width' : 'auto',
        zIndex: isDragging ? 100 : 500 // Above grid but below preview and factory names
      }}
      data-task-id={task.id}
      data-task-name={task.title || task.name || task.taskType}
      data-task-date={`${task.startDate}~${task.endDate}`}
      data-task-x={left}
      data-expected-x={task.x}
      draggable={!isResizing}
      onClick={(e) => {
        // Always stop propagation to prevent grid cell clicks
        e.stopPropagation();
        
        const clickBlocked = isClickBlocked();
        const state = getInteractionState();
        
        
        if (isResizing || isDragging || clickBlocked) {
          e.preventDefault();
          return;
        }
        
        onClick(e);
      }}
      onDragStart={(e) => {
        
        // CRITICAL: Prevent drag if resizing any task
        if (isResizing || modalState?.isResizingTask) {
          e.preventDefault();
          return;
        }
        
        // Also prevent if any other interaction is happening
        const state = getInteractionState();
        if (state.mode === 'resizing') {
          e.preventDefault();
          return;
        }
        
        onDragStart(e);
      }}
      onDragEnd={() => {
        onDragEnd();
      }}
      onDragOver={(e) => {
        onDragOver(e);
      }}
      onDrop={(e) => {
        
        // SIMPLIFIED: Just allow drop if there's any drag activity
        onDrop(e);
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="truncate font-medium whitespace-nowrap">{task.title || task.taskType}</div>
      
      {/* Resize handles - same size for all tasks */}
      <div
        className={`absolute -left-1 top-0 bottom-0 w-2 z-30 ${
          isResizing ? 'bg-blue-400 bg-opacity-50' : 'hover:bg-blue-400 hover:bg-opacity-50 group-hover:bg-blue-300 group-hover:bg-opacity-30'
        }`}
        style={{ cursor: 'ew-resize', pointerEvents: 'auto' }}
        draggable={false}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResizeStart(e, 'start');
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onDragStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onMouseEnter={(e) => e.stopPropagation()}
      />
      <div
        className={`absolute -right-1 top-0 bottom-0 w-2 z-30 ${
          isResizing ? 'bg-blue-400 bg-opacity-50' : 'hover:bg-blue-400 hover:bg-opacity-50 group-hover:bg-blue-300 group-hover:bg-opacity-30'
        }`}
        style={{ cursor: 'ew-resize', pointerEvents: 'auto' }}
        draggable={false}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onResizeStart(e, 'end');
        }}
        onMouseUp={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onDragStart={(e) => {
          e.preventDefault();
          e.stopPropagation();
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
}, (prevProps, nextProps) => {
  // 성능 최적화를 위한 props 비교
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task === nextProps.task &&
    prevProps.left === nextProps.left &&
    prevProps.width === nextProps.width &&
    prevProps.top === nextProps.top &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.isResizing === nextProps.isResizing &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.isDraggingAnyTask === nextProps.isDraggingAnyTask &&
    prevProps.startDate === nextProps.startDate &&
    prevProps.endDate === nextProps.endDate
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;