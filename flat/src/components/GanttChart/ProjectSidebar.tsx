/**
 * GanttChart ProjectSidebar component - displays project names and task list
 */

import React from 'react';
import type { Project } from './types';
import { GANTT_CONSTANTS } from './constants';

interface ProjectSidebarProps {
  projects: Project[];
  onToggleProject: (projectId: string) => void;
}

const ProjectSidebar: React.FC<ProjectSidebarProps> = ({ 
  projects, 
  onToggleProject 
}) => {
  // 디버깅: ProjectSidebar에서 받는 프로젝트 데이터 확인
  console.log('[ProjectSidebar] 🚨 Received projects:', projects);
  console.log('[ProjectSidebar] 🚨 Project names:', projects.map(p => p.name));
  const renderSidebarContent = () => {
    const elements: JSX.Element[] = [];
    let currentRow = 0;

    projects.forEach((project) => {
      // Project header
      elements.push(
        <button
          key={`sidebar-project-${project.id}`}
          className="absolute flex items-center px-3 py-2 text-sm font-medium bg-gray-100 hover:bg-gray-200 border-b border-gray-200 w-full text-left cursor-pointer"
          style={{
            top: currentRow * GANTT_CONSTANTS.CELL_HEIGHT,
            height: GANTT_CONSTANTS.CELL_HEIGHT,
            width: GANTT_CONSTANTS.SIDEBAR_WIDTH
          }}
          onClick={() => onToggleProject(project.id)}
          aria-expanded={project.expanded}
          aria-label={`${project.name} 프로젝트 ${project.expanded ? '접기' : '펼치기'}`}
        >
          <span className="mr-2 text-gray-600" aria-hidden="true">
            {project.expanded ? '▼' : '▶'}
          </span>
          <span className="truncate text-gray-800">{project.name}</span>
        </button>
      );
      currentRow++;

      // Task rows
      if (project.expanded) {
        project.tasks.forEach((task) => {
          elements.push(
            <div
              key={`sidebar-task-${task.id}`}
              className="absolute flex items-center px-6 py-2 text-xs text-gray-600 bg-white border-b border-gray-100 w-full"
              style={{
                top: currentRow * GANTT_CONSTANTS.CELL_HEIGHT,
                height: GANTT_CONSTANTS.CELL_HEIGHT,
                width: GANTT_CONSTANTS.SIDEBAR_WIDTH
              }}
            >
              <span className="truncate">{task.title}</span>
            </div>
          );
          currentRow++;
        });
      }
    });

    return elements;
  };

  return (
    <div 
      className="bg-gray-50 border-r border-gray-300 overflow-hidden relative"
      style={{ width: GANTT_CONSTANTS.SIDEBAR_WIDTH }}
    >
      {renderSidebarContent()}
    </div>
  );
};

export default ProjectSidebar;