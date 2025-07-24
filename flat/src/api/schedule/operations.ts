import type { Schedule, Task, Participant } from '../../types/schedule';
import type { Project } from '../../types/project';
import { createScheduleFromProject, createSampleInProgressTasks } from '../../data/projectScheduleData';
import { formatDateISO } from '../../utils/dateUtils';
import { USE_MOCK_DATA } from '../../mocks/mockData';
import { getDatabaseWithRetry } from '../../mocks/database/utils';
import { scheduleAdapter } from '../../mocks/adapters/scheduleAdapter';
import { createMockSchedules } from '../../data/mockSchedules';

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
  
  // Fallback: Create schedule with mock tasks for development
  // console.log('[Schedule Operations] No existing schedule found, creating schedule with mock data for project:', project.id);
  
  // Get mock schedules and find tasks for similar projects
  const mockSchedules = createMockSchedules();
  const mockSchedule = mockSchedules.find(s => s.projectId === project.id) || mockSchedules[0];
  
  // Filter tasks to fit within project dates
  const projectStart = new Date(project.startDate);
  const projectEnd = new Date(project.endDate);
  
  // Create non-overlapping tasks within each factory
  let globalTaskId = 1;
  const filteredTasks: any[] = [];
  
  console.log('[Operations] Creating tasks for project:', project.id);
  
  if (mockSchedule) {
    // Group tasks by factory
    const tasksByFactory = new Map<string, any[]>();
    mockSchedule.tasks.forEach(task => {
      const factory = task.factory || 'Unknown';
      if (!tasksByFactory.has(factory)) {
        tasksByFactory.set(factory, []);
      }
      tasksByFactory.get(factory)!.push(task);
    });
    
    // Process each factory's tasks separately to avoid overlaps within the same factory
    tasksByFactory.forEach((factoryTasks, factoryName) => {
      const factory = mockSchedule.participants.find(p => p.name === factoryName);
      let lastEndDateForFactory = new Date(projectStart);
      
      console.log(`[Operations] Processing ${factoryTasks.length} tasks for factory: ${factoryName}`);
      
      // Sort tasks by original start date
      const sortedFactoryTasks = [...factoryTasks].sort((a, b) => 
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
      
      sortedFactoryTasks.forEach((task, index) => {
        const taskDuration = Math.ceil(
          (new Date(task.endDate).getTime() - new Date(task.startDate).getTime()) / (1000 * 60 * 60 * 24)
        );
        
        // For each factory, ensure no overlap within that factory
        let newStartDate: Date;
        if (index === 0) {
          // First task starts at project start
          newStartDate = new Date(projectStart);
        } else {
          // Subsequent tasks start after previous task ends
          newStartDate = new Date(lastEndDateForFactory);
          newStartDate.setDate(newStartDate.getDate() + 2); // Add 2 day gap between tasks
        }
        
        const newEndDate = new Date(newStartDate);
        newEndDate.setDate(newEndDate.getDate() + Math.max(3, taskDuration)); // Minimum 3 days per task
        
        // Check if task fits within project timeline
        if (newEndDate <= projectEnd) {
          const newTask = {
            ...task,
            id: globalTaskId++,
            projectId: project.id,
            factoryId: factory?.id || `factory-unknown`,
            startDate: formatDateISO(newStartDate),
            endDate: formatDateISO(newEndDate)
          };
          
          console.log(`[Operations] Task ${index} for ${factoryName}:`, {
            title: task.title || task.taskType,
            dates: `${formatDateISO(newStartDate)} ~ ${formatDateISO(newEndDate)}`,
            duration: taskDuration
          });
          
          filteredTasks.push(newTask);
          
          lastEndDateForFactory = newEndDate;
        }
      });
    });
  }
  
  const newSchedule: Schedule = {
    id: `schedule-${project.id}-${Date.now()}`,
    projectId: project.id,
    participants: mockSchedule ? mockSchedule.participants : [],
    tasks: filteredTasks,
    startDate: project.startDate,
    endDate: project.endDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // console.log('[Schedule Operations] Created schedule with', filteredTasks.length, 'mock tasks');
  
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