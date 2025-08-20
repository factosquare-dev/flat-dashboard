import React from 'react';
import type { Task } from '@/shared/types/schedule';
import { TaskStatus } from '@/shared/types/enums';

interface TaskStatusIconsProps {
  task: Task;
}

const TaskStatusIcons: React.FC<TaskStatusIconsProps> = ({ task }) => {
  const today = new Date();
  const endDate = new Date(task.endDate);
  
  const completedIcon = task.status === TaskStatus.COMPLETED ? (
    <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
      <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    </div>
  ) : null;
  
  const delayIcon = (endDate < today && task.status !== TaskStatus.COMPLETED) ? (
    <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center ml-2">
      <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
  ) : null;
  
  return (
    <>
      {completedIcon}
      <span>{task.name || task.title || task.taskType}</span>
      {delayIcon}
    </>
  );
};

export default TaskStatusIcons;