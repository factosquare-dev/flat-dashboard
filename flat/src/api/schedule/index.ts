/**
 * Schedule API - 리팩토링된 버전
 * 기능별로 모듈화하여 관리
 */

import type { Schedule, Task, Participant } from '../../types/schedule';
import type { Project } from '../../types/project';
import { USE_MOCK_DATA } from '../../mocks/mockData';
import { getApiClient, API_BASE_URL } from './apiClient';
import {
  getOrCreateScheduleForProject,
  addTaskToSchedule,
  updateTaskInSchedule,
  deleteTaskFromSchedule
} from './operations';
import { mockSchedules } from './mockStore';

export const scheduleApi = {
  // 스케줄 생성
  createSchedule: async (projectId: string, data: {
    participants: Participant[];
    tasks: Task[];
  }): Promise<Schedule> => {
    try {
      const apiClient = await getApiClient();
      const response = await apiClient.post<Schedule>('/schedules', {
        projectId,
        ...data
      });
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  // 스케줄 조회
  getSchedule: async (scheduleId: string): Promise<Schedule> => {
    if (USE_MOCK_DATA) {
      const schedule = mockSchedules.get(scheduleId);
      if (schedule) return schedule;
      throw new Error('Schedule not found');
    }

    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch schedule');
    }
    
    return response.json();
  },

  // 프로젝트 ID로 스케줄 조회
  getScheduleByProjectId: async (projectId: string): Promise<Schedule | null> => {
    if (USE_MOCK_DATA) {
      const schedule = Array.from(mockSchedules.values())
        .find(s => s.projectId === projectId);
      return schedule || null;
    }

    const response = await fetch(`${API_BASE_URL}/schedules/project/${projectId}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch schedule');
    }
    
    return response.json();
  },
  
  // 프로젝트로부터 스케줄 생성 또는 조회
  getOrCreateScheduleForProject: async (project: Project): Promise<Schedule> => {
    return getOrCreateScheduleForProject(project, mockSchedules);
  },
  
  // 모든 스케줄 조회
  getAllSchedules: async (): Promise<Schedule[]> => {
    if (USE_MOCK_DATA) {
      return Array.from(mockSchedules.values());
    }

    const response = await fetch(`${API_BASE_URL}/schedules`);
    if (!response.ok) {
      throw new Error('Failed to fetch schedules');
    }
    
    return response.json();
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

    const apiClient = await getApiClient();
    return apiClient.post<Task>(`/schedules/${scheduleId}/tasks`, task);
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

    const apiClient = await getApiClient();
    return apiClient.put<Task>(`/schedules/${scheduleId}/tasks/${taskId}`, updates);
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

    const apiClient = await getApiClient();
    await apiClient.delete(`/schedules/${scheduleId}/tasks/${taskId}`);
  }
};