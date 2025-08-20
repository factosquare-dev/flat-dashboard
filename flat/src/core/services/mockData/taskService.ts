/**
 * Task-related mock data service methods - Task-Centric Architecture
 */

import { MockDatabaseImpl } from '@/core/database/MockDatabase';
import type { Task, FactoryAssignment } from '@/shared/types/schedule';
import type { TaskId, FactoryId } from '@/shared/types/branded';
import { TaskStatus, TaskType } from '@/shared/types/enums';

export class TaskDataService {
  private db: MockDatabaseImpl;

  constructor(db: MockDatabaseImpl) {
    this.db = db;
  }

  // 모든 태스크 가져오기
  getAllTasks(): Task[] {
    const database = this.db.getDatabase();
    return Array.from(database.tasks.values()).map(task => {
      // Ensure factoryAssignments is always an array
      if (!task.factoryAssignments) {
        task.factoryAssignments = [];
      }
      return task;
    });
  }

  // 스케줄별 태스크 가져오기
  getTasksBySchedule(scheduleId: string): Task[] {
    const tasks = this.getAllTasks();
    return tasks.filter(t => t.scheduleId === scheduleId);
  }

  // 프로젝트별 태스크 가져오기
  getTasksByProject(projectId: string): Task[] {
    const database = this.db.getDatabase();
    
    // Check if this is a MASTER project
    const project = database.projects.get(projectId);
    if (project && project.type === 'MASTER') {
      // For MASTER projects, get tasks from all SUB projects
      const subProjects = Array.from(database.projects.values())
        .filter(p => p.parentId === projectId && p.type === 'SUB');
      
      const allTasks: Task[] = [];
      subProjects.forEach(subProject => {
        const schedule = Array.from(database.schedules.values())
          .find(s => s.projectId === subProject.id);
        if (schedule) {
          const tasks = this.getTasksBySchedule(schedule.id);
          // Auto-assign factories from SUB project to tasks
          const enhancedTasks = this.autoAssignFactoriesToTasks(tasks, subProject);
          allTasks.push(...enhancedTasks);
        }
      });
      
      return allTasks;
    }
    
    // For SUB projects or regular projects
    const schedule = Array.from(database.schedules.values())
      .find(s => s.projectId === projectId);
    
    if (!schedule) return [];
    
    const tasks = this.getTasksBySchedule(schedule.id);
    
    // Auto-assign factories from project to tasks
    if (project) {
      return this.autoAssignFactoriesToTasks(tasks, project);
    }
    
    return tasks;
  }
  
  // Helper method to auto-assign factories based on project's factory IDs
  private autoAssignFactoriesToTasks(tasks: Task[], project: any): Task[] {
    const database = this.db.getDatabase();
    
    return tasks.map(task => {
      // If task already has factory assignments, keep them
      if (task.factoryAssignments && task.factoryAssignments.length > 0) {
        return task;
      }
      
      // Otherwise, auto-assign based on task type and project's factory IDs
      const assignments: FactoryAssignment[] = [];
      
      // Manufacturing tasks
      if (task.type === TaskType.MANUFACTURING || task.type === TaskType.PROTOTYPING || 
          task.title?.includes('제품') || task.title?.includes('생산') || task.title?.includes('시제품')) {
        if (project.manufacturerId) {
          const factoryIds = Array.isArray(project.manufacturerId) ? project.manufacturerId : [project.manufacturerId];
          factoryIds.forEach(factoryId => {
            const factory = database.factories.get(factoryId);
            if (factory) {
              assignments.push({
                factoryId: factory.id,
                factoryName: factory.name,
                factoryType: factory.type,
                role: task.type === TaskType.PROTOTYPING ? 'sample' : 'primary',
                status: task.status,
                progress: task.progress,
                startDate: task.startDate,
                endDate: task.endDate
              });
            }
          });
        }
      }
      
      // Container tasks - includes mold making and injection tasks
      if (task.title?.includes('용기') || task.title?.includes('금형') || task.title?.includes('사출')) {
        if (project.containerId) {
          const factoryIds = Array.isArray(project.containerId) ? project.containerId : [project.containerId];
          factoryIds.forEach(factoryId => {
            const factory = database.factories.get(factoryId);
            if (factory) {
              assignments.push({
                factoryId: factory.id,
                factoryName: factory.name,
                factoryType: factory.type,
                status: task.status,
                progress: task.progress,
                startDate: task.startDate,
                endDate: task.endDate
              });
            }
          });
        }
      }
      
      // Packaging tasks - includes printing and post-processing tasks
      if (task.title?.includes('포장') || task.title?.includes('인쇄') || task.title?.includes('색상') || task.title?.includes('후가공')) {
        if (project.packagingId) {
          const factoryIds = Array.isArray(project.packagingId) ? project.packagingId : [project.packagingId];
          factoryIds.forEach(factoryId => {
            const factory = database.factories.get(factoryId);
            if (factory) {
              assignments.push({
                factoryId: factory.id,
                factoryName: factory.name,
                factoryType: factory.type,
                status: task.status,
                progress: task.progress,
                startDate: task.startDate,
                endDate: task.endDate
              });
            }
          });
        }
      }
      
      return {
        ...task,
        factoryAssignments: assignments
      };
    });
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
    try {
      // MockDatabase update is async, but we need sync for compatibility
      const database = this.db.getDatabase();
      const task = database.tasks.get(id);
      if (!task) return false;
      
      // Update the task
      const updatedTask = { ...task, ...updates, updatedAt: new Date() };
      database.tasks.set(id, updatedTask);
      
      // Save to storage
      this.db.save();
      
      return true;
    } catch (error) {
      console.error('[TaskDataService] Error updating task:', error);
      return false;
    }
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

  // ========== TASK-CENTRIC METHODS ==========
  
  // Task에 Factory 할당
  assignFactoryToTask(taskId: string | TaskId, factory: FactoryAssignment): boolean {
    const task = this.getTaskById(taskId);
    if (!task) return false;
    
    // Initialize if not exists
    if (!task.factoryAssignments) {
      task.factoryAssignments = [];
    }
    
    // Check if factory already assigned
    const existingIndex = task.factoryAssignments.findIndex(
      fa => fa.factoryId === factory.factoryId
    );
    
    if (existingIndex >= 0) {
      // Update existing assignment
      task.factoryAssignments[existingIndex] = factory;
    } else {
      // Add new assignment
      task.factoryAssignments.push(factory);
    }
    
    return this.updateTask(taskId, { factoryAssignments: task.factoryAssignments });
  }
  
  // Task에서 Factory 제거
  removeFactoryFromTask(taskId: string | TaskId, factoryId: string | FactoryId): boolean {
    const task = this.getTaskById(taskId);
    if (!task || !task.factoryAssignments) return false;
    
    task.factoryAssignments = task.factoryAssignments.filter(
      fa => fa.factoryId !== factoryId
    );
    
    return this.updateTask(taskId, { factoryAssignments: task.factoryAssignments });
  }
  
  // Factory Assignment 업데이트
  updateFactoryAssignment(
    taskId: string | TaskId, 
    factoryId: string | FactoryId,
    updates: Partial<FactoryAssignment>
  ): boolean {
    const task = this.getTaskById(taskId);
    if (!task || !task.factoryAssignments) return false;
    
    const assignmentIndex = task.factoryAssignments.findIndex(
      fa => fa.factoryId === factoryId
    );
    
    if (assignmentIndex < 0) return false;
    
    task.factoryAssignments[assignmentIndex] = {
      ...task.factoryAssignments[assignmentIndex],
      ...updates
    };
    
    return this.updateTask(taskId, { factoryAssignments: task.factoryAssignments });
  }
  
  // 특정 Factory의 모든 Task 가져오기
  getTasksByFactory(factoryId: string | FactoryId): Task[] {
    const allTasks = this.getAllTasks();
    return allTasks.filter(task => 
      task.factoryAssignments?.some(fa => fa.factoryId === factoryId)
    );
  }
  
  // Task의 Factory 수 가져오기
  getFactoryCount(taskId: string | TaskId): number {
    const task = this.getTaskById(taskId);
    return task?.factoryAssignments?.length || 0;
  }
}