import React from 'react';
import type { Task } from '@/shared/types/schedule';
import { getInteractionState } from '@/shared/utils/schedule/globalState';
import { TaskStatus } from '@/shared/types/enums';
import './TaskItem.css';

interface TaskItemProps {
  task: Task;
  left: number;
  width: number;
  top: number;
  isDragging: boolean;
  isResizing: boolean;
  isHovered: boolean;
  isDraggingAnyTask?: boolean;
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
  left,
  width,
  top,
  isDragging,
  isResizing,
  isHovered,
  isDraggingAnyTask = false,
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
  const isCompleted = task.isCompleted || task.status === TaskStatus.COMPLETED;
  
  
  const isClickBlocked = () => {
    const state = getInteractionState();
    const now = Date.now();
    return state.mode !== 'idle' || now < state.preventClickUntil;
  };
  
  const taskClasses = [
    'task-item',
    'task-item-hover',
    isDraggingAnyTask && !isDragging ? 'pointer-events-none' : 'pointer-events-auto',
    isHovered && !isResizing ? 'ring-2 ring-blue-400 ring-offset-2 shadow-lg scale-[1.02]' : '',
    isResizing ? 'opacity-70 cursor-ew-resize' : isDragging ? 'opacity-20 cursor-grabbing' : 'cursor-grab',
    isCompleted ? 'task-item-completed' : 'task-item-pending',
    isResizing || isDragging ? '' : 'transition-all'
  ].filter(Boolean).join(' ');

  const taskStyle = {
    '--task-left': `${left}px`,
    '--task-width': `${width}px`,
    '--task-top': `${top}px`,
    left: `var(--task-left)`,
    width: `var(--task-width)`,
    top: `var(--task-top)`,
    height: '30px',
    willChange: isResizing ? 'left, width' : 'auto',
    zIndex: isDragging ? 100 : 500
  } as React.CSSProperties;

  return (
    <div
      className={taskClasses}
      style={taskStyle}
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
      <div className="flex items-center gap-1 h-full">
        <div className="truncate font-medium whitespace-nowrap flex-1">
          {task.title || task.taskType}
        </div>
        {/* Factory Assignments Badge */}
        {task.factoryAssignments && task.factoryAssignments.length > 0 && (
          <div className="flex items-center gap-0.5">
            {task.factoryAssignments.length > 1 ? (
              <span className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-full font-medium">
                {task.factoryAssignments.length}개 공장
              </span>
            ) : (
              <span className="px-1.5 py-0.5 text-[10px] bg-gray-100 text-gray-600 rounded-full">
                {task.factoryAssignments[0].factoryName}
              </span>
            )}
          </div>
        )}
      </div>
      
      {/* Resize handles - same size for all tasks */}
      <div
        className={`task-resize-handle task-resize-handle-left ${
          isResizing ? 'task-resize-handle-active' : ''
        }`}
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
        className={`task-resize-handle task-resize-handle-right ${
          isResizing ? 'task-resize-handle-active' : ''
        }`}
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
          className="task-delete-button"
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
    prevProps.isDraggingAnyTask === nextProps.isDraggingAnyTask
  );
});

TaskItem.displayName = 'TaskItem';

export default TaskItem;