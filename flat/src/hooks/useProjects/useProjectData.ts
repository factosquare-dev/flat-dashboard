/**
 * Project data fetching and CRUD operations
 */

import { useState, useCallback, useRef } from 'react';
import type { Project } from '../../types/project';
import { ServiceType, ProjectStatus, Priority, ProductType, ProjectType, ProjectField, FACTORY_ID_FIELDS, DATE_FIELDS } from '../../types/enums';
import type { ProjectId } from '../../types/branded';
import type { Schedule } from '../../types/schedule';
import { factories } from '../../data/factories';
import { scheduleApi } from '../../api/scheduleApi';
import { extractProjectFromSchedule } from '../../data/mockSchedules';
import { formatDateISO } from '../../utils/coreUtils';
import { MockDatabaseImpl } from '../../mocks/database/MockDatabase';
import { isProjectType } from '../../utils/projectTypeUtils';

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
      
      // Enrich projects with factory names
      const enrichedProjects = dbProjects.map(project => {
        const enrichedProject = { ...project };
        
        // Convert factory IDs to names
        const factoryFields = ['manufacturer', 'container', 'packaging'] as const;
        factoryFields.forEach(field => {
          const idField = `${field}Id` as keyof typeof project;
          const factoryIds = project[idField];
          
          if (factoryIds) {
            if (Array.isArray(factoryIds)) {
              enrichedProject[field] = factoryIds.map(id => {
                const factory = mockDb.getDatabase().factories.get(id);
                return factory ? factory.name : id;
              });
            } else {
              const factory = mockDb.getDatabase().factories.get(factoryIds);
              enrichedProject[field] = factory ? factory.name : factoryIds;
            }
          }
        });
        
        return enrichedProject;
      });
      
      // Convert to pagination format (simulate pagination)
      const itemsPerPage = 50;
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProjects = enrichedProjects.slice(startIndex, endIndex);
      
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
    // 현재 프로젝트 찾기
    const currentProject = projects.find(p => p.id === projectId);
    if (!currentProject) {
      return;
    }
    
    // 값이 동일하면 업데이트하지 않음 (중복 호출 방지)
    if (currentProject[field] === value) {
      return;
    }
    
    // Update local state immediately for responsive UI
    setProjects(prev => {
      const updated = prev.map(project => {
        if (project.id === projectId) {
          const updatedProject = { ...project, [field]: value };
          
          // If updating factory IDs, also update the display names
          if (FACTORY_ID_FIELDS.includes(field as any)) {
            const factoryType = field.replace('Id', '') as 'manufacturer' | 'container' | 'packaging';
            const factoryIds = value as string | string[];
            
            if (Array.isArray(factoryIds)) {
              const names = factoryIds.map(id => {
                const factory = mockDb.getDatabase().factories.get(id);
                return factory ? simplifyCompanyName(factory.name) : id;
              });
              updatedProject[factoryType] = names;
            } else if (factoryIds) {
              const factory = mockDb.getDatabase().factories.get(factoryIds);
              updatedProject[factoryType] = factory ? simplifyCompanyName(factory.name) : factoryIds;
            } else {
              updatedProject[factoryType] = null;
            }
          }
          
          return updatedProject;
        }
        return project;
      });
      
      // SUB 프로젝트가 변경되었을 때 Master 프로젝트의 집계 데이터 업데이트
      if (isProjectType(currentProject.type, ProjectType.SUB) && currentProject.parentId) {
        // Master 프로젝트의 모든 집계 데이터를 업데이트
        const updateMasterAggregates = async () => {
          try {
            const result = await mockDb.updateMasterProjectAggregates(currentProject.parentId);
            if (result.success) {
              // Master project aggregates updated
              
              // UI 상태도 업데이트하기 위해 Master 프로젝트 다시 로드
              const masterResult = await mockDb.getById('projects', currentProject.parentId);
              if (masterResult.success && masterResult.data) {
                const updatedMaster = masterResult.data;
                
                // Factory names 업데이트
                const factoryFields = ['manufacturer', 'container', 'packaging'] as const;
                factoryFields.forEach(field => {
                  const idField = `${field}Id` as keyof typeof updatedMaster;
                  const factoryIds = updatedMaster[idField];
                  
                  if (factoryIds) {
                    if (Array.isArray(factoryIds)) {
                      updatedMaster[field] = factoryIds.map(id => {
                        const factory = mockDb.getDatabase().factories.get(id);
                        return factory ? simplifyCompanyName(factory.name) : id;
                      });
                    } else {
                      const factory = mockDb.getDatabase().factories.get(factoryIds);
                      updatedMaster[field] = factory ? simplifyCompanyName(factory.name) : factoryIds;
                    }
                  }
                });
                
                // UI 상태 업데이트
                setProjects(prev => prev.map(p => 
                  p.id === currentProject.parentId ? updatedMaster : p
                ));
              }
            }
          } catch (error) {
            console.error('[useProjectData] Failed to update master aggregates:', error);
          }
        };
        
        // 비동기로 Master 프로젝트 업데이트
        updateMasterAggregates();
      }
      
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
  }, [onProjectsUpdate, mockDb, projects]);

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
          
          // If adding a SUB project, update Master aggregates
          if (isProjectType(project.type, ProjectType.SUB) && project.parentId) {
            const aggregateResult = await mockDb.updateMasterProjectAggregates(project.parentId);
            if (aggregateResult.success) {
              // Master project aggregates updated after adding SUB project
              
              // Reload Master project to update UI
              const masterResult = await mockDb.getById('projects', project.parentId);
              if (masterResult.success && masterResult.data) {
                const updatedMaster = masterResult.data;
                
                // Update factory names
                const factoryFields = ['manufacturer', 'container', 'packaging'] as const;
                factoryFields.forEach(field => {
                  const idField = `${field}Id` as keyof typeof updatedMaster;
                  const factoryIds = updatedMaster[idField];
                  
                  if (factoryIds) {
                    if (Array.isArray(factoryIds)) {
                      updatedMaster[field] = factoryIds.map(id => {
                        const factory = mockDb.getDatabase().factories.get(id);
                        return factory ? simplifyCompanyName(factory.name) : id;
                      });
                    } else {
                      const factory = mockDb.getDatabase().factories.get(factoryIds);
                      updatedMaster[field] = factory ? simplifyCompanyName(factory.name) : factoryIds;
                    }
                  }
                });
                
                // Update UI state
                setProjects(prev => prev.map(p => 
                  p.id === project.parentId ? updatedMaster : p
                ));
              }
            }
          }
        } else {
          console.error('[useProjectData] Failed to add project to MockDB:', result.error);
        }
      } catch (error) {
        console.error('[useProjectData] Failed to add project to MockDB:', error);
      }
    };
    addToMockDb();
    
    setProjects(prev => {
      const updated = [project, ...prev];
      if (onProjectsUpdate) {
        onProjectsUpdate(updated);
      }
      return updated;
    });
  }, [onProjectsUpdate, mockDb]);

  const deleteProject = useCallback((projectId: ProjectId) => {
    // Delete from MockDB first
    try {
      mockDb.deleteProject(projectId);
      console.log('[useProjectData] Project deleted from MockDB:', projectId);
    } catch (error) {
      console.error('[useProjectData] Failed to delete project from MockDB:', error);
    }
    
    setProjects(prev => {
      const updated = prev.filter(project => project.id !== projectId);
      if (onProjectsUpdate) {
        onProjectsUpdate(updated);
      }
      return updated;
    });
  }, [onProjectsUpdate, mockDb]);

  const bulkUpdateProjects = useCallback((projectIds: ProjectId[], updates: Partial<Project>) => {
    setProjects(prev => {
      const updated = prev.map(project => 
        projectIds.includes(project.id)
          ? { ...project, ...updates }
          : project
      );
      if (onProjectsUpdate) {
        onProjectsUpdate(updated);
      }
      return updated;
    });
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