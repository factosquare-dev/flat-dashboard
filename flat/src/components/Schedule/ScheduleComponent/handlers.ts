import type { Task, Participant } from '../../../types/schedule';
import type { TaskData } from './types';

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
  selectedProjectId?: string | null;
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

export const createProjectHandlers = (
  projects: Participant[],
  setProjects: React.Dispatch<React.SetStateAction<Participant[]>>,
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
      setProjects(projects.filter(p => p.id !== projectId));
      
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
      
      taskControls.setTasks(remainingTasks);
    }
  };

  const handleAddFactory = (factory: { id: string; name: string; type: string }) => {
    // 이미 존재하지 않는 경우에만 추가
    if (!projects.find(p => p.id === factory.id)) {
      // 색상 배열
      const colors = [
        "#3b82f6", // blue-500
        "#ef4444", // red-500
        "#22c55e", // green-500
        "#eab308", // yellow-500
        "#a855f7", // purple-500
        "#ec4899", // pink-500
        "#6366f1", // indigo-500
        "#f97316", // orange-500
        "#14b8a6", // teal-500
        "#06b6d4"  // cyan-500
      ];
      
      // 랜덤 색상 선택
      const randomColor = colors[Math.floor(Math.random() * colors.length)];
      
      const newProject: Participant = {
        id: factory.id,
        name: factory.name,
        type: factory.type,
        period: '',
        color: randomColor
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

  return { handleDeleteProject, handleAddFactory };
};

export const createTaskHandlers = (
  projects: Participant[],
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

  const handleQuickTaskCreate = (taskData: TaskData & { projectId: string }) => {
    // Use ID-based lookup with name fallback for backward compatibility
    const factory = getFactoryByIdOrName(factories, taskData.factoryId || taskData.factory || '');
    const defaultTaskType = factory ? taskTypesByFactoryType[factory.type]?.[0] || '태스크' : '태스크';
    
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      taskData.projectId,
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: taskData.projectId,
      title: defaultTaskType,
      taskType: defaultTaskType,
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory || factory?.name,
      factoryId: taskData.factoryId || factory?.id
    });
  };
  
  const handleTaskCreate = (taskData: TaskData) => {
    const projectId = modalState.selectedProjectId || projects[0]?.id || '';
    
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      projectId,
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: projectId,
      title: taskData.taskType || '태스크',
      taskType: taskData.taskType || '태스크',
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory,
      factoryId: taskData.factoryId
    });
    
    setModalState(prev => ({ ...prev, showTaskModal: false, selectedProjectId: null, selectedDate: null }));
  };

  return {
    handleTaskSave,
    handleTaskDelete,
    handleQuickTaskCreate,
    handleTaskCreate
  };
};

export const createModalHandlers = (
  projects: Participant[],
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