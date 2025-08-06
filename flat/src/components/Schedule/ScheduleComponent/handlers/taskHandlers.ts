import type { Task, ScheduleFactory } from '@/types/schedule';
import type { TaskData } from '../types';
import { factories, taskTypesByFactoryType } from '@/data/factories';
import { findAvailableDateRange } from '@/utils/taskUtils';
import { getFactoryByIdOrName } from '@/utils/factoryUtils';

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

export const createTaskHandlers = (
  projects: ScheduleFactory[],
  taskControls: TaskControls,
  modalState: ModalState,
  setModalState: SetModalState,
  toastError: ToastError,
  currentProjectId?: string
) => {
  const handleTaskSave = async (updatedTask: Task) => {
    if (modalState.selectedTask) {
      try {
        await taskControls.updateTask(modalState.selectedTask.id, updatedTask);
        setModalState(prev => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
      } catch {
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
      taskData.projectId || currentProjectId || '',
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: taskData.projectId || currentProjectId || '',
      title: defaultTaskType,
      taskType: defaultTaskType,
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: factory?.name,
      factoryId: taskData.factoryId
    });
  };
  
  const handleTaskCreate = (taskData: TaskData) => {
    const factoryId = modalState.selectedFactoryId || projects[0]?.id || '';
    const factory = getFactoryByIdOrName(factories, factoryId);
    
    const duration = Math.ceil((new Date(taskData.endDate).getTime() - new Date(taskData.startDate).getTime()) / (1000 * 60 * 60 * 24));
    const availableRange = findAvailableDateRange(
      currentProjectId || '',
      taskData.startDate,
      duration,
      taskControls.tasks
    );
    
    taskControls.addTask({
      projectId: currentProjectId || '',
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