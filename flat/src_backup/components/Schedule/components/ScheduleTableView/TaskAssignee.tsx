import React from 'react';

interface TaskAssigneeProps {
  assignee?: string;
}

const TaskAssignee: React.FC<TaskAssigneeProps> = ({ assignee }) => {
  if (!assignee) {
    return <span className="text-gray-400 text-xs">-</span>;
  }

  return (
    <div className="flex items-center gap-2">
      <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
        <span className="text-xs font-medium text-white">
          {assignee.charAt(0)}
        </span>
      </div>
      <span className="text-xs text-gray-700">
        {assignee}
      </span>
    </div>
  );
};

export default TaskAssignee;