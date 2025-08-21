/**
 * Common utilities for Schedule views (Table and Gantt)
 */

import type { Task, Participant } from '@/shared/types/schedule';
import { eachDayOfInterval, startOfDay } from 'date-fns';

/**
 * Generate an array of dates between start and end date using date-fns
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Array of Date objects for each day in the range
 */
export const getDaysArray = (startDate: Date, endDate: Date): Date[] => {
  // Ensure both dates are at start of day
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  
  // Generate array of dates using date-fns
  return eachDayOfInterval({ start, end });
};

/**
 * Filter tasks for a specific factory/participant
 * This ensures consistency between Table and Gantt views
 * 
 * @param tasks - All tasks
 * @param factory - The factory/participant to filter for
 * @returns Filtered tasks for this factory
 */
export const getTasksForFactory = (tasks: Task[], factory: Participant): Task[] => {
  return tasks.filter(task => {
    // Primary: Match by factoryId (most reliable)
    if (task.factoryId && task.factoryId === factory.id) {
      return true;
    }
    
    // Fallback 1: Match by factory name (exact match)
    if (task.factory === factory.name) {
      return true;
    }
    
    // Fallback 2: Match by factory name without type suffix
    // Handle cases where participant name includes type like "공장이름 (제조)"
    const factoryNameWithoutType = factory.name.replace(/\s*\([^)]*\)\s*$/, '').trim();
    if (task.factory === factoryNameWithoutType) {
      return true;
    }
    
    // Fallback 3: For legacy data where factoryId might be missing
    // Only use projectId matching if factoryId is not available
    if (!task.factoryId && task.projectId === factory.id) {
      return true;
    }
    
    return false;
  });
};

/**
 * Group tasks by factory for display
 * @param tasks - All tasks
 * @param factories - All factories/participants
 * @returns Map of factory ID to tasks
 */
export const groupTasksByFactory = (
  tasks: Task[], 
  factories: Participant[]
): Map<string, Task[]> => {
  const taskMap = new Map<string, Task[]>();
  
  factories.forEach(factory => {
    const factoryTasks = getTasksForFactory(tasks, factory);
    taskMap.set(factory.id, factoryTasks);
  });
  
  return taskMap;
};

/**
 * Get all unique factories from tasks
 * This helps identify which factories actually have tasks
 */
export const getFactoriesWithTasks = (tasks: Task[]): Set<string> => {
  const factories = new Set<string>();
  
  tasks.forEach(task => {
    if (task.factory) {
      factories.add(task.factory);
    }
  });
  
  return factories;
};

/**
 * Validate task-factory relationship
 * Useful for debugging data consistency issues
 */
export const validateTaskFactoryData = (tasks: Task[], factories: Participant[]) => {
  const issues: string[] = [];
  
  // Check for tasks without factory assignment
  const tasksWithoutFactory = tasks.filter(t => !t.factory && !t.factoryId);
  if (tasksWithoutFactory.length > 0) {
    issues.push(`${tasksWithoutFactory.length} tasks have no factory assignment`);
  }
  
  // Check for tasks with factory names that don't match any participant
  const factoryNames = new Set(factories.map(f => f.name));
  const factoryNamesWithoutType = new Set(
    factories.map(f => f.name.replace(/\s*\([^)]*\)\s*$/, '').trim())
  );
  
  const tasksWithInvalidFactory = tasks.filter(t => {
    if (!t.factory) return false;
    // Check both with and without type suffix
    return !factoryNames.has(t.factory) && !factoryNamesWithoutType.has(t.factory);
  });
  
  if (tasksWithInvalidFactory.length > 0) {
    issues.push(`${tasksWithInvalidFactory.length} tasks have invalid factory names`);
  }
  
  // Check factoryId consistency
  const factoryIds = new Set(factories.map(f => f.id));
  const tasksWithInvalidFactoryId = tasks.filter(t => 
    t.factoryId && !factoryIds.has(t.factoryId)
  );
  if (tasksWithInvalidFactoryId.length > 0) {
    issues.push(`${tasksWithInvalidFactoryId.length} tasks have invalid factory IDs`);
  }
  
  return {
    isValid: issues.length === 0,
    issues,
    summary: {
      totalTasks: tasks.length,
      tasksWithFactory: tasks.filter(t => t.factory).length,
      tasksWithFactoryId: tasks.filter(t => t.factoryId).length,
      uniqueFactories: getFactoriesWithTasks(tasks).size
    }
  };
};