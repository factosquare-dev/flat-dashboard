import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { createSelector } from 'reselect';
import type { Task, Schedule } from '@/types/schedule';
import type { Project } from '@/types/project';
import { scheduleApi } from '@/api/schedule';
import { TaskStatus } from '@/types/enums';
import { ProjectNotFoundError, assertDefined } from '@/errors';

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

// Selectors
const selectSchedules = (state: TaskStore) => state.schedules;
const selectSelectedProjectId = (state: TaskStore) => state.selectedProjectId;

// Memoized selector for getting tasks by project
export const selectTasksForProject = createSelector(
  [selectSchedules, (_: TaskStore, projectId: string) => projectId],
  (schedules, projectId) => {
    const schedule = Array.from(schedules.values()).find(s => s.projectId === projectId);
    return schedule?.tasks ?? []; // Use nullish coalescing instead of ||  
  }
);

// Memoized selector for getting schedule by project
export const selectScheduleForProject = createSelector(
  [selectSchedules, (_: TaskStore, projectId: string) => projectId],
  (schedules, projectId) => {
    return Array.from(schedules.values()).find(s => s.projectId === projectId) ?? null;
  }
);

// Version that throws if not found
export const selectScheduleForProjectOrThrow = createSelector(
  [selectSchedules, (_: TaskStore, projectId: string) => projectId],
  (schedules, projectId) => {
    const schedule = Array.from(schedules.values()).find(s => s.projectId === projectId);
    if (!schedule) {
      throw new ProjectNotFoundError(projectId);
    }
    return schedule;
  }
);

// Memoized selector for getting current project's tasks
export const selectCurrentProjectTasks = createSelector(
  [selectSchedules, selectSelectedProjectId],
  (schedules, selectedProjectId) => {
    if (!selectedProjectId) return [];
    const schedule = Array.from(schedules.values()).find(s => s.projectId === selectedProjectId);
    return schedule?.tasks ?? [];
  }
);

// Memoized selector for completed tasks count
export const selectCompletedTasksCount = createSelector(
  [selectTasksForProject],
  (tasks) => tasks.filter(task => task.status === TaskStatus.COMPLETED).length
);

// Memoized selector for tasks by status
export const selectTasksByStatus = createSelector(
  [selectTasksForProject, (_: TaskStore, __: string, status: string) => status],
  (tasks, status) => tasks.filter(task => task.status === status)
);

// Memoized selector for task statistics
export const selectTaskStats = createSelector(
  [selectTasksForProject],
  (tasks) => {
    const total = tasks.length;
    const completed = tasks.filter(task => task.status === TaskStatus.COMPLETED).length;
    const inProgress = tasks.filter(task => task.status === TaskStatus.IN_PROGRESS).length;
    const pending = tasks.filter(task => task.status === TaskStatus.PENDING).length;
    const overdue = tasks.filter(task => {
      if (task.status === TaskStatus.COMPLETED) return false;
      return task.dueDate && new Date(task.dueDate) < new Date();
    }).length;
    
    return {
      total,
      completed,
      inProgress,
      pending,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }
);

// Memoized selector for tasks grouped by assignee
export const selectTasksByAssignee = createSelector(
  [selectTasksForProject],
  (tasks) => {
    return tasks.reduce((groups, task) => {
      const assignee = task.assigneeId || 'unassigned';
      if (!groups[assignee]) groups[assignee] = [];
      groups[assignee].push(task);
      return groups;
    }, {} as Record<string, Task[]>);
  }
);

// Memoized selector for tasks sorted by priority and due date
export const selectPrioritizedTasks = createSelector(
  [selectTasksForProject],
  (tasks) => {
    const priorityOrder = { high: 3, medium: 2, low: 1, none: 0 };
    
    return [...tasks].sort((a, b) => {
      // First sort by priority
      const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
      const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
      
      if (aPriority !== bPriority) {
        return bPriority - aPriority; // Higher priority first
      }
      
      // Then sort by due date
      if (a.dueDate && b.dueDate) {
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      }
      
      if (a.dueDate) return -1; // Tasks with due dates come first
      if (b.dueDate) return 1;
      
      return 0;
    });
  }
);

// Memoized selector for upcoming tasks (due within 7 days)
export const selectUpcomingTasks = createSelector(
  [selectTasksForProject],
  (tasks) => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return tasks.filter(task => {
      // Use enum for type safety
      if (task.status === TaskStatus.COMPLETED || !task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate >= now && dueDate <= sevenDaysFromNow;
    });
  }
);

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

      // 프로젝트의 태스크 가져오기 (selector 사용)
      getTasksForProject: (projectId: string) => {
        return selectTasksForProject(get(), projectId);
      },

      // 프로젝트의 스케줄 가져오기 (selector 사용)
      getScheduleForProject: (projectId: string) => {
        return selectScheduleForProject(get(), projectId);
      },

      // 태스크 추가
      addTask: async (projectId: string, taskData: Omit<Task, 'id'>) => {
        const schedule = get().getScheduleForProject(projectId);
        
        if (!schedule) {
          throw new ProjectNotFoundError(projectId);
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
        set({ isLoading: true, error: null });
        
        try {
          // projectId를 scheduleId로 사용
          const updatedTask = await scheduleApi.updateTask(projectId, taskId, updates);
          
          // MockDatabase에도 업데이트
          const { MockDatabaseImpl } = await import('../mocks/database/MockDatabase');
          const mockDb = MockDatabaseImpl.getInstance();
          await mockDb.update('tasks', String(taskId), updates);
          
          // 로컬 상태 업데이트
          set((state) => {
            const updatedSchedules = new Map(state.schedules);
            const schedule = Array.from(updatedSchedules.values()).find(s => s.projectId === projectId);
            
            if (schedule) {
              const updatedSchedule = { ...schedule };
              updatedSchedule.tasks = updatedSchedule.tasks.map(task => 
                task.id === taskId ? updatedTask : task
              );
              updatedSchedules.set(schedule.id, updatedSchedule);
            }
            
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