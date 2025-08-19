/**
 * Schedule CRUD operations
 */

import type { Schedule, Task } from '@/types/schedule';
import type { Project } from '@/types/project';
import { USE_MOCK_DATA } from '@/config/mock';
import { getDatabaseWithRetry } from '@/mocks/database/utils';
import { mockDataService } from '@/services/mockDataService';
import { transformDatabaseTask } from './taskTransformers';
import { validateTaskDates } from './validation';

/**
 * Get or create schedule for project
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
              // Get factory from database
              const factory = database.factories.get(task.factoryId);
              return transformDatabaseTask(task, factory, existingSchedule.projectId);
            });
          
          return {
            ...existingSchedule,
            tasks: scheduleTasks,
          };
        }
        
        // Create new schedule if not exists
        const newSchedule: Schedule = {
          id: `schedule-${project.id}`,
          projectId: project.id,
          status: 'draft',
          startDate: project.startDate,
          endDate: project.endDate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          tasks: [],
        };
        
        // Create schedule in database
        await mockDataService.createSchedule(newSchedule);
        
        return newSchedule;
      }
    } catch (error) {
      console.error('Error getting schedule from mock database:', error);
    }
  }
  
  // Check existing schedules
  const existingSchedule = existingSchedules.get(project.id);
  if (existingSchedule) {
    return existingSchedule;
  }
  
  // Create new schedule
  const newSchedule: Schedule = {
    id: `schedule-${project.id}`,
    projectId: project.id,
    status: 'active',
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    tasks: [],
  };
  
  return newSchedule;
};

/**
 * Get schedules for multiple projects
 */
export const getSchedulesForProjects = async (
  projects: Project[]
): Promise<Map<string, Schedule>> => {
  const scheduleMap = new Map<string, Schedule>();
  
  if (USE_MOCK_DATA) {
    try {
      const database = await getDatabaseWithRetry();
      
      if (database && database.schedules) {
        for (const project of projects) {
          const schedule = await getOrCreateScheduleForProject(project, scheduleMap);
          scheduleMap.set(project.id, schedule);
        }
      }
    } catch (error) {
      console.error('Error getting schedules from mock database:', error);
    }
  } else {
    // Create schedules for each project
    for (const project of projects) {
      const schedule = await getOrCreateScheduleForProject(project, new Map());
      scheduleMap.set(project.id, schedule);
    }
  }
  
  return scheduleMap;
};

/**
 * Update schedule
 */
export const updateSchedule = async (
  scheduleId: string,
  updates: Partial<Schedule>
): Promise<Schedule> => {
  if (USE_MOCK_DATA) {
    const result = await mockDataService.updateSchedule(scheduleId, updates);
    if (result) {
      return result;
    }
  }
  
  throw new Error('Failed to update schedule');
};

/**
 * Delete schedule
 */
export const deleteSchedule = async (scheduleId: string): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    return await mockDataService.deleteSchedule(scheduleId);
  }
  
  throw new Error('Failed to delete schedule');
};

/**
 * Add task to schedule
 */
export const addTaskToSchedule = async (
  scheduleId: string,
  task: Omit<Task, 'id'>
): Promise<Task> => {
  if (USE_MOCK_DATA) {
    // Get schedule first to validate
    const database = await getDatabaseWithRetry();
    const schedule = database?.schedules.get(scheduleId);
    
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    
    // Get all tasks for this schedule to validate
    const allTasks = Array.from(database.tasks.values());
    const scheduleTasks = allTasks.filter(t => t.scheduleId === scheduleId);
    
    // Validate new task doesn't overlap
    validateTaskDates([...scheduleTasks, task as Task], schedule.startDate, schedule.endDate);
    
    const result = await mockDataService.createTask({
      ...task,
      scheduleId,
    });
    
    if (result) {
      return result;
    }
  }
  
  throw new Error('Failed to add task to schedule');
};

/**
 * Update task in schedule
 */
export const updateTaskInSchedule = async (
  taskId: string,
  updates: Partial<Task>
): Promise<Task> => {
  if (USE_MOCK_DATA) {
    // Get task and schedule to validate
    const database = await getDatabaseWithRetry();
    const existingTask = database?.tasks.get(taskId);
    
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    const schedule = database?.schedules.get(existingTask.scheduleId);
    if (!schedule) {
      throw new Error('Schedule not found');
    }
    
    // Get all tasks for validation
    const allTasks = Array.from(database.tasks.values());
    const scheduleTasks = allTasks
      .filter(t => t.scheduleId === existingTask.scheduleId && t.id !== taskId)
      .map(t => ({ ...t, ...updates }));
    
    // Validate updated task doesn't create overlaps
    validateTaskDates(scheduleTasks, schedule.startDate, schedule.endDate);
    
    const result = await mockDataService.updateTask(taskId, updates);
    if (result) {
      return result;
    }
  }
  
  throw new Error('Failed to update task');
};

/**
 * Delete task from schedule
 */
export const deleteTaskFromSchedule = async (taskId: string): Promise<boolean> => {
  if (USE_MOCK_DATA) {
    return await mockDataService.deleteTask(taskId);
  }
  
  throw new Error('Failed to delete task');
};