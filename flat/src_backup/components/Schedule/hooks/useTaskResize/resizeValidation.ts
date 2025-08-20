import type { Task } from '@/types/schedule';
import { formatDateISO } from '@/utils/coreUtils';

export interface ResizeValidationResult {
  validStartDate: string;
  validEndDate: string;
  hasOverlap: boolean;
}

export const validateResizeStartDate = (
  newDate: Date,
  task: Task,
  projectTasks: Task[]
): ResizeValidationResult => {
  const endDate = new Date(task.endDate);
  let validStartDate = formatDateISO(newDate);
  let hasOverlap = false;
  
  // Can't move start date past end date (but can be same date for 1-day task)
  if (newDate > endDate) {
    return {
      validStartDate: formatDateISO(endDate),
      validEndDate: task.endDate,
      hasOverlap: false
    };
  }
  
  // Check for overlap with other tasks
  for (const otherTask of projectTasks) {
    const otherStart = new Date(otherTask.startDate);
    const otherEnd = new Date(otherTask.endDate);
    
    // Check if new date range would overlap
    if (newDate <= otherEnd && endDate >= otherStart) {
      hasOverlap = true;
      // If overlapping, set to day after other task ends
      validStartDate = formatDateISO(new Date(otherEnd.getTime() + 24 * 60 * 60 * 1000));
      break;
    }
  }
  
  return {
    validStartDate: hasOverlap ? validStartDate : formatDateISO(newDate),
    validEndDate: task.endDate,
    hasOverlap
  };
};

export const validateResizeEndDate = (
  newDate: Date,
  task: Task,
  projectTasks: Task[]
): ResizeValidationResult => {
  const startDate = new Date(task.startDate);
  let validEndDate = formatDateISO(newDate);
  let hasOverlap = false;
  
  // Can't move end date before start date (but can be same date for 1-day task)
  if (newDate < startDate) {
    return {
      validStartDate: task.startDate,
      validEndDate: formatDateISO(startDate),
      hasOverlap: false
    };
  }
  
  // Check for overlap with other tasks
  for (const otherTask of projectTasks) {
    const otherStart = new Date(otherTask.startDate);
    const otherEnd = new Date(otherTask.endDate);
    
    // Check if new date range would overlap
    if (startDate <= otherEnd && newDate >= otherStart) {
      hasOverlap = true;
      // If overlapping, set to day before other task starts
      validEndDate = formatDateISO(new Date(otherStart.getTime() - 24 * 60 * 60 * 1000));
      break;
    }
  }
  
  return {
    validStartDate: task.startDate,
    validEndDate: hasOverlap ? validEndDate : formatDateISO(newDate),
    hasOverlap
  };
};

export const getProjectTasks = (tasks: Task[], projectId: string, excludeTaskId: string): Task[] => {
  return tasks.filter((t: Task) => 
    t.projectId === projectId && t.id !== excludeTaskId
  );
};