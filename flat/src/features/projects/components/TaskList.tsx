import React from 'react';
import { Check } from 'lucide-react';

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
  
  return (
    <div className="relative bg-white px-4 py-2 ml-10">
      {/* Modern accent line */}
      <div className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r"></div>
      
      {/* Task count badge */}
      <div className="flex items-center justify-end mb-1 pl-2">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{completedCount}/{tasks.length}</span>
          <div className="w-10 h-1 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-400 to-green-400 rounded-full transition-all duration-300"
              style={{ width: `${(completedCount / tasks.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Task list */}
      <div className="space-y-0.5 ml-6">
        {tasks.map((task, index) => (
          <div 
            key={task.id} 
            className={`group flex items-center gap-2 px-2 py-1.5 rounded transition-all duration-150 ${
              task.completed 
                ? 'hover:bg-gray-50' 
                : 'hover:bg-blue-50/50'
            }`}
          >
            {/* Custom checkbox */}
            <div className="relative">
              <input
                type="checkbox"
                id={`task-${projectId}-${task.id}`}
                checked={task.completed}
                onChange={() => onTaskToggle(task.id)}
                className="sr-only"
              />
              <label
                htmlFor={`task-${projectId}-${task.id}`}
                className={`flex items-center justify-center w-4 h-4 rounded border cursor-pointer transition-all duration-150 ${
                  task.completed
                    ? 'bg-gradient-to-br from-green-400 to-green-500 border-green-500'
                    : 'border-gray-300 hover:border-blue-400 group-hover:border-blue-400 bg-white'
                }`}
              >
                {task.completed && (
                  <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                )}
              </label>
            </div>
            
            {/* Task name */}
            <label 
              htmlFor={`task-${projectId}-${task.id}`}
              className={`flex-1 text-xs cursor-pointer select-none transition-all duration-150 ${
                task.completed 
                  ? 'text-gray-400 line-through decoration-gray-300' 
                  : 'text-gray-600 group-hover:text-gray-800'
              }`}
            >
              {task.name}
            </label>
            
            {/* Completion indicator */}
            {task.completed && (
              <Check className="w-3 h-3 text-green-500" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
});

TaskList.displayName = 'TaskList';

export default TaskList;