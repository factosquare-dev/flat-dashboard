import React, { useCallback } from 'react';
import type { Task } from '@/types/schedule';
import type { Project } from '@/types/project';
import { APP_CONSTANTS } from '@/config/constants';
import { gridColors } from '@/design-system/colors/grid';
import { getStatusDisplayName, getStatusStyles } from '@/utils/statusUtils';
import { mockDataService } from '@/services/mockDataService';
import { isDateInRange } from '@/utils/unifiedDateUtils';
import TaskStatusIcons from './TaskStatusIcons';
import TaskSchedule from './TaskSchedule';
import TaskFactory from './TaskFactory';
import TaskAssignee from './TaskAssignee';
import TaskActions from './TaskActions';

interface TaskRowProps {
  task: Task;
  project: Project | undefined;
  onTaskClick?: (task: Task) => void;
  onTaskDelete?: (taskId: string) => void;
  onFactoryDelete?: (factoryId: string) => void;
}

const TaskRow: React.FC<TaskRowProps> = ({
  task,
  project,
  onTaskClick,
  onTaskDelete,
  onFactoryDelete
}) => {
  const handleTaskClick = useCallback(() => {
    onTaskClick?.(task);
  }, [onTaskClick, task]);
  
  // Check if today is within the task schedule
  const isTodayInSchedule = isDateInRange(new Date(), task.startDate, task.endDate);

  const [isFactoryExpanded, setIsFactoryExpanded] = React.useState(false);
  
  // Get factory information for the task (Task-Centric)
  const getFactoryDisplay = () => {
    if (!task.factoryAssignments || task.factoryAssignments.length === 0) {
      return '미할당';
    }
    
    // Single factory
    if (task.factoryAssignments.length === 1) {
      return task.factoryAssignments[0].factoryName;
    }
    
    // Multiple factories - expandable view
    if (isFactoryExpanded) {
      return (
        <div className="flex flex-col gap-1">
          {task.factoryAssignments.map((fa, index) => (
            <div key={index} className="flex items-center gap-1">
              <span className="text-sm">{fa.factoryName}</span>
            </div>
          ))}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsFactoryExpanded(false);
            }}
            className="text-xs text-gray-500 hover:text-gray-700 text-left"
          >
            접기
          </button>
        </div>
      );
    }
    
    // Collapsed view - show first factory and expand button
    const factoryName = task.factoryAssignments[0].factoryName;
    return (
      <div className="flex items-center gap-1">
        <span>{factoryName}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsFactoryExpanded(true);
          }}
          className="px-1.5 py-0.5 text-[10px] bg-blue-100 text-blue-700 rounded-full font-medium hover:bg-blue-200 transition-colors"
        >
          +{task.factoryAssignments.length - 1}
        </button>
      </div>
    );
  };


  return (
    <tr className={`${
      isTodayInSchedule 
        ? 'bg-blue-50 hover:bg-blue-100' 
        : gridColors.row.hover
    } transition-colors border-b ${gridColors.row.border}`} role="row">
      {/* 작업명 */}
      <td className="px-4 py-3" role="gridcell">
        <button
          onClick={handleTaskClick}
          className={`text-left ${gridColors.task.textHover} transition-colors font-medium text-sm ${gridColors.task.text} flex items-center`}
          aria-label={`작업 ${task.name || task.title} 세부정보 보기`}
        >
          <TaskStatusIcons task={task} />
        </button>
      </td>
      
      {/* 프로젝트 상태 */}
      <td className="px-4 py-3" role="gridcell">
        {project ? (
          <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getStatusStyles(project.status, 'project')}`}>
            {getStatusDisplayName(project.status, 'project')}
          </span>
        ) : (
          <span className="text-gray-400 text-sm">정보 없음</span>
        )}
      </td>
      
      {/* 고객명 */}
      <td className="px-4 py-3" role="gridcell">
        <span className="text-sm font-medium text-gray-900">
          {project?.customer?.name || '정보 없음'}
        </span>
      </td>
      
      {/* 일정 */}
      <td className="px-4 py-3" role="gridcell">
        <TaskSchedule startDate={task.startDate} endDate={task.endDate} />
      </td>
      
      {/* 기간 */}
      <td className="px-4 py-3" role="gridcell">
        <TaskDuration startDate={task.startDate} endDate={task.endDate} />
      </td>
      
      {/* 공장 정보 */}
      <td className="px-4 py-3" role="gridcell">
        <div className="text-sm text-gray-700">
          {getFactoryDisplay()}
        </div>
      </td>
      
      {/* 담당자 */}
      <td className="px-4 py-3" role="gridcell">
        <TaskAssignee assignee={task.assignee} />
      </td>
      
      {/* 작업 */}
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