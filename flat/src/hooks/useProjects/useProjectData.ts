/**
 * Project data fetching and CRUD operations
 */

import { useState, useCallback, useRef } from 'react';
import type { Project } from '../../types/project';
import type { ProjectId } from '../../types/branded';
import type { Schedule } from '../../types/schedule';
import { loadProjectsFromDb } from './operations/projectLoader';
import { updateProjectField, addNewProject, deleteProjectById, bulkUpdate } from './operations/projectCrud';
import { loadScheduleForProject } from './operations/scheduleLoader';

export interface UseProjectDataProps {
  onProjectsUpdate?: (projects: Project[]) => void;
}

export const useProjectData = ({ onProjectsUpdate }: UseProjectDataProps = {}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [schedules, setSchedules] = useState<Map<string, Schedule>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  
  // Race condition prevention
  const abortControllerRef = useRef<AbortController | null>(null);

  const loadProjects = useCallback(async (page: number = 1): Promise<Project[]> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    setIsLoading(true);
    
    try {
      const loadedProjects = await loadProjectsFromDb(signal, page);
      
      if (!signal.aborted) {
        setProjects(loadedProjects);
        onProjectsUpdate?.(loadedProjects);
      }
      
      return loadedProjects;
    } catch (error) {
      if (!signal.aborted) {
        console.error('Failed to load projects:', error);
      }
      return [];
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, [onProjectsUpdate]);

  const updateProject = useCallback(<K extends keyof Project>(projectId: ProjectId, field: K, value: Project[K]) => {
    updateProjectField(projectId, field, value, projects, (updatedProjects) => {
      setProjects(updatedProjects);
      onProjectsUpdate?.(updatedProjects);
    });
  }, [projects, onProjectsUpdate]);

  const addProject = useCallback((newProject: Omit<Project, 'id'>) => {
    const safeNewProject = {
      ...newProject,
      createdAt: newProject.createdAt instanceof Date ? newProject.createdAt : new Date(newProject.createdAt),
      updatedAt: newProject.updatedAt instanceof Date ? newProject.updatedAt : new Date(newProject.updatedAt),
      startDate: newProject.startDate instanceof Date ? newProject.startDate.toISOString() : newProject.startDate,
      endDate: newProject.endDate instanceof Date ? newProject.endDate.toISOString() : newProject.endDate,
    };

    addNewProject(safeNewProject, projects, (updatedProjects) => {
      setProjects(updatedProjects);
      onProjectsUpdate?.(updatedProjects);
    });
  }, [projects, onProjectsUpdate]);

  const deleteProject = useCallback((projectId: ProjectId) => {
    deleteProjectById(projectId, projects, (updatedProjects) => {
      setProjects(updatedProjects);
      onProjectsUpdate?.(updatedProjects);
    });
  }, [projects, onProjectsUpdate]);

  const bulkUpdateProjects = useCallback((projectIds: ProjectId[], updates: Partial<Project>) => {
    bulkUpdate(projectIds, updates, projects, (updatedProjects) => {
      setProjects(updatedProjects);
      onProjectsUpdate?.(updatedProjects);
    });
  }, [projects, onProjectsUpdate]);

  const refreshProjects = useCallback(async () => {
    const refreshedProjects = await loadProjects();
    return refreshedProjects;
  }, [loadProjects]);

  const loadSchedule = useCallback(async (projectId: ProjectId) => {
    const updatedSchedules = await loadScheduleForProject(projectId, schedules);
    setSchedules(updatedSchedules);
    return updatedSchedules.get(projectId);
  }, [schedules]);

  return {
    // Data
    projects,
    schedules,
    isLoading,
    
    // Operations
    setProjects,
    loadProjects,
    updateProject,
    addProject,
    deleteProject,
    bulkUpdateProjects,
    refreshProjects,
    loadSchedule,
  };
};