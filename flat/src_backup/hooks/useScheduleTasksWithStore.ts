import { useCallback, useEffect } from 'react';
import type { Task, Participant } from '@/types/schedule';
import { useTaskStore } from '@/stores/taskStore';
import { calculateTaskPositionByDate } from '@/utils/scheduleDateCalculation';

const generateTaskColor = (index: number): string => {
  // 모든 태스크에 동일한 파란색 사용
  return 'bg-blue-500';
};

export const useScheduleTasksWithStore = (
  participants: Participant[], 
  startDate: Date, 
  endDate: Date, 
  projectId?: string,
  cellWidth: number = 50,
  days?: Date[]
) => {
  const { 
    getTasksForProject, 
    addTask: storeAddTask, 
    updateTask: storeUpdateTask, 
    deleteTask: storeDeleteTask 
  } = useTaskStore();

  // Get tasks from store
  const tasks = projectId ? getTasksForProject(projectId) : [];

  const calculateTaskPosition = useCallback((taskStartDateStr: string, taskEndDateStr: string): { x: number; width: number } => {
    // Use date-based calculation if days array is available
    if (days && days.length > 0) {
      const position = calculateTaskPositionByDate(
        taskStartDateStr,
        taskEndDateStr,
        days,
        cellWidth
      );
      return { x: position.x, width: position.width };
    }
    
    // Fallback
    return { x: 0, width: cellWidth };
  }, [days, cellWidth]);

  // Calculate positions for all tasks
  const tasksWithPositions = tasks.map(task => {
    const { x, width } = calculateTaskPosition(task.startDate, task.endDate);
    
    // factoryId가 없는 경우 factory 이름으로 participant 찾기
    let factoryId = task.factoryId;
    if (!factoryId && task.factory && participants.length > 0) {
      const participant = participants.find(p => 
        p.name === task.factory || 
        p.name.replace(/\s*\([^)]*\)\s*$/, '').trim() === task.factory
      );
      if (participant) {
        factoryId = participant.id;
      }
    }
    
    return {
      ...task,
      x,
      width,
      color: task.color || 'bg-blue-500',
      originalStartDate: task.startDate,
      originalEndDate: task.endDate,
      factoryId: factoryId
    };
  });

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'x' | 'width' | 'color'>) => {
    if (!projectId) {
      return;
    }

    const { x, width } = calculateTaskPosition(task.startDate, task.endDate);
    
    // factory로 participant 찾기
    let factoryId = task.factoryId;
    if (!factoryId && task.factory) {
      const participant = participants.find(p => 
        p.name === task.factory || 
        p.name.replace(/\s*\([^)]*\)\s*$/, '').trim() === task.factory
      );
      if (participant) {
        factoryId = participant.id;
      }
    }
    
    const taskData = {
      ...task,
      factoryId: factoryId,
      scheduleId: '', // Will be set by the store
      type: 'other' as const,
      status: 'pending' as const,
      progress: 0,
      participants: [],
      priority: 'medium' as const,
      dependsOn: [],
      blockedBy: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    try {
      const newTask = await storeAddTask(projectId, taskData);
      return newTask;
    } catch (error) {
      throw error;
    }
  }, [projectId, storeAddTask, calculateTaskPosition, participants]);

  const updateTask = useCallback(async (taskId: number | string, updates: Partial<Task>) => {
    if (!projectId) {
      return;
    }

    try {
      await storeUpdateTask(projectId, taskId, updates);
    } catch (error) {
      throw error;
    }
  }, [projectId, storeUpdateTask]);

  const deleteTask = useCallback(async (taskId: number | string) => {
    if (!projectId) {
      return;
    }

    try {
      await storeDeleteTask(projectId, taskId);
    } catch (error) {
      throw error;
    }
  }, [projectId, storeDeleteTask]);

  const setTasks = useCallback((newTasks: Task[] | ((prev: Task[]) => Task[])) => {
    // This is a no-op for store-based implementation
    // Tasks are managed by the store
  }, []);

  const reorderTasks = useCallback((draggedIndex: number, targetIndex: number, projectId: string) => {
    // TODO: Implement reordering in store if needed
  }, []);

  return {
    tasks: tasksWithPositions,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    calculateTaskPosition
  };
};