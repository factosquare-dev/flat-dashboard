import React, { useState } from 'react';
import { isToday, isWithinInterval, parseISO } from 'date-fns';
import { ChevronDown, ChevronRight } from 'lucide-react';
import type { Project } from '@/types/project';
import { mockDataService } from '@/services/mockDataService';

const CurrentStageContent: React.FC<{ project: Project }> = ({ project }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
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
  const hasMultipleStages = stagesToShow.length > 1;
  
  // Collapse 상태에서는 첫 번째 stage만 보여주고 나머지 개수 표시
  const displayStages = isExpanded || !hasMultipleStages ? stagesToShow : [stagesToShow[0]];
  
  return (
    <div className="flex items-center gap-1">
      {hasMultipleStages && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className="p-0.5 rounded transition-colors hover:bg-gray-200"
          title={isExpanded ? "접기" : "펼치기"}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 text-gray-600" />
          ) : (
            <ChevronRight className="w-3 h-3 text-gray-600" />
          )}
        </button>
      )}
      <div className={`flex ${isExpanded ? 'flex-wrap' : 'flex-nowrap items-center'} gap-1`}>
        {displayStages.map((stage, index) => (
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
        {!isExpanded && hasMultipleStages && (
          <span className="text-xs text-gray-500 ml-1">
            +{stagesToShow.length - 1}
          </span>
        )}
      </div>
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