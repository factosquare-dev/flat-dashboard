/**
 * Task Service
 * Handles task CRUD operations using MockDatabase
 */

import { BaseService } from './BaseService';
import type { Task } from '@/shared/types/schedule';

export class TaskService extends BaseService<Task> {
  constructor() {
    super('tasks');
  }

  // Get tasks by schedule ID
  async getByScheduleId(scheduleId: string): Promise<Task[]> {
    const db = this.getDatabase();
    const tasks: Task[] = [];
    
    for (const [, task] of db.tasks) {
      if (task.scheduleId === scheduleId) {
        tasks.push(task);
      }
    }
    
    return tasks;
  }

  // Get tasks by project ID
  async getByProjectId(projectId: string): Promise<Task[]> {
    const db = this.getDatabase();
    const tasks: Task[] = [];
    
    for (const [, task] of db.tasks) {
      if (task.projectId === projectId) {
        tasks.push(task);
      }
    }
    
    return tasks;
  }
}