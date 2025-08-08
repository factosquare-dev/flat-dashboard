import React, { useState } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import type { Project } from '@/types/project';
import { mockDataService } from '@/services/mockDataService';
import { isToday } from '@/utils/date/operations';

const CurrentStageContent: React.FC<{ project: Project }> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // 오늘 진행 중인 작업 가져오기
  const todayTasks = React.useMemo(() => {
    // Getting tasks for project
    try {
      const tasks = mockDataService.getTasksByProjectId(project.id);
      
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
          
          // Check if today is the start date, end date, or within the range
          const todayIsStart = isToday(startDate);
          const todayIsEnd = isToday(endDate);
          const today = new Date();
          const isInRange = isWithinInterval(today, { start: startDate, end: endDate });
          
          return todayIsStart || todayIsEnd || isInRange;
        })
        .map(task => {
          return task.name || task.title || '';
        })
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
  // Ensure currentStage is always an array
  const currentStageArray = Array.isArray(project.currentStage) 
    ? project.currentStage 
    : (project.currentStage ? [project.currentStage] : []);
  const stagesToShow = hasToday ? todayTasks : currentStageArray;
  const hasMultipleStages = stagesToShow.length > 1;
  
  // If no stages at all, return empty
  if (stagesToShow.length === 0) {
    return null;
  }
  
  // Show all stages when expanded, otherwise just the first one
  const displayStages = isExpanded ? stagesToShow : stagesToShow.slice(0, 1);
  
  return (
    <div className="flex gap-1 flex-wrap items-center">
      {displayStages.map((stage, index) => (
        <span
          key={index}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
            hasToday 
              ? 'bg-blue-500 text-white' 
              : 'bg-purple-500 text-white'
          }`}
          title={stage}
        >
          {stage.length > 8 && !isExpanded ? `${stage.slice(0, 8)}...` : stage}
        </span>
      ))}
      {hasMultipleStages && !isExpanded && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(true);
          }}
          className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer px-1.5 py-0.5 rounded hover:bg-gray-100 transition-colors"
        >
          +{stagesToShow.length - 1}
        </button>
      )}
    </div>
  );
};

export const renderCurrentStage = (project: Project) => {
  return (
    <td className="px-3 py-1.5">
      <CurrentStageContent project={project} />
    </td>
  );
};

// Component export for use in cellRenderer - return td element
export const CurrentStageCell = ({ project }: { project: Project }) => {
  return renderCurrentStage(project);
};