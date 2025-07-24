import React, { useCallback } from 'react';
import type { Task, Participant } from '../../../../types/schedule';
import { APP_CONSTANTS } from '../../../../config/constants';
import TaskStatusIcons from './TaskStatusIcons';
import TaskSchedule from './TaskSchedule';
import TaskFactory from './TaskFactory';
import TaskAssignee from './TaskAssignee';
import TaskActions from './TaskActions';

interface TaskRowProps {
  task: Task;
  project: Participant | undefined;
  projects: Participant[];
  onTaskClick?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onFactoryDelete?: (factoryId: string) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  project,
  projects,
  onTaskClick,
  onTaskDelete,
  onFactoryDelete
}) => {
  const handleTaskClick = useCallback(() => {
    onTaskClick?.(task);
  }, [onTaskClick, task]);
  return (
    <tr className="hover:bg-gray-50/50 transition-colors border-b border-gray-100" role="row">
      {/* {APP_CONSTANTS.TEXT.TASK.NAME} */}
      <td className="px-4 py-3" role="gridcell">
        <button
          onClick={handleTaskClick}
          className="text-left hover:text-blue-600 transition-colors font-medium text-sm text-gray-900 flex items-center"
          aria-label={`작업 ${task.name} 세부정보 보기`}
        >
          <TaskStatusIcons task={task} />
        </button>
      </td>
      
      {/* {APP_CONSTANTS.TEXT.TASK.SCHEDULE} */}
      <td className="px-4 py-3" role="gridcell">
        <TaskSchedule startDate={task.startDate} endDate={task.endDate} />
      </td>
      
      {/* {APP_CONSTANTS.TEXT.TASK.DURATION} */}
      <td className="px-4 py-3" role="gridcell">
        <TaskDuration startDate={task.startDate} endDate={task.endDate} />
      </td>
      
      {/* {APP_CONSTANTS.TEXT.TASK.FACTORY} */}
      <td className="px-4 py-3" role="gridcell">
        <TaskFactory 
          project={project}
          task={task}
          onFactoryDelete={onFactoryDelete}
        />
      </td>
      
      {/* {APP_CONSTANTS.TEXT.TASK.ASSIGNEE} */}
      <td className="px-4 py-3" role="gridcell">
        <TaskAssignee assignee={task.assignee} />
      </td>
      
      {/* {APP_CONSTANTS.TEXT.TASK.ACTIONS} */}
      <td className="px-4 py-3 text-center" role="gridcell">
        <TaskActions 
          taskId={task.id}
          onTaskDelete={onTaskDelete}
        />
      </td>
    </tr>
  );
};

const TaskDuration: React.FC<{ startDate: string; endDate: string }> = ({ startDate, endDate }) => {
  const getDuration = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days}${APP_CONSTANTS.TEXT.TASK.DAYS_SUFFIX}`;
  };

  return (
    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
      {getDuration()}
    </span>
  );
};

export default TaskRow;