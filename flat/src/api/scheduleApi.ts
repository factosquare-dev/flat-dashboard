import type { Schedule, Task, Participant } from '../types/schedule';
import { createScheduleFromProject, createSampleInProgressTasks } from '../data/projectScheduleData';
import { createMockSchedules } from '../data/mockSchedules';
import type { Project } from '../types/project';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const USE_MOCK_DATA = true; // TODO: Set to false when backend is ready

// Mock 데이터 저장소
const mockSchedules = new Map<string, Schedule>();

// 초기 테스트 데이터 로드
const initializeMockSchedules = () => {
  const testSchedules = createMockSchedules();
  testSchedules.forEach(schedule => {
    mockSchedules.set(schedule.id, schedule);
  });
  console.log('테스트 스케줄 데이터 로드됨:', testSchedules.length, '개');
};

// 초기화
initializeMockSchedules();

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
    if (USE_MOCK_DATA) {
      // Mock 데이터 사용
      const existingSchedule = Array.from(mockSchedules.values()).find(s => s.projectId === projectId);
      if (existingSchedule) {
        return existingSchedule;
      }
      return null;
    }
    
    const response = await fetch(`${API_BASE_URL}/schedules/project/${projectId}`);
    
    if (response.status === 404) {
      return null;
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch schedule');
    }
    
    return response.json();
  },
  
  // 프로젝트에서 스케줄 생성 또는 가져오기 (Mock용)
  getOrCreateScheduleForProject: async (project: Project): Promise<Schedule> => {
    const existingSchedule = await scheduleApi.getScheduleByProjectId(project.id);
    if (existingSchedule) {
      return existingSchedule;
    }
    
    // 새 스케줄 생성
    const newSchedule = createScheduleFromProject(project);
    
    // 진행 중인 프로젝트인 경우 현재 진행중인 태스크가 있는지 확인
    if (project.status === '진행중') {
      const hasInProgressTask = newSchedule.tasks.some(t => t.status === 'in-progress');
      
      // 진행중인 태스크가 없으면 샘플 태스크 추가
      if (!hasInProgressTask) {
        const today = new Date();
        const formatDate = (date: Date) => date.toISOString().split('T')[0];
        
        // 각 공장별로 하나씩 진행중인 태스크 추가
        const inProgressTasks: Task[] = [];
        let taskId = Math.max(...newSchedule.tasks.map(t => t.id)) + 1;
        
        newSchedule.participants.forEach((participant, index) => {
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - 2); // 2일 전 시작
          const endDate = new Date();
          endDate.setDate(endDate.getDate() + 3); // 3일 후 종료
          
          inProgressTasks.push({
            id: taskId++,
            factory: participant.name,
            taskType: index === 0 ? '품질 검사' : index === 1 ? '사출 성형' : '포장 작업',
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            color: participant.color,
            status: 'in-progress',
            projectId: project.id
          });
        });
        
        console.log(`프로젝트 ${project.id}에 진행중 태스크 추가:`, inProgressTasks);
        newSchedule.tasks = [...newSchedule.tasks, ...inProgressTasks];
      }
    }
    
    if (USE_MOCK_DATA) {
      mockSchedules.set(newSchedule.id, newSchedule);
    }
    
    return newSchedule;
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