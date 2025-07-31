import React from 'react';
import { Check, AlertCircle } from 'lucide-react';
import { cn } from '../../../utils/cn';
import { TaskStatus } from '../../../types/enums';
import type { Task as ScheduleTask } from '../../../types/schedule';
import './TaskList.css';

interface TaskListProps {
  projectId: string;
  tasks: ScheduleTask[];
  onTaskToggle: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = React.memo(({ projectId, tasks, onTaskToggle }) => {
  const completedCount = tasks.filter(t => t.status === TaskStatus.COMPLETED).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  const today = new Date();
  
  return (
    <div className="task-list">
      {/* Modern accent line */}
      <div className="task-list__accent"></div>
      
      {/* Task count badge */}
      <div className="task-list__header">
        <div className="task-list__count">
          <span className="task-list__count-text">{completedCount}/{tasks.length}</span>
          <div className="task-list__progress-track">
            <div 
              className="task-list__progress-fill"
              style={{ '--task-progress': `${progressPercentage}%` } as React.CSSProperties}
            />
          </div>
        </div>
      </div>
      
      {/* Task list */}
      <div className="task-list__items">
        {tasks.map((task, index) => {
          const isCompleted = task.status === TaskStatus.COMPLETED;
          const endDate = task.endDate ? new Date(task.endDate) : null;
          const isDelayed = endDate && endDate < today && !isCompleted;
          
          return (
          <div 
            key={task.id} 
            className={cn(
              'task-list__item',
              isCompleted && 'task-list__item--completed'
            )}
          >
            {/* Custom checkbox */}
            <div className="task-list__checkbox-wrapper">
              <input
                type="checkbox"
                id={`task-${projectId}-${task.id}`}
                checked={isCompleted}
                onChange={(e) => {
                  e.stopPropagation();
                  onTaskToggle(String(task.id));
                }}
                onClick={(e) => e.stopPropagation()}
                className="task-list__checkbox"
              />
              <label
                htmlFor={`task-${projectId}-${task.id}`}
                className="task-list__checkbox-label"
                onClick={(e) => e.stopPropagation()}
              >
                {isCompleted && (
                  <Check className="task-list__checkbox-icon" />
                )}
              </label>
            </div>
            
            {/* Task name with status icons */}
            <div className="flex items-center flex-1">
              {isCompleted && (
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Check className="w-3 h-3 text-green-600" />
                </div>
              )}
              <label 
                htmlFor={`task-${projectId}-${task.id}`}
                className={cn(
                  'task-list__name',
                  isCompleted && 'task-list__name--completed'
                )}
              >
                {task.name || task.title || ''}
              </label>
              {isDelayed && (
                <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                  <AlertCircle className="w-3 h-3 text-red-600" />
                </div>
              )}
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;