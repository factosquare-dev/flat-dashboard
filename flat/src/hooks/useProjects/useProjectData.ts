/**
 * Project data fetching and CRUD operations
 */

import { useState, useCallback, useRef } from 'react';
import type { Project, ServiceType, ProjectStatus, Priority } from '../../types/project';
import type { Schedule } from '../../types/schedule';
import { factories } from '../../data/factories';
import { scheduleApi } from '../../api/scheduleApi';
import { extractProjectFromSchedule } from '../../data/mockSchedules';
import { formatDateISO } from '../../utils/dateUtils';

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
      
      // Generate mock projects for pagination
      const newProjects: Project[] = [];
      const startIndex = (page - 1) * 50;
      
      for (let i = startIndex; i < startIndex + 50 && i < SIMULATION_CONSTANTS.TOTAL_COUNT; i++) {
        const factory = getRandomFactory('제조');
        const project: Project = {
          id: `project-${i + 1}`,
          client: `Client ${i + 1}`,
          manager: `Manager ${i + 1}`,
          productType: ['식품', '의약품', '화장품', '기타'][i % 4],
          serviceType: ['OEM', 'ODM', 'OBM'][i % 3] as ServiceType,
          currentStage: ['기획', '개발', '테스트', '완료'].slice(0, (i % 3) + 1),
          status: ['시작전', '진행중', '완료', '중단'][i % 4] as ProjectStatus,
          progress: Math.floor(Math.random() * 101),
          startDate: getRelativeDate(-30 + (i % 60)),
          endDate: getRelativeDate(30 + (i % 60)),
          manufacturer: factory?.name || 'Unknown Factory',
          container: ['플라스틱', '유리', '금속', '종이'][i % 4],
          packaging: ['박스', '파우치', '병', '튜브'][i % 4],
          sales: `${Math.floor(Math.random() * 10000) + 1000}만원`,
          purchase: `${Math.floor(Math.random() * 8000) + 800}만원`,
          priority: ['높음', '보통', '낮음'][i % 3] as Priority,
          depositPaid: Math.random() > 0.5,
          type: i % 10 === 0 ? 'master' : 'sub',
          scheduleId: `schedule-${i + 1}`
        };
        newProjects.push(project);
      }
      
      return newProjects;
    } catch (error) {
      if (!signal.aborted) {
        console.error('Error loading projects:', error);
        throw error;
      }
      return [];
    } finally {
      if (!signal.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  const updateProject = useCallback((projectId: string, field: keyof Project, value: any) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, [field]: value }
        : project
    ));
    
    // Notify parent component
    if (onProjectsUpdate) {
      setProjects(current => {
        onProjectsUpdate(current);
        return current;
      });
    }
  }, [onProjectsUpdate]);

  const addProject = useCallback((newProject: Omit<Project, 'id'>) => {
    const project: Project = {
      ...newProject,
      id: `project-${Date.now()}`,
    };
    
    setProjects(prev => [project, ...prev]);
    
    if (onProjectsUpdate) {
      setProjects(current => {
        onProjectsUpdate(current);
        return current;
      });
    }
  }, [onProjectsUpdate]);

  const deleteProject = useCallback((projectId: string) => {
    setProjects(prev => prev.filter(project => project.id !== projectId));
    
    if (onProjectsUpdate) {
      setProjects(current => {
        onProjectsUpdate(current);
        return current;
      });
    }
  }, [onProjectsUpdate]);

  const bulkUpdateProjects = useCallback((projectIds: string[], updates: Partial<Project>) => {
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
      console.error('Error refreshing projects:', error);
    }
  }, [loadProjects, onProjectsUpdate]);

  // Load schedule for project
  const loadSchedule = useCallback(async (projectId: string) => {
    if (schedules.has(projectId)) {
      return schedules.get(projectId);
    }
    
    try {
      const schedule = await scheduleApi.getSchedule(projectId);
      setSchedules(prev => new Map(prev).set(projectId, schedule));
      return schedule;
    } catch (error) {
      console.error(`Error loading schedule for project ${projectId}:`, error);
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