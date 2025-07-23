import React, { useMemo } from 'react';
import type { Participant, Task } from '../../../types/schedule';

interface ScheduleTableViewProps {
  projects: Participant[];
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onDeleteProject?: (projectId: string) => void;
}

const ScheduleTableView: React.FC<ScheduleTableViewProps> = React.memo(({
  projects,
  tasks,
  onTaskClick,
  onDeleteProject
}) => {
  // Sort all tasks by start date
  const sortedTasks = useMemo(
    () => [...tasks].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    ),
    [tasks]
  );

  // Create a map of project id to project for quick lookup
  const projectMap = useMemo(
    () => new Map(projects.map(p => [p.id, p])),
    [projects]
  );

  const formatDateShort = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${month}/${day}`;
    } catch {
      return dateString;
    }
  };

  const getDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return `${days}일`;
  };

  const getStatusIcons = (task: Task) => {
    const today = new Date();
    const endDate = new Date(task.endDate);
    
    const completedIcon = task.status === 'completed' ? (
      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-2">
        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    ) : null;
    
    const delayIcon = (endDate < today && task.status !== 'completed') ? (
      <div className="w-5 h-5 bg-red-100 rounded-full flex items-center justify-center ml-2">
        <svg className="w-3 h-3 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
    ) : null;
    
    return { completedIcon, delayIcon };
  };

  return (
    <div className="h-full overflow-auto bg-white">
      <table className="w-full">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                작업명
              </span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                일정
              </span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                기간
              </span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                담당 공장
              </span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-gray-600 uppercase tracking-wide">
                담당자
              </span>
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedTasks.map((task, index) => {
            // projectId로 매칭되는 프로젝트를 찾거나, factory 이름으로 찾기
            const project = projectMap.get(task.projectId) || 
                           projects.find(p => p.name === task.factory);
            const { completedIcon, delayIcon } = getStatusIcons(task);
            
            return (
              <tr key={task.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                {/* 작업명 */}
                <td className="px-4 py-3">
                  <button
                    onClick={() => onTaskClick?.(task)}
                    className="text-left hover:text-blue-600 transition-colors font-medium text-sm text-gray-900 flex items-center"
                  >
                    {completedIcon}
                    <span>{task.title || task.taskType}</span>
                    {delayIcon}
                  </button>
                </td>
                
                {/* 일정 */}
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{formatDateShort(task.startDate)}</span>
                    <span className="text-gray-300">~</span>
                    <span>{formatDateShort(task.endDate)}</span>
                  </div>
                </td>
                
                {/* 기간 */}
                <td className="px-4 py-3">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                    {getDuration(task.startDate, task.endDate)}
                  </span>
                </td>
                
                {/* 담당 공장 */}
                <td className="px-4 py-3">
                  {project ? (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium"
                         style={{ 
                           backgroundColor: `${project.color}15`,
                           color: project.color
                         }}>
                      <div 
                        className="w-1.5 h-1.5 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      />
                      {project.name}
                    </div>
                  ) : task.factory ? (
                    <div className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-600">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                      {task.factory}
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
                
                {/* 담당자 */}
                <td className="px-4 py-3">
                  {task.assignee ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium text-white">
                          {task.assignee.charAt(0)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-700">
                        {task.assignee}
                      </span>
                    </div>
                  ) : (
                    <span className="text-gray-400 text-xs">-</span>
                  )}
                </td>
              </tr>
            );
          })}
          {sortedTasks.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center">
                <div className="text-gray-500">
                  <div className="text-sm mb-1">등록된 작업이 없습니다</div>
                  <div className="text-xs text-gray-400">새로운 작업을 추가해보세요</div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
});

ScheduleTableView.displayName = 'ScheduleTableView';

export default ScheduleTableView;