import React, { useState } from 'react';
import { isWithinInterval, parseISO } from 'date-fns';
import type { Project } from '@/shared/types/project';
import { mockDataService } from '@/core/services/mockDataService';
import { isToday } from '@/shared/utils/date/operations';

const CurrentStageContent: React.FC<{ project: Project }> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Template 기반 TaskChecklist에서 현재 진행 단계 가져오기
  const currentStages = React.useMemo(() => {
    try {
      // Template 기반 현재 진행 단계 가져오기
      const templateStages = mockDataService.getCurrentTaskStages(project.id);
      
      if (templateStages.length > 0) {
        return templateStages;
      }

      // 오늘 진행 중인 Schedule Task 가져오기 (Fallback)
      const tasks = mockDataService.getTasksByProjectId(project.id);
      
      if (tasks.length === 0) {
        return [];
      }
      
      const todayTasks = tasks
        .filter(task => {
          if (!task.startDate || !task.endDate) {
            return false;
          }
          
          const startDate = typeof task.startDate === 'string' ? parseISO(task.startDate) : task.startDate;
          const endDate = typeof task.endDate === 'string' ? parseISO(task.endDate) : task.endDate;
          
          const todayIsStart = isToday(startDate);
          const todayIsEnd = isToday(endDate);
          const today = new Date();
          const isInRange = isWithinInterval(today, { start: startDate, end: endDate });
          
          return todayIsStart || todayIsEnd || isInRange;
        })
        .map(task => task.name || task.title || '')
        .filter(name => name.length > 0);
        
      return todayTasks;
    } catch (error) {
      return [];
    }
  }, [project.id]);
  
  const stagesToShow = currentStages;
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
          className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap bg-purple-500 text-white"
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