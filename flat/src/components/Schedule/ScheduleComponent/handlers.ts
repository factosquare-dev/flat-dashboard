import type { Task, ScheduleFactory } from '../../../types/schedule';
import type { TaskData } from './types';
import { MockDatabaseImpl } from '../../../mocks/database/MockDatabase';
import { DB_COLLECTIONS } from '../../../mocks/database/types';
import { storageKeys } from '../../../config';
import { FactoryType } from '../../../types/enums';

interface TaskControls {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  addTask: (task: Partial<Task>) => void;
  updateTask: (taskId: string, task: Task) => Promise<void>;
  deleteTask: (taskId: string) => void;
}

interface ModalState {
  showTaskEditModal?: boolean;
  selectedTask?: Task | null;
  showTaskModal?: boolean;
  selectedFactoryId?: string | null;
  selectedDate?: string | null;
  showProductRequestModal?: boolean;
  showWorkflowModal?: boolean;
  showEmailModal?: boolean;
  selectedFactories?: string[];
}

type SetModalState = React.Dispatch<React.SetStateAction<ModalState>>;

type ToastError = (title: string, message: string) => void;
import { factories, taskTypesByFactoryType } from '../../../data/factories';
import { findAvailableDateRange } from '../../../utils/taskUtils';
import { projectColors } from '../../../data/mockData';
import { getFactoryByIdOrName } from '../../../utils/factoryUtils';
import { getParticipantColor } from '../../../utils/scheduleColorManager';

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
      
      // Project deletion logging removed for cleaner console
      
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
              const filtered = ids.filter(id => id !== projectId);
              updates.manufacturerId = filtered.length > 0 ? filtered : undefined;
            } else if (projectToDelete.type === FactoryType.CONTAINER && project.containerId) {
              const ids = Array.isArray(project.containerId) ? project.containerId : [project.containerId];
              const filtered = ids.filter(id => id !== projectId);
              updates.containerId = filtered.length > 0 ? filtered : undefined;
            } else if (projectToDelete.type === FactoryType.PACKAGING && project.packagingId) {
              const ids = Array.isArray(project.packagingId) ? project.packagingId : [project.packagingId];
              const filtered = ids.filter(id => id !== projectId);
              updates.packagingId = filtered.length > 0 ? filtered : undefined;
            }
            
            // update 메서드 사용 - 부분 업데이트만 전달
            db.update(DB_COLLECTIONS.PROJECTS, currentProjectId, updates);
            console.log('[Schedule] Factory removed from project:', {
              projectId: currentProjectId,
              deletedFactoryId: projectId,
              factoryType: projectToDelete.type,
              updates
            });
          }
        } catch (error) {
          // Error saving to MockDB
        }
      }
      
      // 안전성을 위해 projectId와 factoryId 모두 확인
      const remainingTasks = taskControls.tasks.filter((t: Task) => {
        // 1. 다른 프로젝트의 태스크 보호
        // currentProjectId가 있고, 태스크의 projectId가 현재 프로젝트와 다르면 보호
        if (currentProjectId && t.projectId && t.projectId !== currentProjectId) {
          // Task protection logging removed for cleaner console
          return true; // 다른 프로젝트의 태스크는 유지
        }
        
        // 2. factoryId가 일치하는 태스크만 삭제
        const shouldRemove = t.factoryId === projectId;
          
        // Task removal logging removed for cleaner console
        
        return !shouldRemove;
      });
      
      // Project deletion result logging removed for cleaner console
      
      // MockDB에서도 태스크 삭제
      if (currentProjectId) {
        const deletedTasks = taskControls.tasks.filter((t: Task) => {
          if (currentProjectId && t.projectId && t.projectId !== currentProjectId) {
            return false;
          }
          return t.factoryId === projectId;
        });
        
        // MockDB에서 각 태스크 삭제
        const db = MockDatabaseImpl.getInstance();
        deletedTasks.forEach((task: Task) => {
          if (task.id) {
            db.delete(DB_COLLECTIONS.TASKS, task.id).catch(() => {
              // Error deleting task from MockDB
            });
          }
        });
        
        console.log('[Schedule] Cascade deleted tasks:', {
          factoryId: projectId,
          deletedTaskCount: deletedTasks.length
        });
      }
      
      taskControls.setTasks(remainingTasks);
    }
  };

  const handleAddFactory = (factory: { id: string; name: string; type: string }) => {
    // 이미 존재하지 않는 경우에만 추가
    if (!projects.find(p => p.id === factory.id)) {
      const newProject: ScheduleFactory = {
        id: factory.id,
        name: factory.name,
        type: factory.type,
        period: '',
        color: getParticipantColor(factory.id) // Use color manager
      };
      
      // "공장 추가" 행 바로 위에 추가하기 위해 splice 사용
      setProjects(prev => {
        const newProjects = [...prev];
        const addFactoryIndex = newProjects.findIndex(p => p.id === 'ADD_FACTORY_ROW');
        if (addFactoryIndex !== -1) {
          // "공장 추가" 행 바로 위에 삽입
          newProjects.splice(addFactoryIndex, 0, newProject);
        } else {
          // "공장 추가" 행이 없으면 마지막에 추가
          newProjects.push(newProject);
        }
        return newProjects;
      });
    }
  };

  const handleAddFactories = (factories: Array<{ id: string; name: string; type: string }>) => {
    setProjects(prev => {
      const newProjects = [...prev];
      const addFactoryIndex = newProjects.findIndex(p => p.id === 'ADD_FACTORY_ROW');
      
      // 이미 존재하지 않는 공장들만 필터링
      const factoriesToAdd = factories.filter(factory => 
        !newProjects.find(p => p.id === factory.id)
      );
      
      // 새로운 프로젝트 객체들 생성
      const newParticipants = factoriesToAdd.map(factory => ({
        id: factory.id,
        name: factory.name,
        type: factory.type,
        period: '',
        color: getParticipantColor(factory.id)
      }));
      
      if (addFactoryIndex !== -1) {
        // "공장 추가" 행 바로 위에 모든 새 공장들을 삽입
        newProjects.splice(addFactoryIndex, 0, ...newParticipants);
      } else {
        // "공장 추가" 행이 없으면 마지막에 추가
        newProjects.push(...newParticipants);
      }
      
      // Project의 factory ID들을 업데이트
      if (currentProjectId) {
        try {
          const db = MockDatabaseImpl.getInstance();
          const database = db.getDatabase();
          const project = database.projects.get(currentProjectId);
          
          if (project) {
            // 기존 ID 배열에 새로운 공장 ID들만 추가
            const updates: any = {};
            
            // 새로 추가되는 공장들을 타입별로 그룹화
            const newManufacturerIds: string[] = [];
            const newContainerIds: string[] = [];
            const newPackagingIds: string[] = [];
            
            factoriesToAdd.forEach(factory => {
              if (factory.type === FactoryType.MANUFACTURING) {
                newManufacturerIds.push(factory.id);
              } else if (factory.type === FactoryType.CONTAINER) {
                newContainerIds.push(factory.id);
              } else if (factory.type === FactoryType.PACKAGING) {
                newPackagingIds.push(factory.id);
              }
            });
            
            // 기존 배열에 새 ID들 추가
            if (newManufacturerIds.length > 0) {
              const existing = project.manufacturerId ? 
                (Array.isArray(project.manufacturerId) ? project.manufacturerId : [project.manufacturerId]) : [];
              updates.manufacturerId = [...existing, ...newManufacturerIds];
            }
            if (newContainerIds.length > 0) {
              const existing = project.containerId ? 
                (Array.isArray(project.containerId) ? project.containerId : [project.containerId]) : [];
              updates.containerId = [...existing, ...newContainerIds];
            }
            if (newPackagingIds.length > 0) {
              const existing = project.packagingId ? 
                (Array.isArray(project.packagingId) ? project.packagingId : [project.packagingId]) : [];
              updates.packagingId = [...existing, ...newPackagingIds];
            }
            
            // update 메서드 사용 - 부분 업데이트만 전달
            db.update(DB_COLLECTIONS.PROJECTS, currentProjectId, updates);
            console.log('[Schedule] Factories added to project:', {
              projectId: currentProjectId,
              addedFactories: factoriesToAdd.map(f => ({ id: f.id, name: f.name, type: f.type })),
              updates
            });
          }
        } catch (error) {
          // Error saving to MockDB
        }
      }
      
      return newProjects;
    });
  };

  return { handleDeleteProject, handleAddFactory, handleAddFactories };
};

export const createTaskHandlers = (
  projects: ScheduleFactory[],
  taskControls: TaskControls,
  modalState: ModalState,
  setModalState: SetModalState,
  toastError: ToastError
) => {
  const handleTaskSave = async (updatedTask: Task) => {
    if (modalState.selectedTask) {
      try {
        await taskControls.updateTask(modalState.selectedTask.id, updatedTask);
        setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
      } catch {
        // Task update error logging removed for cleaner console
        // Keep modal open on error
        toastError('태스크 업데이트 실패', '태스크 업데이트 중 오류가 발생했습니다.');
      }
    }
  };

  const handleTaskDelete = () => {
    if (modalState.selectedTask) {
      taskControls.deleteTask(modalState.selectedTask.id);
      setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
    }
  };

  const handleQuickTaskCreate = (taskData: TaskData & { projectId: string; factoryId: string }) => {
    const factory = getFactoryByIdOrName(factories, taskData.factoryId);
    const defaultTaskType = factory ? taskTypesByFactoryType[factory.type]?.[0] || '태스크' : '태스크';
    
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      taskData.projectId || currentProjectId || '', // 올바른 projectId 사용
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: taskData.projectId || currentProjectId || '', // 올바른 projectId
      title: defaultTaskType,
      taskType: defaultTaskType,
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: factory?.name,
      factoryId: taskData.factoryId // 올바른 factoryId
    });
  };
  
  const handleTaskCreate = (taskData: TaskData) => {
    const factoryId = modalState.selectedFactoryId || projects[0]?.id || '';
    const factory = getFactoryByIdOrName(factories, factoryId);
    
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      currentProjectId || '', // projectId를 전달해야 함
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: currentProjectId || '', // 실제 projectId 사용
      title: taskData.taskType || '태스크',
      taskType: taskData.taskType || '태스크',
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory || factory?.name,
      factoryId: taskData.factoryId || factoryId
    });
    
    setModalState(prev => ({ ...prev, showTaskModal: false, selectedFactoryId: null, selectedDate: null }));
  };

  return {
    handleTaskSave,
    handleTaskDelete,
    handleQuickTaskCreate,
    handleTaskCreate
  };
};

export const createModalHandlers = (
  projects: ScheduleFactory[],
  selectedProjects: string[],
  setModalState: SetModalState
) => {
  const handleAddProject = () => {
    setModalState(prev => ({ ...prev, showProductRequestModal: true }));
  };

  const handleOpenWorkflow = () => {
    setModalState(prev => ({ ...prev, showWorkflowModal: true }));
  };

  const handleOpenEmail = () => {
    const selectedFactories = selectedProjects.length > 0 
      ? projects.reduce((factories, p) => {
          if (selectedProjects.includes(p.id)) {
            factories.push(p.name);
          }
          return factories;
        }, [] as string[])
      : []; // 선택된 것이 없으면 빈 배열로 설정
    setModalState(prev => ({ 
      ...prev, 
      showEmailModal: true, 
      selectedFactories 
    }));
  };

  const handleAddTask = () => {
    setModalState(prev => ({ ...prev, showTaskModal: true }));
  };

  return {
    handleAddProject,
    handleOpenWorkflow,
    handleOpenEmail,
    handleAddTask
  };
};