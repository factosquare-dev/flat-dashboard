/**
 * Task-related mock data service methods
 */

import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';
import type { Task } from '@/types/schedule';
import type { TaskId } from '@/types/branded';

export class TaskDataService {
  private db: MockDatabaseImpl;

  constructor(db: MockDatabaseImpl) {
    this.db = db;
  }

  // 모든 태스크 가져오기
  getAllTasks(): Task[] {
    const database = this.db.getDatabase();
    return Array.from(database.tasks.values());
  }

  // 스케줄별 태스크 가져오기
  getTasksBySchedule(scheduleId: string): Task[] {
    const tasks = this.getAllTasks();
    return tasks.filter(t => t.scheduleId === scheduleId);
  }

  // 프로젝트별 태스크 가져오기
  getTasksByProject(projectId: string): Task[] {
    const database = this.db.getDatabase();
    const schedule = Array.from(database.schedules.values())
      .find(s => s.projectId === projectId);
    
    if (!schedule) return [];
    
    return this.getTasksBySchedule(schedule.id);
  }

  // ID로 태스크 가져오기
  getTaskById(id: string | TaskId): Task | undefined {
    const database = this.db.getDatabase();
    return database.tasks.get(id);
  }

  // 태스크 생성
  createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    return this.db.create('tasks', task) as Task;
  }

  // 태스크 업데이트
  updateTask(id: string | TaskId, updates: Partial<Task>): boolean {
    return this.db.update('tasks', id, updates);
  }

  // 태스크 삭제
  deleteTask(id: string | TaskId): boolean {
    return this.db.delete('tasks', id);
  }

  // 태스크 순서 변경
  reorderTasks(scheduleId: string, taskIds: string[]): boolean {
    const tasks = this.getTasksBySchedule(scheduleId);
    
    // 순서 업데이트
    taskIds.forEach((taskId, index) => {
      const task = tasks.find(t => t.id === taskId);
      if (task) {
        this.updateTask(taskId, { order: index });
      }
    });

    return true;
  }
}