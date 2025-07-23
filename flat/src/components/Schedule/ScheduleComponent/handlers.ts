import type { Task, Participant } from '../../../types/schedule';
import type { TaskData } from './types';
import { factories, taskTypesByFactoryType } from '../../../data/factories';
import { findAvailableDateRange } from '../../../utils/taskUtils';
import { projectColors } from '../../../data/mockData';

export const createProjectHandlers = (
  projects: Participant[],
  setProjects: React.Dispatch<React.SetStateAction<Participant[]>>,
  taskControls: any
) => {
  const handleDeleteProject = (projectId: string) => {
    if (confirm('정말로 이 프로젝트를 삭제하시겠습니까?')) {
      setProjects(projects.filter(p => p.id !== projectId));
      taskControls.setTasks(taskControls.tasks.filter((t: Task) => t.projectId !== projectId));
    }
  };

  const handleAddFactory = (factory: { id: string; name: string; type: string }) => {
    // 이미 존재하지 않는 경우에만 추가
    if (!projects.find(p => p.id === factory.id)) {
      // 현재 사용중인 색상들 찾기
      const usedColors = projects.map(p => p.color);
      
      // 사용되지 않은 첫 번째 색상 찾기
      const availableColor = projectColors.find(color => !usedColors.includes(color)) || projectColors[projects.length % projectColors.length];
      
      const newProject: Participant = {
        id: factory.id,
        name: factory.name,
        type: factory.type,
        period: '',
        color: availableColor
      };
      
      setProjects(prev => [...prev, newProject]);
    }
  };

  return { handleDeleteProject, handleAddFactory };
};

export const createTaskHandlers = (
  projects: Participant[],
  taskControls: any,
  modalState: any,
  setModalState: any,
  toastError: any
) => {
  const handleTaskSave = async (updatedTask: Task) => {
    if (modalState.selectedTask) {
      try {
        await taskControls.updateTask(modalState.selectedTask.id, updatedTask);
        setModalState((prev: any) => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
      } catch (error) {
        console.error('[Schedule] Failed to update task:', error);
        // Keep modal open on error
        toastError('태스크 업데이트 실패', '태스크 업데이트 중 오류가 발생했습니다.');
      }
    }
  };

  const handleTaskDelete = () => {
    if (modalState.selectedTask) {
      taskControls.deleteTask(modalState.selectedTask.id);
      setModalState((prev: any) => ({ ...prev, showTaskEditModal: false, selectedTask: null }));
    }
  };

  const handleQuickTaskCreate = (taskData: TaskData & { projectId: string }) => {
    const factory = factories.find(f => f.name === taskData.factory);
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
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory
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
      startDate: availableRange.startDate,
      endDate: availableRange.endDate,
      factory: taskData.factory
    });
    
    setModalState((prev: any) => ({ ...prev, showTaskModal: false, selectedProjectId: null, selectedDate: null }));
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
  setModalState: any
) => {
  const handleAddProject = () => {
    setModalState((prev: any) => ({ ...prev, showProductRequestModal: true }));
  };

  const handleOpenWorkflow = () => {
    setModalState((prev: any) => ({ ...prev, showWorkflowModal: true }));
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
    setModalState((prev: any) => ({ 
      ...prev, 
      showEmailModal: true, 
      selectedFactories 
    }));
  };

  const handleAddTask = () => {
    setModalState((prev: any) => ({ ...prev, showTaskModal: true }));
  };

  return {
    handleAddProject,
    handleOpenWorkflow,
    handleOpenEmail,
    handleAddTask
  };
};