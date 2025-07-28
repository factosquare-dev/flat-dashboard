/**
 * Schedule API - 리팩토링된 버전
 * 기능별로 모듈화하여 관리
 */

import type { Schedule, Task, Participant } from '../../types/schedule';
import type { Project } from '../../types/project';
import { USE_MOCK_DATA } from '../../config/mock';
import { apiClient } from '../client/interceptors';
import {
  getOrCreateScheduleForProject,
  addTaskToSchedule,
  updateTaskInSchedule,
  deleteTaskFromSchedule
} from './operations';
import { mockSchedules } from './mockStore';
import { mockDataService } from '../../services/mockDataService';

/**
 * Task 날짜 겹침 검증 - 같은 공장 내에서 겹치는 Task가 있으면 에러 발생
 */
function validateTaskDateOverlaps(tasks: Task[]): void {
  if (tasks.length < 2) return;
  
  // 공장별로 그룹화
  const tasksByFactory = new Map<string, Task[]>();
  tasks.forEach(task => {
    const factoryId = task.factoryId || 'unknown';
    if (!tasksByFactory.has(factoryId)) {
      tasksByFactory.set(factoryId, []);
    }
    tasksByFactory.get(factoryId)!.push(task);
  });
  
  // 각 공장별로 날짜 겹침 검사
  tasksByFactory.forEach((factoryTasks, factoryId) => {
    if (factoryTasks.length < 2) return;
    
    // 날짜순 정렬
    const sortedTasks = [...factoryTasks].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    for (let i = 0; i < sortedTasks.length - 1; i++) {
      const currentTask = sortedTasks[i];
      const nextTask = sortedTasks[i + 1];
      
      const currentEnd = new Date(currentTask.endDate);
      const nextStart = new Date(nextTask.startDate);
      
      if (currentEnd >= nextStart) {
        throw new Error(
          `Task 날짜 겹침 오류 (공장: ${factoryId}): "${currentTask.title || currentTask.name}" (${currentTask.startDate} ~ ${currentTask.endDate})와 ` +
          `"${nextTask.title || nextTask.name}" (${nextTask.startDate} ~ ${nextTask.endDate})가 겹칩니다.`
        );
      }
    }
  });
}

export const scheduleApi = {
  // 스케줄 생성
  createSchedule: async (projectId: string, data: {
    participants: Participant[];
    tasks: Task[];
  }): Promise<Schedule> => {
    const response = await apiClient.post<Schedule>('/schedules', {
      projectId,
      ...data
    });
    
    return response.data;
  },

  // 스케줄 조회
  getSchedule: async (scheduleId: string): Promise<Schedule> => {
    if (USE_MOCK_DATA) {
      const schedule = mockSchedules.get(scheduleId);
      if (schedule) return schedule;
      throw new Error('Schedule not found');
    }

    const response = await apiClient.get<Schedule>(`/schedules/${scheduleId}`);
    return response.data;
  },

  // 프로젝트 ID로 스케줄 조회
  getScheduleByProjectId: async (projectId: string): Promise<Schedule | null> => {
    if (USE_MOCK_DATA) {
      const schedule = Array.from(mockSchedules.values())
        .find(s => s.projectId === projectId);
      return schedule || null;
    }

    try {
      const response = await apiClient.get<Schedule>(`/schedules/project/${projectId}`);
      return response.data;
    } catch (error) {
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status: number } };
        if (axiosError.response?.status === 404) return null;
      }
      throw error;
    }
  },
  
  // 프로젝트로부터 스케줄 생성 또는 조회 - MockDB 직접 사용
  getOrCreateScheduleForProject: async (project: Project): Promise<Schedule> => {
    if (USE_MOCK_DATA) {
      const projectTasks = mockDataService.getTasksByProjectId(project.id);
      const projectFactories = mockDataService.getFactoriesForProject(project.id);
      
      // Task 날짜 겹침 검증
      validateTaskDateOverlaps(projectTasks);
      
      const schedule: Schedule = {
        id: `schedule-${project.id}`,
        projectId: project.id,
        startDate: project.startDate,
        endDate: project.endDate,
        status: 'active',
        createdAt: project.createdAt,
        updatedAt: new Date(),
        tasks: projectTasks,
        factories: projectFactories
      };
      
      return schedule;
    }
    
    // Fallback to operations
    return getOrCreateScheduleForProject(project, mockSchedules);
  },
  
  // 모든 스케줄 조회
  getAllSchedules: async (): Promise<Schedule[]> => {
    if (USE_MOCK_DATA) {
      return Array.from(mockSchedules.values());
    }

    const response = await apiClient.get<Schedule[]>('/schedules');
    return response.data;
  },

  // 태스크 추가
  addTask: async (scheduleId: string, task: Omit<Task, 'id'>): Promise<Task> => {
    if (USE_MOCK_DATA) {
      const schedule = mockSchedules.get(scheduleId);
      if (!schedule) throw new Error('Schedule not found');
      
      const updatedSchedule = addTaskToSchedule(schedule, task);
      mockSchedules.set(scheduleId, updatedSchedule);
      
      return updatedSchedule.tasks[updatedSchedule.tasks.length - 1];
    }

    const response = await apiClient.post<Task>(`/schedules/${scheduleId}/tasks`, task);
    return response.data;
  },

  // 태스크 수정
  updateTask: async (scheduleId: string, taskId: number | string, updates: Partial<Task>): Promise<Task> => {
    if (USE_MOCK_DATA) {
      const schedule = mockSchedules.get(scheduleId);
      if (!schedule) throw new Error('Schedule not found');
      
      const updatedSchedule = updateTaskInSchedule(schedule, taskId, updates);
      if (!updatedSchedule) throw new Error('Task not found');
      
      mockSchedules.set(scheduleId, updatedSchedule);
      
      const updatedTask = updatedSchedule.tasks.find(t => t.id === taskId);
      if (!updatedTask) throw new Error('Task not found');
      
      return updatedTask;
    }

    const response = await apiClient.put<Task>(`/schedules/${scheduleId}/tasks/${taskId}`, updates);
    return response.data;
  },

  // 태스크 삭제
  deleteTask: async (scheduleId: string, taskId: number | string): Promise<void> => {
    if (USE_MOCK_DATA) {
      const schedule = mockSchedules.get(scheduleId);
      if (!schedule) throw new Error('Schedule not found');
      
      const updatedSchedule = deleteTaskFromSchedule(schedule, taskId);
      mockSchedules.set(scheduleId, updatedSchedule);
      
      return;
    }

    await apiClient.delete(`/schedules/${scheduleId}/tasks/${taskId}`);
  }
};