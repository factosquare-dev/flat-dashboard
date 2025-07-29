/**
 * Project data fetching and CRUD operations
 */

import { useState, useCallback, useRef } from 'react';
import type { Project } from '../../types/project';
import { ServiceType, ProjectStatus, Priority, ProductType } from '../../types/enums';
import type { ProjectId } from '../../types/branded';
import type { Schedule } from '../../types/schedule';
import { factories } from '../../data/factories';
import { scheduleApi } from '../../api/scheduleApi';
import { extractProjectFromSchedule } from '../../data/mockSchedules';
import { formatDateISO } from '../../utils/coreUtils';
import { MockDatabaseImpl } from '../../mocks/database/MockDatabase';

// Helper functions
const getRelativeDate = (daysOffset: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return formatDateISO(date);
};

const getRandomFactory = (type: string) => {
  const filteredFactories = factories.filter(f => f.type === type);
  return filteredFactories[Math.floor(Math.random() * filteredFactories.length)];
};

// Constants for simulation
const SIMULATION_CONSTANTS = {
  API_DELAY: 300,
  TOTAL_COUNT: 500,
} as const;

export interface UseProjectDataProps {
  onProjectsUpdate?: (projects: Project[]) => void;
}

export const useProjectData = ({ onProjectsUpdate }: UseProjectDataProps = {}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [schedules, setSchedules] = useState<Map<string, Schedule>>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  
  // MockDB instance
  const mockDb = MockDatabaseImpl.getInstance();
  
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
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, SIMULATION_CONSTANTS.API_DELAY));
      
      if (signal.aborted) return [];
      
      // Load projects from MockDB
      const dbResponse = await mockDb.getAll('projects');
      const dbProjects = dbResponse.success ? dbResponse.data : [];
      console.log(`[useProjectData] Loaded ${dbProjects.length} projects from MockDB`);
      
      // Convert to pagination format (simulate pagination)
      const itemsPerPage = 50;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProjects = dbProjects.slice(startIndex, endIndex);
      
      return paginatedProjects;
    } catch (error) {
      if (!signal.aborted) {
        // Error handled silently
        throw error;
      }
      return [];
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const updateProject = useCallback(<K extends keyof Project>(projectId: ProjectId, field: K, value: Project[K]) => {
    console.log('[useProjectData] updateProject called:', { projectId, field, value });
    
    // Update local state immediately for responsive UI
    setProjects(prev => {
      const updated = prev.map(project => 
        project.id === projectId 
          ? { ...project, [field]: value }
          : project
      );
      console.log('[useProjectData] Local state updated');
      return updated;
    });
    
    // Update MockDB asynchronously
    const updateMockDb = async () => {
      try {
        const updateData = { [field]: value };
        const result = await mockDb.update('projects', projectId, updateData);
        if (result.success) {
          console.log('[useProjectData] MockDB updated successfully');
        } else {
          console.error('[useProjectData] Failed to update MockDB:', result.error);
        }
      } catch (error) {
        console.error('[useProjectData] Failed to update MockDB:', error);
      }
    };
    updateMockDb();
    
    // Notify parent component
    if (onProjectsUpdate) {
      setProjects(current => {
        onProjectsUpdate(current);
        return current;
      });
    }
  }, [onProjectsUpdate, mockDb]);

  const addProject = useCallback((newProject: Omit<Project, 'id'>) => {
    const project: Project = {
      ...newProject,
      id: `project-${Date.now()}`,
    };
    
    // Add to MockDB asynchronously
    const addToMockDb = async () => {
      try {
        const result = await mockDb.create('projects', project.id, project);
        if (result.success) {
          console.log('[useProjectData] Project added to MockDB:', project.id);
        } else {
          console.error('[useProjectData] Failed to add project to MockDB:', result.error);
        }
      } catch (error) {
        console.error('[useProjectData] Failed to add project to MockDB:', error);
      }
    };
    addToMockDb();
    
    setProjects(prev => [project, ...prev]);
    
    if (onProjectsUpdate) {
      setProjects(current => {
        onProjectsUpdate(current);
        return current;
      });
    }
  }, [onProjectsUpdate, mockDb]);

  const deleteProject = useCallback((projectId: ProjectId) => {
    // Delete from MockDB first
    try {
      mockDb.deleteProject(projectId);
      console.log('[useProjectData] Project deleted from MockDB:', projectId);
    } catch (error) {
      console.error('[useProjectData] Failed to delete project from MockDB:', error);
    }
    
    setProjects(prev => prev.filter(project => project.id !== projectId));
    
    if (onProjectsUpdate) {
      setProjects(current => {
        onProjectsUpdate(current);
        return current;
      });
    }
  }, [onProjectsUpdate, mockDb]);

  const bulkUpdateProjects = useCallback((projectIds: ProjectId[], updates: Partial<Project>) => {
    setProjects(prev => prev.map(project => 
      projectIds.includes(project.id)
        ? { ...project, ...updates }
        : project
    ));
    
    if (onProjectsUpdate) {
      setProjects(current => {
        onProjectsUpdate(current);
        return current;
      });
    }
  }, [onProjectsUpdate]);

  const refreshProjects = useCallback(async () => {
    try {
      const refreshedProjects = await loadProjects(1);
      setProjects(refreshedProjects);
      
      if (onProjectsUpdate) {
        onProjectsUpdate(refreshedProjects);
      }
    } catch (error) {
      // Error handled silently
    }
  }, [loadProjects, onProjectsUpdate]);

  // Load schedule for project
  const loadSchedule = useCallback(async (projectId: ProjectId) => {
    if (schedules.has(projectId)) {
      return schedules.get(projectId);
    }
    
    try {
      const schedule = await scheduleApi.getSchedule(projectId);
      setSchedules(prev => new Map(prev).set(projectId, schedule));
      return schedule;
    } catch (error) {
      // Error handled silently
      return null;
    }
  }, [schedules]);

  return {
    projects,
    setProjects,
    schedules,
    isLoading,
    loadProjects,
    updateProject,
    addProject,
    deleteProject,
    bulkUpdateProjects,
    refreshProjects,
    loadSchedule
  };
};