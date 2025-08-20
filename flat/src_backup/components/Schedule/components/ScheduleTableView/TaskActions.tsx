import React, { useCallback } from 'react';

interface TaskActionsProps {
  taskId: string;
  onTaskDelete?: (taskId: string) => void;
}

const TaskActions: React.FC<TaskActionsProps> = ({ taskId, onTaskDelete }) => {
  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onTaskDelete && confirm('이 작업을 삭제하시겠습니까?')) {
      onTaskDelete(taskId);
    }
  }, [taskId, onTaskDelete]);

  return (
    <button
      onClick={handleDelete}
      className="inline-flex items-center justify-center w-7 h-7 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
      title="작업 삭제"
    >
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
      </svg>
    </button>
  );
};

export default TaskActions;