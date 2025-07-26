import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../../../utils/cn';
import './TaskList.css';

interface Task {
  id: string;
  name: string;
  completed: boolean;
}

interface TaskListProps {
  projectId: string;
  tasks: Task[];
  onTaskToggle: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = React.memo(({ projectId, tasks, onTaskToggle }) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const progressPercentage = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;
  
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
        {tasks.map((task, index) => (
          <div 
            key={task.id} 
            className={cn(
              'task-list__item',
              task.completed && 'task-list__item--completed'
            )}
          >
            {/* Custom checkbox */}
            <div className="task-list__checkbox-wrapper">
              <input
                type="checkbox"
                id={`task-${projectId}-${task.id}`}
                checked={task.completed}
                onChange={() => onTaskToggle(task.id)}
                className="task-list__checkbox"
              />
              <label
                htmlFor={`task-${projectId}-${task.id}`}
                className="task-list__checkbox-label"
              >
                {task.completed && (
                  <Check className="task-list__checkbox-icon" />
                )}
              </label>
            </div>
            
            {/* Task name */}
            <label 
              htmlFor={`task-${projectId}-${task.id}`}
              className={cn(
                'task-list__name',
                task.completed && 'task-list__name--completed'
              )}
            >
              {task.name}
            </label>
            
            {/* Completion indicator */}
            {task.completed && (
              <Check className="task-list__complete-icon" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;