/**
 * GanttChart helper utilities
 */

import type { Project, Task } from '../types';
import { ProjectNotFoundError } from '../../../errors';

export const getTaskById = (projects: Project[], taskId: string | number): Task | null => {
  for (const project of projects) {
    const task = project.tasks.find(t => t.id === taskId);
    if (task) return task;
  }
  return null;
};

export const getProjectById = (projects: Project[], projectId: string): Project | null => {
  const project = projects.find(p => p.id === projectId);
  return project || null;
};

export const getProjectByIdOrThrow = (projects: Project[], projectId: string): Project => {
  const project = projects.find(p => p.id === projectId);
  if (!project) {
    throw new ProjectNotFoundError(projectId);
  }
  return project;
};

export const getProjectByTaskId = (projects: Project[], taskId: string | number): Project | null => {
  for (const project of projects) {
    if (project.tasks.some(t => t.id === taskId)) {
      return project;
    }
  }
  return null;
};

export const getTaskRowIndex = (projects: Project[], taskId: string | number): number => {
  let rowIndex = 0;
  
  for (const project of projects) {
    // Project header row
    rowIndex++;
    
    if (project.expanded) {
      const taskIndex = project.tasks.findIndex(t => t.id === taskId);
      if (taskIndex !== -1) {
        return rowIndex + taskIndex;
      }
      rowIndex += project.tasks.length;
    }
  }
  
  return -1;
};

export const getProjectRowIndex = (projects: Project[], projectId: string): number => {
  let rowIndex = 0;
  
  for (const project of projects) {
    if (project.id === projectId) {
      return rowIndex;
    }
    
    // Project header row
    rowIndex++;
    
    if (project.expanded) {
      rowIndex += project.tasks.length;
    }
  }
  
  return -1;
};

export const getTotalRows = (projects: Project[]): number => {
  return projects.reduce((sum, project) => {
    return sum + 1 + (project.expanded ? project.tasks.length : 0);
  }, 0);
};

export const isValidDateRange = (startDate: string, endDate: string): boolean => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return start <= end;
};

export const formatDateRange = (startDate: string, endDate: string): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const startFormatted = start.toLocaleDateString('ko-KR', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  const endFormatted = end.toLocaleDateString('ko-KR', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `${startFormatted} ~ ${endFormatted}`;
};