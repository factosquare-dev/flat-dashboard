/**
 * Gantt chart specific operations
 */

import type { Task } from '@/types/schedule';

export interface GanttTask {
  id: string;
  text: string;
  start_date: string;
  duration: number;
  progress: number;
  parent?: string;
  type?: string;
  color?: string;
}

/**
 * Transform tasks to Gantt chart format
 */
export function transformToGanttTasks(tasks: Task[]): GanttTask[] {
  return tasks.map(task => ({
    id: task.id,
    text: task.title || task.name,
    start_date: task.startDate,
    duration: calculateDuration(task.startDate, task.endDate),
    progress: task.progress / 100,
    type: task.type,
    color: task.color,
  }));
}

/**
 * Calculate duration in days
 */
function calculateDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

/**
 * Create Gantt task
 */
export function createGanttTask(task: Partial<GanttTask>): GanttTask {
  return {
    id: task.id || `task-${Date.now()}`,
    text: task.text || 'New Task',
    start_date: task.start_date || new Date().toISOString().split('T')[0],
    duration: task.duration || 1,
    progress: task.progress || 0,
    parent: task.parent,
    type: task.type,
    color: task.color,
  };
}

/**
 * Update Gantt task
 */
export function updateGanttTask(
  existingTask: GanttTask,
  updates: Partial<GanttTask>
): GanttTask {
  return {
    ...existingTask,
    ...updates,
  };
}

/**
 * Delete Gantt task
 */
export function deleteGanttTask(taskId: string, tasks: GanttTask[]): GanttTask[] {
  return tasks.filter(task => task.id !== taskId);
}

/**
 * Calculate Gantt dependencies
 */
export function calculateGanttDependencies(tasks: Task[]): Array<{
  id: string;
  source: string;
  target: string;
  type: string;
}> {
  const dependencies: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
  }> = [];
  
  tasks.forEach(task => {
    if (task.dependsOn && task.dependsOn.length > 0) {
      task.dependsOn.forEach((depId, index) => {
        dependencies.push({
          id: `${task.id}-dep-${index}`,
          source: depId,
          target: task.id,
          type: '0', // finish-to-start
        });
      });
    }
  });
  
  return dependencies;
}