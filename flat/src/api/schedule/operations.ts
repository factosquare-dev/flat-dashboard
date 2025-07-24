import type { Schedule, Task, Participant } from '../../types/schedule';
import type { Project } from '../../types/project';
import { createScheduleFromProject, createSampleInProgressTasks } from '../../data/projectScheduleData';
import { formatDateISO } from '../../utils/dateUtils';
import { USE_MOCK_DATA } from '../../mocks/mockData';
import { getDatabaseWithRetry } from '../../mocks/database/utils';
import { scheduleAdapter } from '../../mocks/adapters/scheduleAdapter';

/**
 * 프로젝트로부터 스케줄 생성 또는 조회
 */
export const getOrCreateScheduleForProject = async (
  project: Project,
  existingSchedules: Map<string, Schedule>
): Promise<Schedule> => {
  // Use mock database if enabled
  if (USE_MOCK_DATA) {
    try {
      const database = await getDatabaseWithRetry();
      
      if (database && database.schedules) {
        const schedules = Array.from(database.schedules.values());
        const existingSchedule = schedules.find(s => s.projectId === project.id);
        
        if (existingSchedule) {
          // Convert to legacy format
          const legacyData = scheduleAdapter.convertToLegacyFormat(existingSchedule);
          return {
            id: existingSchedule.id,
            projectId: existingSchedule.projectId,
            participants: legacyData.participants,
            tasks: legacyData.tasks,
            startDate: legacyData.startDate,
            endDate: legacyData.endDate,
            createdAt: existingSchedule.createdAt.toISOString(),
            updatedAt: existingSchedule.updatedAt.toISOString()
          };
        }
      }
    } catch (error) {
      console.error('[Schedule Operations] Error accessing mock database:', error);
      // Fall through to old logic
    }
  }
  
  // Fallback: Create empty schedule with no tasks
  // Only use real Mock DB tasks, no hardcoded/sample tasks
  console.log('[Schedule Operations] 🚫 No existing schedule found, creating empty schedule for project:', project.id);
  
  const newSchedule: Schedule = {
    id: `schedule-${project.id}-${Date.now()}`,
    projectId: project.id,
    participants: [], // Will be populated by scheduleAdapter from project's factories
    tasks: [], // No hardcoded tasks - only real Mock DB tasks
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  console.log('[Schedule Operations] 🏭 Created empty schedule with no hardcoded tasks');
  
  if (USE_MOCK_DATA) {
    existingSchedules.set(newSchedule.id, newSchedule);
  }
  
  return newSchedule;
};

/**
 * 스케줄에 태스크 추가
 */
export const addTaskToSchedule = (
  schedule: Schedule,
  task: Omit<Task, 'id'>
): Schedule => {
  const newTaskId = Math.max(...schedule.tasks.map(t => 
    typeof t.id === 'number' ? t.id : parseInt(String(t.id)) || 0
  )) + 1;
  
  const newTask: Task = {
    ...task,
    id: newTaskId
  };
  
  return {
    ...schedule,
    tasks: [...schedule.tasks, newTask],
    updatedAt: new Date().toISOString()
  };
};

/**
 * 스케줄에서 태스크 업데이트
 */
export const updateTaskInSchedule = (
  schedule: Schedule,
  taskId: number | string,
  updates: Partial<Task>
): Schedule | null => {
  const taskIndex = schedule.tasks.findIndex(t => t.id === taskId);
  if (taskIndex === -1) return null;
  
  const updatedTasks = [...schedule.tasks];
  updatedTasks[taskIndex] = {
    ...updatedTasks[taskIndex],
    ...updates
  };
  
  return {
    ...schedule,
    tasks: updatedTasks,
    updatedAt: new Date().toISOString()
  };
};

/**
 * 스케줄에서 태스크 삭제
 */
export const deleteTaskFromSchedule = (
  schedule: Schedule,
  taskId: number | string
): Schedule => {
  return {
    ...schedule,
    tasks: schedule.tasks.filter(t => t.id !== taskId),
    updatedAt: new Date().toISOString()
  };
};