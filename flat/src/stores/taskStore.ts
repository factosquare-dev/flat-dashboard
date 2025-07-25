import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Task, Schedule } from '../types/schedule';
import type { Project } from '../types/project';
import { scheduleApi } from '../api/schedule';

interface TaskStore {
  // 상태
  schedules: Map<string, Schedule>; // scheduleId -> Schedule
  selectedScheduleId: string | null;
  selectedProjectId: string | null;
  isLoading: boolean;
  error: string | null;

  // 액션
  loadScheduleForProject: (project: Project) => Promise<Schedule>;
  getTasksForProject: (projectId: string) => Task[];
  getScheduleForProject: (projectId: string) => Schedule | null;
  addTask: (projectId: string, task: Omit<Task, 'id'>) => Promise<Task>;
  updateTask: (projectId: string, taskId: string | number, updates: Partial<Task>) => Promise<Task>;
  deleteTask: (projectId: string, taskId: string | number) => Promise<void>;
  setSelectedProject: (projectId: string | null) => void;
  clearError: () => void;
}

export const useTaskStore = create<TaskStore>()(
  devtools(
    (set, get) => ({
      // 초기 상태
      schedules: new Map(),
      selectedScheduleId: null,
      selectedProjectId: null,
      isLoading: false,
      error: null,

      // 프로젝트의 스케줄 로드
      loadScheduleForProject: async (project: Project) => {
        set({ isLoading: true, error: null });
        
        try {
          const schedule = await scheduleApi.getOrCreateScheduleForProject(project);
          
          set((state) => ({
            schedules: new Map(state.schedules).set(schedule.id, schedule),
            selectedScheduleId: schedule.id,
            selectedProjectId: project.id,
            isLoading: false
          }));
          
          return schedule;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load schedule',
            isLoading: false 
          });
          throw error;
        }
      },

      // 프로젝트의 태스크 가져오기
      getTasksForProject: (projectId: string) => {
        const { schedules } = get();
        
        // 프로젝트 ID로 스케줄 찾기
        const schedule = Array.from(schedules.values()).find(s => s.projectId === projectId);
        
        return schedule?.tasks || [];
      },

      // 프로젝트의 스케줄 가져오기
      getScheduleForProject: (projectId: string) => {
        const { schedules } = get();
        
        return Array.from(schedules.values()).find(s => s.projectId === projectId) || null;
      },

      // 태스크 추가
      addTask: async (projectId: string, taskData: Omit<Task, 'id'>) => {
        const schedule = get().getScheduleForProject(projectId);
        
        if (!schedule) {
          throw new Error('Schedule not found for project');
        }

        set({ isLoading: true, error: null });
        
        try {
          const newTask = await scheduleApi.addTask(schedule.id, taskData);
          
          // 로컬 상태 업데이트
          set((state) => {
            const updatedSchedules = new Map(state.schedules);
            const updatedSchedule = { ...schedule };
            updatedSchedule.tasks = [...updatedSchedule.tasks, newTask];
            updatedSchedules.set(schedule.id, updatedSchedule);
            
            return {
              schedules: updatedSchedules,
              isLoading: false
            };
          });
          
          return newTask;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to add task',
            isLoading: false 
          });
          throw error;
        }
      },

      // 태스크 수정
      updateTask: async (projectId: string, taskId: string | number, updates: Partial<Task>) => {
        const schedule = get().getScheduleForProject(projectId);
        
        if (!schedule) {
          throw new Error('Schedule not found for project');
        }

        set({ isLoading: true, error: null });
        
        try {
          const updatedTask = await scheduleApi.updateTask(schedule.id, taskId, updates);
          
          // 로컬 상태 업데이트
          set((state) => {
            const updatedSchedules = new Map(state.schedules);
            const updatedSchedule = { ...schedule };
            updatedSchedule.tasks = updatedSchedule.tasks.map(task => 
              task.id === taskId ? updatedTask : task
            );
            updatedSchedules.set(schedule.id, updatedSchedule);
            
            return {
              schedules: updatedSchedules,
              isLoading: false
            };
          });
          
          return updatedTask;
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update task',
            isLoading: false 
          });
          throw error;
        }
      },

      // 태스크 삭제
      deleteTask: async (projectId: string, taskId: string | number) => {
        const schedule = get().getScheduleForProject(projectId);
        
        if (!schedule) {
          throw new Error('Schedule not found for project');
        }

        set({ isLoading: true, error: null });
        
        try {
          await scheduleApi.deleteTask(schedule.id, taskId);
          
          // 로컬 상태 업데이트
          set((state) => {
            const updatedSchedules = new Map(state.schedules);
            const updatedSchedule = { ...schedule };
            updatedSchedule.tasks = updatedSchedule.tasks.filter(task => 
              task.id !== taskId
            );
            updatedSchedules.set(schedule.id, updatedSchedule);
            
            return {
              schedules: updatedSchedules,
              isLoading: false
            };
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to delete task',
            isLoading: false 
          });
          throw error;
        }
      },

      // 선택된 프로젝트 설정
      setSelectedProject: (projectId: string | null) => {
        set({ selectedProjectId: projectId });
      },

      // 에러 클리어
      clearError: () => {
        set({ error: null });
      }
    }),
    {
      name: 'task-store'
    }
  )
);