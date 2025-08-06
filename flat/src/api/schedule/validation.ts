/**
 * Schedule and Task validation utilities
 */

import type { Task } from '../../types/schedule';
import { TaskStatus } from '../../types/enums';

/**
 * Validate task dates - throw error if tasks overlap
 */
export function validateTaskDates(tasks: Task[], projectStartDate?: string, projectEndDate?: string): void {
  if (tasks.length === 0) return;
  
  const projectStart = projectStartDate ? new Date(projectStartDate) : null;
  const projectEnd = projectEndDate ? new Date(projectEndDate) : null;
  
  // Sort tasks by start date
  const sortedTasks = [...tasks].sort((a, b) => 
    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  );
  
  // Check for overlaps and project bounds violations
  for (let i = 0; i < sortedTasks.length; i++) {
    const currentTask = sortedTasks[i];
    const taskStart = new Date(currentTask.startDate);
    const taskEnd = new Date(currentTask.endDate);
    
    // Check project bounds
    if (projectStart && taskStart < projectStart) {
      throw new Error(`Task "${currentTask.title}" 시작일이 프로젝트 시작일보다 이릅니다.`);
    }
    
    if (projectEnd && taskEnd > projectEnd) {
      throw new Error(`Task "${currentTask.title}" 종료일이 프로젝트 종료일보다 늦습니다.`);
    }
    
    // Check for overlap with previous task
    if (i > 0) {
      const prevTask = sortedTasks[i - 1];
      const prevEnd = new Date(prevTask.endDate);
      
      if (taskStart <= prevEnd) {
        throw new Error(
          `Task 날짜 겹침: "${prevTask.title}" (${prevTask.startDate} ~ ${prevTask.endDate})와 ` +
          `"${currentTask.title}" (${currentTask.startDate} ~ ${currentTask.endDate})가 겹칩니다.`
        );
      }
    }
  }
}

/**
 * Validate task dependencies
 */
export function validateTaskDependencies(tasks: Task[]): void {
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  
  for (const task of tasks) {
    if (task.dependsOn && task.dependsOn.length > 0) {
      for (const dependencyId of task.dependsOn) {
        const dependencyTask = taskMap.get(dependencyId);
        
        if (!dependencyTask) {
          throw new Error(`Task "${task.title}" depends on non-existent task with ID: ${dependencyId}`);
        }
        
        // Check for circular dependencies
        if (hasCircularDependency(task, taskMap, new Set())) {
          throw new Error(`Circular dependency detected for task "${task.title}"`);
        }
        
        // Check if dependency end date is before task start date
        const depEnd = new Date(dependencyTask.endDate);
        const taskStart = new Date(task.startDate);
        
        if (depEnd > taskStart) {
          throw new Error(
            `Task "${task.title}" starts before its dependency "${dependencyTask.title}" ends`
          );
        }
      }
    }
  }
}

/**
 * Check for circular dependencies in tasks
 */
function hasCircularDependency(
  task: Task, 
  taskMap: Map<string, Task>, 
  visited: Set<string>
): boolean {
  if (visited.has(task.id)) {
    return true;
  }
  
  visited.add(task.id);
  
  if (task.dependsOn && task.dependsOn.length > 0) {
    for (const depId of task.dependsOn) {
      const depTask = taskMap.get(depId);
      if (depTask && hasCircularDependency(depTask, taskMap, new Set(visited))) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Validate task participants
 */
export function validateTaskParticipants(tasks: Task[], availableUserIds: string[]): void {
  const userIdSet = new Set(availableUserIds);
  
  for (const task of tasks) {
    if (task.participants && task.participants.length > 0) {
      for (const participant of task.participants) {
        if (!userIdSet.has(participant.userId)) {
          throw new Error(
            `Task "${task.title}" has invalid participant with user ID: ${participant.userId}`
          );
        }
      }
    }
  }
}

/**
 * Validate task progress
 */
export function validateTaskProgress(task: Task): void {
  if (task.progress < 0 || task.progress > 100) {
    throw new Error(`Task "${task.title}" has invalid progress: ${task.progress}%`);
  }
  
  // Completed tasks should have 100% progress
  if (task.status === TaskStatus.COMPLETED && task.progress !== 100) {
    throw new Error(`Completed task "${task.title}" should have 100% progress`);
  }
  
  // TODO or cancelled tasks should have 0% progress
  if ((task.status === TaskStatus.TODO || task.status === TaskStatus.CANCELLED) && task.progress !== 0) {
    throw new Error(`${task.status} task "${task.title}" should have 0% progress`);
  }
}