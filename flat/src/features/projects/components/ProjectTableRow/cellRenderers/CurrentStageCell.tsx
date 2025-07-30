import React from 'react';
import { isToday, isWithinInterval, parseISO } from 'date-fns';
import type { Project } from '@/types/project';
import { mockDataService } from '@/services/mockDataService';

export const renderCurrentStage = (project: Project) => {
  
  // 오늘 진행 중인 작업 가져오기
  const todayTasks = React.useMemo(() => {
    // Getting tasks for project
    try {
      const tasks = mockDataService.getTasksByProjectId(project.id);
      // CurrentStageCell - Total tasks
      
      if (tasks.length === 0) {
        // No tasks found for project
        return [];
      }
      
      const filteredTasks = tasks
        .filter(task => {
          // 오늘이 작업 기간에 포함되는지 확인
          if (!task.startDate || !task.endDate) {
            // Task missing dates
            return false;
          }
          
          const startDate = typeof task.startDate === 'string' ? parseISO(task.startDate) : task.startDate;
          const endDate = typeof task.endDate === 'string' ? parseISO(task.endDate) : task.endDate;
          const today = new Date();
          
          // 오늘이 작업 기간 내에 있는지 확인
          const isInRange = isWithinInterval(today, { start: startDate, end: endDate });
          // Task date range check
          
          return isInRange;
        })
        .map(task => task.name || task.title || '')
        .filter(name => name.length > 0);
        
      // Today tasks
      return filteredTasks;
    } catch (error) {
      // Error getting today tasks
      return [];
    }
  }, [project.id]);
  
  // 오늘 작업이 있으면 표시, 없으면 기존 currentStage 표시
  const hasToday = todayTasks.length > 0;
  const stagesToShow = hasToday ? todayTasks : (project.currentStage || []);
  
  return (
    <td className="px-3 py-1.5">
      <div className="flex flex-wrap gap-1">
        {stagesToShow.map((stage, index) => (
          <span
            key={index}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
              hasToday 
                ? 'bg-purple-100 text-purple-700 border-purple-200' 
                : 'bg-purple-100 text-purple-700 border-purple-200'
            }`}
          >
            {stage}
          </span>
        ))}
      </div>
    </td>
  );
};