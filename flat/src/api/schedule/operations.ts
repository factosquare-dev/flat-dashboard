import type { Schedule, Task, Participant } from '../../types/schedule';
import type { Project } from '../../types/project';
import { createScheduleFromProject, createSampleInProgressTasks } from '../../data/projectScheduleData';
import { formatDate } from '../../utils/coreUtils';
import { USE_MOCK_DATA } from '../../mocks/mockData';
import { getDatabaseWithRetry } from '../../mocks/database/utils';
// Removed deprecated scheduleAdapter import
import { createMockSchedules } from '../../data/mockSchedules';
import { mockDataService } from '../../services/mockDataService';

/**
 * Fix overlapping tasks by adjusting their dates
 * Also ensures tasks stay within project boundaries
 */
function fixOverlappingTasks(tasks: any[], projectStartDate?: string, projectEndDate?: string): any[] {
  if (tasks.length === 0) return tasks;
  
  const projectStart = projectStartDate ? new Date(projectStartDate) : null;
  const projectEnd = projectEndDate ? new Date(projectEndDate) : null;
  
  // Sort tasks by start date
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  // Fix overlaps and ensure within project bounds
  for (let i = 0; i < sortedTasks.length; i++) {
    const currentTask = sortedTasks[i];
    const prevTask = i > 0 ? sortedTasks[i - 1] : null;
    
    let taskStart = new Date(currentTask.startDate);
    let taskEnd = new Date(currentTask.endDate);
    const duration = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // First, ensure task starts within project bounds
    if (projectStart && taskStart < projectStart) {
      taskStart = new Date(projectStart);
      taskEnd = new Date(taskStart);
      taskEnd.setDate(taskEnd.getDate() + duration);
    }
    
    // Check for overlap with previous task
    if (prevTask) {
      const prevEnd = new Date(prevTask.endDate);
      if (taskStart <= prevEnd) {
        taskStart = new Date(prevEnd);
        taskStart.setDate(taskStart.getDate() + 1); // Add 1 day gap
        taskEnd = new Date(taskStart);
        taskEnd.setDate(taskEnd.getDate() + duration);
      }
    }
    
    // Ensure task ends within project bounds
    if (projectEnd && taskEnd > projectEnd) {
      // If task would extend beyond project end, try to fit it before project end
      taskEnd = new Date(projectEnd);
      
      // Calculate new start date maintaining original duration if possible
      const newStartDate = new Date(taskEnd);
      newStartDate.setDate(newStartDate.getDate() - duration);
      
      // Check if new start date conflicts with previous task
      if (prevTask) {
        const prevEnd = new Date(prevTask.endDate);
        if (newStartDate <= prevEnd) {
          // Can't fit with original duration, use available space
          taskStart = new Date(prevEnd);
          taskStart.setDate(taskStart.getDate() + 1);
          
          // If there's no space at all, mark for removal
          if (taskStart >= projectEnd) {
            currentTask.startDate = formatDate(projectEnd, 'iso');
            currentTask.endDate = formatDate(projectEnd, 'iso');
            continue;
          }
        } else {
          taskStart = newStartDate;
        }
      } else {
        taskStart = newStartDate;
      }
      
      // Final check to ensure start is within bounds
      if (projectStart && taskStart < projectStart) {
        taskStart = new Date(projectStart);
      }
      
    }
    
    // Update task dates
    currentTask.startDate = formatDate(taskStart, 'iso');
    currentTask.endDate = formatDate(taskEnd, 'iso');
  }
  
  // Filter out tasks that don't fit within project bounds at all
  const validTasks = sortedTasks.filter(task => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    if (projectStart && taskEnd < projectStart) {
      return false;
    }
    if (projectEnd && taskStart > projectEnd) {
      return false;
    }
    return true;
  });
  
  return validTasks;
}

/**
 * 프로젝트로부터 스케줄 생성 또는 조회
 */
export const getOrCreateScheduleForProject = async (
  project: Project,
  existingSchedules: Map<string, Schedule>
): Promise<Schedule> => {
  
  // Use mock database if enabled
  if (USE_MOCK_DATA) {
    try {
      const database = await getDatabaseWithRetry();
      
      if (database && database.schedules) {
        const schedules = Array.from(database.schedules.values());
        const existingSchedule = schedules.find(s => s.projectId === project.id);
        
        if (existingSchedule) {
          
          // Get project data first
          const projectData = database.projects.get(existingSchedule.projectId);
          
          // Get assigned factory IDs for this project
          const assignedFactoryIds = new Set<string>();
          if (projectData) {
            if (projectData.manufacturerId) assignedFactoryIds.add(projectData.manufacturerId);
            if (projectData.containerId) assignedFactoryIds.add(projectData.containerId);
            if (projectData.packagingId) assignedFactoryIds.add(projectData.packagingId);
          }
          
          // Get tasks for this schedule - filter by assigned factories
          const allTasks = Array.from(database.tasks.values());
          
          const tasksForSchedule = allTasks.filter(task => task.scheduleId === existingSchedule.id);
          
          const scheduleTasks = tasksForSchedule
            .filter(task => assignedFactoryIds.has(task.factoryId))
            .map(task => {
              // Get factory name from factoryId
              const factory = database.factories.get(task.factoryId);
              const factoryColor = factory?.type === 'MANUFACTURING' ? 'blue' : 
                                   factory?.type === 'CONTAINER' ? 'red' : 
                                   factory?.type === 'PACKAGING' ? 'yellow' : 'gray';
              
              return {
                id: task.id,
                projectId: existingSchedule.projectId, // Use schedule's projectId instead of task's
                factory: factory?.name || '',
                factoryId: task.factoryId,
                taskType: task.title,
                startDate: typeof task.startDate === 'string' ? task.startDate : formatDate(new Date(task.startDate), 'iso'),
                endDate: typeof task.endDate === 'string' ? task.endDate : formatDate(new Date(task.endDate), 'iso'),
                status: task.status.toLowerCase().replace('_', '-'),
                assignee: task.assignee || '',
                color: factoryColor
              };
            });
          
          
          // Fix overlapping tasks and ensure within project bounds
          const fixedTasks = fixOverlappingTasks(scheduleTasks, existingSchedule.startDate, existingSchedule.endDate);
          
          
          // Get participants from project factories
          const participants = [];
          
          if (projectData) {
            if (projectData.manufacturerId && projectData.manufacturerId !== null) {
              const factory = database.factories.get(projectData.manufacturerId);
              if (factory) {
                const startDateStr = typeof existingSchedule.startDate === 'string' ? 
                  formatDate(new Date(existingSchedule.startDate)) : 
                  formatDate(existingSchedule.startDate);
                const endDateStr = typeof existingSchedule.endDate === 'string' ? 
                  formatDate(new Date(existingSchedule.endDate)) : 
                  formatDate(existingSchedule.endDate);
                
                participants.push({
                  id: factory.id,
                  name: factory.name,
                  period: `${startDateStr} ~ ${endDateStr}`,
                  color: 'blue'
                });
              }
            }
            
            if (projectData.containerId && projectData.containerId !== null) {
              const factory = database.factories.get(projectData.containerId);
              if (factory) {
                const startDateStr = typeof existingSchedule.startDate === 'string' ? 
                  formatDate(new Date(existingSchedule.startDate)) : 
                  formatDate(existingSchedule.startDate);
                const endDateStr = typeof existingSchedule.endDate === 'string' ? 
                  formatDate(new Date(existingSchedule.endDate)) : 
                  formatDate(existingSchedule.endDate);
                
                participants.push({
                  id: factory.id,
                  name: factory.name,
                  period: `${startDateStr} ~ ${endDateStr}`,
                  color: 'red'
                });
              }
            }
            
            if (projectData.packagingId && projectData.packagingId !== null) {
              const factory = database.factories.get(projectData.packagingId);
              if (factory) {
                const startDateStr = typeof existingSchedule.startDate === 'string' ? 
                  formatDate(new Date(existingSchedule.startDate)) : 
                  formatDate(existingSchedule.startDate);
                const endDateStr = typeof existingSchedule.endDate === 'string' ? 
                  formatDate(new Date(existingSchedule.endDate)) : 
                  formatDate(existingSchedule.endDate);
                
                participants.push({
                  id: factory.id,
                  name: factory.name,
                  period: `${startDateStr} ~ ${endDateStr}`,
                  color: 'yellow'
                });
              }
            }
          }
          
          
          const result = {
            id: existingSchedule.id,
            projectId: existingSchedule.projectId,
            participants: participants,
            tasks: fixedTasks,
            startDate: typeof existingSchedule.startDate === 'string' ? existingSchedule.startDate : formatDate(new Date(existingSchedule.startDate)),
            endDate: typeof existingSchedule.endDate === 'string' ? existingSchedule.endDate : formatDate(new Date(existingSchedule.endDate)),
            createdAt: typeof existingSchedule.createdAt === 'string' ? existingSchedule.createdAt : existingSchedule.createdAt.toISOString(),
            updatedAt: typeof existingSchedule.updatedAt === 'string' ? existingSchedule.updatedAt : existingSchedule.updatedAt.toISOString()
          };
          
          return result;
        }
      }
    } catch (error) {
      // Fall through to old logic
    }
  }
  
  
  // Fallback: Create schedule with mock tasks for development
  
  // Get mock schedules and find tasks for this specific project
  let mockSchedules: Schedule[] = [];
  try {
    mockSchedules = createMockSchedules();
  } catch (error) {
  }
  
  const mockSchedule = mockSchedules.find(s => s.projectId === project.id);
  
  if (!mockSchedule) {
  } else {
  }
  
  // Filter tasks to fit within project dates
  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  
  // Create non-overlapping tasks within each factory
  let globalTaskId = 1;
  const filteredTasks: any[] = [];
  
  
  if (mockSchedule) {
    
    // Filter tasks that belong to this project only
    const projectTasks = mockSchedule.tasks.filter(task => 
      task.projectId === project.id
    );
    
    
    // Get assigned factories for this project
    const assignedFactoryIds = new Set<string>();
    if (project.manufacturer) {
      const factory = allFactories.find(f => f.id === project.manufacturer || f.name === project.manufacturer);
      if (factory) assignedFactoryIds.add(factory.id);
    }
    if (project.container) {
      const factory = allFactories.find(f => f.id === project.container || f.name === project.container);
      if (factory) assignedFactoryIds.add(factory.id);
    }
    if (project.packaging) {
      const factory = allFactories.find(f => f.id === project.packaging || f.name === project.packaging);
      if (factory) assignedFactoryIds.add(factory.id);
    }
    
    
    // Filter tasks to only include those from assigned factories
    const validProjectTasks = projectTasks.filter(task => {
      if (!task.factoryId) {
        return false;
      }
      const isValid = assignedFactoryIds.has(task.factoryId);
      if (!isValid) {
      }
      return isValid;
    });
    
    
    // Group tasks by factory
    const tasksByFactory = new Map<string, any[]>();
    validProjectTasks.forEach(task => {
      const factory = task.factory || 'Unknown';
      if (!tasksByFactory.has(factory)) {
        tasksByFactory.set(factory, []);
      }
      tasksByFactory.get(factory)!.push(task);
    });
    
    // Process each factory's tasks separately to avoid overlaps within the same factory
    tasksByFactory.forEach((factoryTasks, factoryName) => {
      const factory = mockSchedule.participants.find(p => p.name === factoryName);
      let lastEndDateForFactory = new Date(projectStart);
      
      
      // Sort tasks by original start date
      const sortedFactoryTasks = [...factoryTasks].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      sortedFactoryTasks.forEach((task, index) => {
        const taskDuration = Math.ceil(
          (new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // For each factory, ensure no overlap within that factory
        let newStartDate: Date;
        if (index === 0) {
          // First task starts at project start
          newStartDate = new Date(projectStart);
        } else {
          // Subsequent tasks start after previous task ends
          newStartDate = new Date(lastEndDateForFactory);
          newStartDate.setDate(newStartDate.getDate() + 2); // Add 2 day gap between tasks
        }
        
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + Math.max(3, taskDuration)); // Minimum 3 days per task
        
        // Only add task if it fits within project timeline
        if (newEndDate <= projectEnd) {
          const newTask = {
            ...task,
            id: globalTaskId++,
            projectId: project.id,
            factoryId: factory?.id || `factory-unknown`,
            startDate: formatDate(newStartDate, 'iso'),
            endDate: formatDate(newEndDate)
          };
          
          filteredTasks.push(newTask);
          lastEndDateForFactory = newEndDate;
        } else {
        }
      });
    });
  }
  
  // Get participants based on project's factories
  const participants: Participant[] = [];
  let allFactories: any[] = [];
  
  try {
    allFactories = mockDataService.getAllFactories();
  } catch (error) {
  }
  
  if (project.manufacturer && project.manufacturer !== 'null') {
    // Try to find by ID first, then by name
    const factory = allFactories.find(f => f.id === project.manufacturer || f.name === project.manufacturer);
    if (factory) {
      const startDateStr = formatDate(new Date(project.startDate), 'iso');
      const endDateStr = formatDate(new Date(project.endDate), 'iso');
      participants.push({
        id: factory.id,
        name: factory.name,
        period: `${startDateStr} ~ ${endDateStr}`,
        color: 'blue'
      });
    }
  }
  
  if (project.container && project.container !== 'null') {
    // Try to find by ID first, then by name
    const factory = allFactories.find(f => f.id === project.container || f.name === project.container);
    if (factory) {
      const startDateStr = formatDate(new Date(project.startDate), 'iso');
      const endDateStr = formatDate(new Date(project.endDate), 'iso');
      participants.push({
        id: factory.id,
        name: factory.name,
        period: `${startDateStr} ~ ${endDateStr}`,
        color: 'red'
      });
    }
  }
  
  if (project.packaging && project.packaging !== 'null') {
    // Try to find by ID first, then by name
    const factory = allFactories.find(f => f.id === project.packaging || f.name === project.packaging);
    if (factory) {
      const startDateStr = formatDate(new Date(project.startDate), 'iso');
      const endDateStr = formatDate(new Date(project.endDate), 'iso');
      participants.push({
        id: factory.id,
        name: factory.name,
        period: `${startDateStr} ~ ${endDateStr}`,
        color: 'yellow'
      });
    }
  }
  
  const newSchedule: Schedule = {
    id: `schedule-${project.id}-${Date.now()}`,
    projectId: project.id,
    participants: participants,
    tasks: filteredTasks,
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  
  
  if (USE_MOCK_DATA) {
    existingSchedules.set(newSchedule.id, newSchedule);
  }
  
  return newSchedule;
};

/**
 * 스케줄에 태스크 추가
 */
export const addTaskToSchedule = (
  schedule: Schedule,
  task: Omit<Task, 'id'>
): Schedule => {
  const newTaskId = Math.max(...schedule.tasks.map(t => 
    typeof t.id === 'number' ? t.id : parseInt(String(t.id)) || 0
  )) + 1;
  
  const newTask: Task = {
    ...task,
    id: newTaskId
  };
  
  return {
    ...schedule,
    tasks: [...schedule.tasks, newTask],
    updatedAt: new Date().toISOString()
  };
};

/**
 * 스케줄에서 태스크 업데이트
 */
export const updateTaskInSchedule = (
  schedule: Schedule,
  taskId: number | string,
  updates: Partial<Task>
): Schedule | null => {
  const taskIndex = schedule.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return null;
  
  const updatedTasks = [...schedule.tasks];
  updatedTasks[taskIndex] = {
    ...updatedTasks[taskIndex],
    ...updates
  };
  
  return {
    ...schedule,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString()
  };
};

/**
 * 스케줄에서 태스크 삭제
 */
export const deleteTaskFromSchedule = (
  schedule: Schedule,
  taskId: number | string
): Schedule => {
  return {
    ...schedule,
    tasks: schedule.tasks.filter(t => t.id !== taskId),
    updatedAt: new Date().toISOString()
  };
};