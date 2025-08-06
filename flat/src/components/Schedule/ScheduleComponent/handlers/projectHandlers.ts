import type { Task, ScheduleFactory } from '@/types/schedule';
import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import { FactoryType } from '@/types/enums';
import { toFactoryId } from '@/types/branded';
import { factories } from '@/data/factories';
import { getFactoryByIdOrName } from '@/utils/factoryUtils';
import { getParticipantColor } from '@/utils/scheduleColorManager';

interface TaskControls {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Partial<Task>) => void;
  updateTask: (taskId: string, task: Task) => Promise<void>;
  deleteTask: (taskId: string) => void;
}

export const createProjectHandlers = (
  projects: ScheduleFactory[],
  setProjects: React.Dispatch<React.SetStateAction<ScheduleFactory[]>>,
  taskControls: TaskControls,
  currentProjectId?: string
) => {
  const handleDeleteProject = (projectId: string) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      // 삭제할 프로젝트 찾기
      const projectToDelete = projects.find(p => p.id === projectId);
      if (!projectToDelete) return;
      
      // 프로젝트 삭제
      const updatedProjects = projects.filter(p => p.id !== projectId);
      setProjects(updatedProjects);
      
      // Project의 factory ID들을 업데이트
      if (currentProjectId) {
        try {
          const db = MockDatabaseImpl.getInstance();
          const database = db.getDatabase();
          const project = database.projects.get(currentProjectId);
          
          if (project) {
            // 삭제할 공장의 타입에 따라 해당 배열에서만 제거
            const updates: any = {};
            
            if (projectToDelete.type === FactoryType.MANUFACTURING && project.manufacturerId) {
              const ids = Array.isArray(project.manufacturerId) ? project.manufacturerId : [project.manufacturerId];
              // Set을 사용하여 중복 제거 후 필터링
              const uniqueIds = [...new Set(ids)];
              const filtered = uniqueIds.filter(id => id !== projectId);
              updates.manufacturerId = filtered.length > 0 ? filtered : undefined;
            } else if (projectToDelete.type === FactoryType.CONTAINER && project.containerId) {
              const ids = Array.isArray(project.containerId) ? project.containerId : [project.containerId];
              // Set을 사용하여 중복 제거 후 필터링
              const uniqueIds = [...new Set(ids)];
              const filtered = uniqueIds.filter(id => id !== projectId);
              updates.containerId = filtered.length > 0 ? filtered : undefined;
            } else if (projectToDelete.type === FactoryType.PACKAGING && project.packagingId) {
              const ids = Array.isArray(project.packagingId) ? project.packagingId : [project.packagingId];
              // Set을 사용하여 중복 제거 후 필터링
              const uniqueIds = [...new Set(ids)];
              const filtered = uniqueIds.filter(id => id !== projectId);
              updates.packagingId = filtered.length > 0 ? filtered : undefined;
            }
            
            if (Object.keys(updates).length > 0) {
              db.update('projects', currentProjectId, updates);
            }
          }
        } catch (error) {
          console.error('Failed to update project factory IDs:', error);
        }
      }
      
      // 해당 프로젝트의 모든 태스크도 삭제
      const tasksToDelete = taskControls.tasks.filter(task => task.factoryId === projectId);
      tasksToDelete.forEach(task => {
        taskControls.deleteTask(task.id);
      });
      
      // 로컬 스토리지에서도 삭제
      const updatedFactories = updatedProjects.reduce((acc, factory) => {
        acc[factory.id] = factory;
        return acc;
      }, {} as Record<string, ScheduleFactory>);
      
      localStorage.setItem(`schedule_factories_${currentProjectId}`, JSON.stringify(updatedFactories));
    }
  };

  const handleAddProject = (factoryId: string) => {
    if (!currentProjectId) return;
    
    const existingProject = projects.find(p => p.id === factoryId);
    if (existingProject) {
      alert('이미 추가된 공장입니다.');
      return;
    }

    const factory = getFactoryByIdOrName(factories, factoryId);
    if (!factory) {
      alert('공장을 찾을 수 없습니다.');
      return;
    }

    const newProject: ScheduleFactory = {
      id: factory.id,
      name: factory.name,
      type: factory.type as FactoryType,
      color: getParticipantColor(factory.name) || '#000000',
      tasks: []
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
    // Project의 factory ID들을 업데이트
    try {
      const db = MockDatabaseImpl.getInstance();
      const database = db.getDatabase();
      const project = database.projects.get(currentProjectId);
      
      if (project) {
        const updates: any = {};
        
        if (factory.type === FactoryType.MANUFACTURING) {
          const currentIds = project.manufacturerId 
            ? (Array.isArray(project.manufacturerId) ? project.manufacturerId : [project.manufacturerId])
            : [];
          // Set을 사용하여 중복 제거
          updates.manufacturerId = [...new Set([...currentIds, factory.id])];
        } else if (factory.type === FactoryType.CONTAINER) {
          const currentIds = project.containerId 
            ? (Array.isArray(project.containerId) ? project.containerId : [project.containerId])
            : [];
          // Set을 사용하여 중복 제거
          updates.containerId = [...new Set([...currentIds, factory.id])];
        } else if (factory.type === FactoryType.PACKAGING) {
          const currentIds = project.packagingId 
            ? (Array.isArray(project.packagingId) ? project.packagingId : [project.packagingId])
            : [];
          // Set을 사용하여 중복 제거
          updates.packagingId = [...new Set([...currentIds, factory.id])];
        }
        
        if (Object.keys(updates).length > 0) {
          db.update('projects', currentProjectId, updates);
        }
      }
    } catch (error) {
      console.error('Failed to update project factory IDs:', error);
    }
    
    const updatedFactories = updatedProjects.reduce((acc, factory) => {
      acc[factory.id] = factory;
      return acc;
    }, {} as Record<string, ScheduleFactory>);
    
    localStorage.setItem(`schedule_factories_${currentProjectId}`, JSON.stringify(updatedFactories));
  };

  return {
    handleDeleteProject,
    handleAddProject
  };
};