import type { Schedule, Task, Participant } from '../types/schedule';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const scheduleApi = {
  // 스케줄 생성
  createSchedule: async (projectId: string, data: {
    participants: Participant[];
    tasks: Task[];
  }): Promise<Schedule> => {
    const response = await fetch(`${API_BASE_URL}/schedules`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        projectId,
        ...data
      }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create schedule');
    }
    
    return response.json();
  },

  // 스케줄 조회
  getSchedule: async (scheduleId: string): Promise<Schedule> => {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch schedule');
    }
    
    return response.json();
  },

  // 프로젝트별 스케줄 조회
  getScheduleByProjectId: async (projectId: string): Promise<Schedule | null> => {
    const response = await fetch(`${API_BASE_URL}/schedules/project/${projectId}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch schedule');
    }
    
    return response.json();
  },

  // 스케줄 업데이트
  updateSchedule: async (scheduleId: string, data: {
    participants?: Participant[];
    tasks?: Task[];
  }): Promise<Schedule> => {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update schedule');
    }
    
    return response.json();
  },

  // 스케줄 삭제
  deleteSchedule: async (scheduleId: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete schedule');
    }
  },

  // 태스크 추가
  addTask: async (scheduleId: string, task: Omit<Task, 'id'>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    });
    
    if (!response.ok) {
      throw new Error('Failed to add task');
    }
    
    return response.json();
  },

  // 태스크 업데이트
  updateTask: async (scheduleId: string, taskId: number, updates: Partial<Task>): Promise<Task> => {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update task');
    }
    
    return response.json();
  },

  // 태스크 삭제
  deleteTask: async (scheduleId: string, taskId: number): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/schedules/${scheduleId}/tasks/${taskId}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete task');
    }
  },
};