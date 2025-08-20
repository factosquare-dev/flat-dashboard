import React, { useCallback } from 'react';
import type { Task, Participant } from '@/types/schedule';

interface TaskFactoryProps {
  project: Participant | undefined;
  task: Task;
  onFactoryDelete?: (factoryId: string) => void;
}

const TaskFactory: React.FC<TaskFactoryProps> = ({ project, task, onFactoryDelete }) => {
  const handleFactoryDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (project && onFactoryDelete && confirm(`${project.name} 공장과 관련된 모든 작업이 삭제됩니다. 계속하시겠습니까?`)) {
      onFactoryDelete(project.id);
    }
  }, [project, onFactoryDelete]);
  if (project) {
    return (
      <div className="group inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
           style={{ 
             backgroundColor: `${project.color}15`,
             color: project.color
           }}>
        <div 
          className="w-1.5 h-1.5 rounded-full" 
          style={{ backgroundColor: project.color }}
        />
        {project.name}
        {onFactoryDelete && (
          <button
            onClick={handleFactoryDelete}
            className="opacity-0 group-hover:opacity-100 ml-1 w-3.5 h-3.5 flex items-center justify-center rounded hover:bg-red-100 transition-opacity"
            title="공장 삭제"
          >
            <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  if (task.factory) {
    return (
      <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
        <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
        {task.factory}
      </div>
    );
  }

  return <span className="text-gray-400 text-xs">-</span>;
};

export default TaskFactory;