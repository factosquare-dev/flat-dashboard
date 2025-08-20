/**
 * Schedule synchronization operations
 */

import type { Schedule, Task } from '@/shared/types/schedule';
import type { Project } from '@/shared/types/project';
import { USE_MOCK_DATA } from '@/app/config/mock';
import { getDatabaseWithRetry } from '@/core/database/utils';
import { mockDataService } from '@/core/services/mockDataService';
import { transformDatabaseTask } from './taskTransformers';
import { validateTaskDates, validateTaskDependencies } from './validation';
import { getToday } from '@/shared/utils/unifiedDateUtils';

/**
 * Sync schedule with project data
 */
export async function syncScheduleWithProject(
  scheduleId: string,
  project: Project
): Promise<Schedule> {
  if (USE_MOCK_DATA) {
    try {
      const database = await getDatabaseWithRetry();
      
      if (!database) {
        throw new Error('Database not available');
      }
      
      const schedule = database.schedules.get(scheduleId);
      if (!schedule) {
        throw new Error(`Schedule ${scheduleId} not found`);
      }
      
      // Update schedule dates to match project
      const updatedSchedule = {
        ...schedule,
        startDate: project.startDate,
        endDate: project.endDate,
        updatedAt: getToday(),
      };
      
      // Validate all tasks still fit within new dates
      const allTasks = Array.from(database.tasks.values());
      const scheduleTasks = allTasks.filter(task => task.scheduleId === scheduleId);
      
      try {
        validateTaskDates(scheduleTasks as Task[], project.startDate, project.endDate);
      } catch (error) {
        throw new Error(`Cannot sync schedule: ${error.message}`);
      }
      
      // Update schedule in database
      await mockDataService.updateSchedule(scheduleId, updatedSchedule);
      
      return updatedSchedule;
    } catch (error) {
      console.error('Error syncing schedule with project:', error);
      throw error;
    }
  }
  
  throw new Error('Schedule sync not implemented for non-mock data');
}

/**
 * Sync all schedules with their projects
 */
export async function syncAllSchedules(): Promise<{
  synced: number;
  failed: number;
  errors: Array<{ scheduleId: string; error: string }>;
}> {
  const result = {
    synced: 0,
    failed: 0,
    errors: [] as Array<{ scheduleId: string; error: string }>,
  };
  
  if (USE_MOCK_DATA) {
    try {
      const database = await getDatabaseWithRetry();
      
      if (!database) {
        throw new Error('Database not available');
      }
      
      const schedules = Array.from(database.schedules.values());
      
      for (const schedule of schedules) {
        try {
          const project = database.projects.get(schedule.projectId);
          
          if (!project) {
            result.failed++;
            result.errors.push({
              scheduleId: schedule.id,
              error: `Project ${schedule.projectId} not found`,
            });
            continue;
          }
          
          await syncScheduleWithProject(schedule.id, project);
          result.synced++;
        } catch (error) {
          result.failed++;
          result.errors.push({
            scheduleId: schedule.id,
            error: error.message || 'Unknown error',
          });
        }
      }
    } catch (error) {
      console.error('Error syncing all schedules:', error);
      throw error;
    }
  }
  
  return result;
}

/**
 * Validate schedule consistency
 */
export async function validateScheduleConsistency(
  scheduleId: string
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
}> {
  const result = {
    isValid: true,
    errors: [] as string[],
    warnings: [] as string[],
  };
  
  if (USE_MOCK_DATA) {
    try {
      const database = await getDatabaseWithRetry();
      
      if (!database) {
        result.isValid = false;
        result.errors.push('Database not available');
        return result;
      }
      
      // Check schedule exists
      const schedule = database.schedules.get(scheduleId);
      if (!schedule) {
        result.isValid = false;
        result.errors.push(`Schedule ${scheduleId} not found`);
        return result;
      }
      
      // Check project exists
      const project = database.projects.get(schedule.projectId);
      if (!project) {
        result.isValid = false;
        result.errors.push(`Project ${schedule.projectId} not found`);
        return result;
      }
      
      // Get all tasks for this schedule
      const allTasks = Array.from(database.tasks.values());
      const scheduleTasks = allTasks.filter(task => task.scheduleId === scheduleId);
      
      // Validate task dates
      try {
        validateTaskDates(scheduleTasks as Task[], schedule.startDate, schedule.endDate);
      } catch (error) {
        result.isValid = false;
        result.errors.push(error.message);
      }
      
      // Validate task dependencies
      try {
        validateTaskDependencies(scheduleTasks as Task[]);
      } catch (error) {
        result.isValid = false;
        result.errors.push(error.message);
      }
      
      // Check for orphaned tasks (tasks with non-existent factory)
      for (const task of scheduleTasks) {
        const factory = database.factories.get(task.factoryId);
        if (!factory) {
          result.warnings.push(`Task "${task.title}" references non-existent factory ${task.factoryId}`);
        }
      }
      
      // Check for tasks outside project dates
      const projectStart = new Date(project.startDate);
      const projectEnd = new Date(project.endDate);
      
      for (const task of scheduleTasks) {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        
        if (taskStart < projectStart || taskEnd > projectEnd) {
          result.warnings.push(
            `Task "${task.title}" (${task.startDate} ~ ${task.endDate}) is outside project dates (${project.startDate} ~ ${project.endDate})`
          );
        }
      }
      
      // Check for unused assigned factories
      const assignedFactoryIds = new Set<string>();
      if (project.manufacturerId) assignedFactoryIds.add(project.manufacturerId);
      if (project.containerId) assignedFactoryIds.add(project.containerId);
      if (project.packagingId) assignedFactoryIds.add(project.packagingId);
      
      const usedFactoryIds = new Set(scheduleTasks.map(task => task.factoryId));
      
      for (const factoryId of assignedFactoryIds) {
        if (!usedFactoryIds.has(factoryId)) {
          const factory = database.factories.get(factoryId);
          if (factory) {
            result.warnings.push(`Assigned factory "${factory.name}" has no tasks in the schedule`);
          }
        }
      }
      
    } catch (error) {
      result.isValid = false;
      result.errors.push(error.message || 'Unknown error during validation');
    }
  } else {
    result.isValid = false;
    result.errors.push('Schedule validation not implemented for non-mock data');
  }
  
  return result;
}