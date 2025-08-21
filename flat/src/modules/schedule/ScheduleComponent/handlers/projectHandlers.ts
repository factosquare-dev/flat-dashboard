import type { Task, ScheduleFactory, FactoryAssignment } from '@/shared/types/schedule';
import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import { FactoryType, TaskType, TaskStatus } from '@/shared/types/enums';
import { toFactoryId } from '@/shared/types/branded';
import { factories } from '@/core/database/factories';
import { getFactoryByIdOrName } from '@/shared/utils/factoryUtils';
import { getParticipantColor } from '@/shared/utils/scheduleColorManager';
import { mockDataService } from '@/core/services/mockDataService';

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
  // TASK-CENTRIC: Remove factory from task assignments
  const handleDeleteFactory = (factoryId: string) => {
    if (confirm('정말로 이 공장을 태스크에서 제거하시겠습니까?')) {
      if (!currentProjectId) return;
      
      // Remove factory from all tasks
      const projectTasks = mockDataService.getTasksByProjectId(currentProjectId);
      projectTasks.forEach(task => {
        mockDataService.removeFactoryFromTask(task.id, factoryId);
      });
      
      // Remove from visual representation
      const updatedProjects = projects.filter(p => p.id !== factoryId);
      setProjects(updatedProjects);
      
      // Refresh tasks
      const updatedTasks = mockDataService.getTasksByProjectId(currentProjectId);
      taskControls.setTasks(updatedTasks);
    }
  };

  // TASK-CENTRIC: Add factory assignment to existing tasks
  const handleAddFactory = (factoryData: { id: string; name: string; type: string }) => {
    if (!currentProjectId) return;
    
    const factory = getFactoryByIdOrName(factories, factoryData.id);
    if (!factory) {
      alert('공장을 찾을 수 없습니다.');
      return;
    }

    // Get all tasks for the current project
    const projectTasks = mockDataService.getTasksByProjectId(currentProjectId);
    
    if (projectTasks.length === 0) {
      alert('이 프로젝트에 태스크가 없습니다. 먼저 태스크를 추가해주세요.');
      return;
    }

    // Assign factory to all relevant tasks based on factory type
    projectTasks.forEach(task => {
      // Check if factory is already assigned
      const alreadyAssigned = task.factoryAssignments?.some(
        fa => fa.factoryId === factory.id
      );
      
      if (!alreadyAssigned) {
        // Determine role based on factory type and task type
        let role: 'primary' | 'secondary' | 'sample' = 'secondary';
        
        // For prototyping tasks, factories are for sampling
        if (task.taskType === TaskType.PROTOTYPING) {
          role = 'sample';
        } 
        // First factory of this type becomes primary
        else if (!task.factoryAssignments?.some(fa => 
          mockDataService.getFactoryById(fa.factoryId)?.type === factory.type
        )) {
          role = 'primary';
        }
        
        const newAssignment: FactoryAssignment = {
          factoryId: factory.id,
          factoryName: factory.name,
          factoryType: factory.type as FactoryType,
          role,
          status: task.status,
          progress: task.progress,
          startDate: task.startDate,
          endDate: task.endDate
        };
        
        mockDataService.assignFactoryToTask(task.id, newAssignment);
      }
    });

    // Add to visual representation
    const newProject: ScheduleFactory = {
      id: factory.id,
      name: factory.name,
      type: factory.type as FactoryType,
      color: getParticipantColor(factory.name) || '#000000',
      tasks: []
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    
    // Refresh tasks to show updated factory assignments
    const updatedTasks = mockDataService.getTasksByProjectId(currentProjectId);
    taskControls.setTasks(updatedTasks);
  };

  // TASK-CENTRIC: Add multiple factories at once
  const handleAddFactories = (factoriesData: Array<{ id: string; name: string; type: string }>) => {
    factoriesData.forEach(factoryData => {
      handleAddFactory(factoryData);
    });
  };

  return {
    handleDeleteProject: handleDeleteFactory,  // Renamed for consistency
    handleAddFactory,
    handleAddFactories
  };
};