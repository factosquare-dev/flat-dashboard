/**
 * Task transformation utilities
 */

import type { Task, Participant } from '../../types/schedule';
import type { Factory } from '../../types/factory';
import { FactoryType } from '@/types/enums';

/**
 * Get factory color based on factory type
 */
export function getFactoryColor(factoryType?: string | FactoryType): string {
  switch (factoryType) {
    case 'MANUFACTURING':
    case FactoryType.MANUFACTURING:
      return 'blue';
    case 'CONTAINER':
    case FactoryType.CONTAINER:
      return 'red';
    case 'PACKAGING':
    case FactoryType.PACKAGING:
      return 'yellow';
    default:
      return 'gray';
  }
}

/**
 * Transform database task to API task format
 */
export function transformDatabaseTask(
  task: any,
  factory?: Factory,
  projectId?: string
): Task {
  const factoryColor = factory ? getFactoryColor(factory.type) : 'gray';
  
  return {
    id: task.id,
    projectId: projectId || task.projectId,
    scheduleId: task.scheduleId,
    title: task.title || task.name,
    name: task.name || task.title,
    type: task.type,
    status: task.status,
    priority: task.priority || 'medium',
    startDate: task.startDate,
    endDate: task.endDate,
    progress: task.progress || 0,
    factory: factory?.name || task.factory || 'Unknown Factory',
    factoryId: task.factoryId,
    participants: task.participants || [],
    dependsOn: task.dependsOn || [],
    blockedBy: task.blockedBy || [],
    tags: task.tags || [],
    color: factoryColor,
    createdAt: task.createdAt,
    updatedAt: task.updatedAt,
  };
}

/**
 * Calculate task duration in days
 */
export function calculateTaskDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Calculate task progress based on dates
 */
export function calculateTaskProgressByDate(
  startDate: string, 
  endDate: string, 
  currentDate: Date = new Date()
): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (currentDate >= end) {
    return 100;
  }
  
  if (currentDate <= start) {
    return 0;
  }
  
  const totalDuration = end.getTime() - start.getTime();
  const elapsed = currentDate.getTime() - start.getTime();
  const progress = Math.round((elapsed / totalDuration) * 100);
  
  return Math.max(0, Math.min(100, progress));
}

/**
 * Sort tasks by start date
 */
export function sortTasksByStartDate(tasks: Task[]): Task[] {
  return [...tasks].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
}

/**
 * Group tasks by factory
 */
export function groupTasksByFactory(tasks: Task[]): Map<string, Task[]> {
  const grouped = new Map<string, Task[]>();
  
  for (const task of tasks) {
    const factoryId = task.factoryId || 'unknown';
    if (!grouped.has(factoryId)) {
      grouped.set(factoryId, []);
    }
    grouped.get(factoryId)!.push(task);
  }
  
  return grouped;
}

/**
 * Filter tasks by date range
 */
export function filterTasksByDateRange(
  tasks: Task[], 
  startDate?: Date, 
  endDate?: Date
): Task[] {
  return tasks.filter(task => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    if (startDate && taskEnd < startDate) {
      return false;
    }
    
    if (endDate && taskStart > endDate) {
      return false;
    }
    
    return true;
  });
}

/**
 * Get task completion statistics
 */
export function getTaskStatistics(tasks: Task[]): {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  cancelled: number;
  completionRate: number;
} {
  const stats = {
    total: tasks.length,
    completed: 0,
    inProgress: 0,
    todo: 0,
    cancelled: 0,
    completionRate: 0,
  };
  
  for (const task of tasks) {
    switch (task.status) {
      case 'completed':
        stats.completed++;
        break;
      case 'in-progress':
        stats.inProgress++;
        break;
      case 'todo':
      case 'pending':
        stats.todo++;
        break;
      case 'cancelled':
        stats.cancelled++;
        break;
    }
  }
  
  if (stats.total > 0) {
    stats.completionRate = Math.round((stats.completed / stats.total) * 100);
  }
  
  return stats;
}