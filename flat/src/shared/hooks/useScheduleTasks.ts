import { useState, useCallback } from 'react';
import type { Task, Factory } from '@/shared/types/schedule';
import { calculateTaskPositionByDate } from '@/shared/utils/scheduleDateCalculation';

const generateTaskColor = (index: number): string => {
  // 모든 태스크에 동일한 파란색 사용
  return 'bg-blue-500';
};

export const useScheduleTasks = (factories: Factory[], startDate: Date, endDate: Date, initialTasks?: Task[], cellWidth: number = 50, days?: Date[]) => {
  const [tasks, setTasks] = useState<Task[]>(() => {
    if (initialTasks && initialTasks.length > 0) {
      // 초기 태스크가 있으면 위치 계산 후 설정
      return initialTasks.map(task => {
        // If days array is provided, use date-based calculation
        let x = 0;
        let width = cellWidth;
        
        if (days && days.length > 0) {
          const position = calculateTaskPositionByDate(
            task.startDate,
            task.endDate,
            days,
            cellWidth
          );
          x = position.x;
          width = position.width;
          
        }
        
        // factoryId가 없는 경우 factory 이름으로 factory 찾기
        let factoryId = task.factoryId;
        if (!factoryId && task.factory && factories.length > 0) {
          const factory = factories.find(f => 
            f.name === task.factory || 
            f.name.replace(/\s*\([^)]*\)\s*$/, '').trim() === task.factory
          );
          if (factory) {
            factoryId = factory.id;
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
    }
    return [];
  });
  const [nextTaskId, setNextTaskId] = useState(() => {
    if (initialTasks && initialTasks.length > 0) {
      const ids = initialTasks.map(t => typeof t.id === 'number' ? t.id : 0);
      return ids.length > 0 ? Math.max(...ids) + 1 : 1;
    }
    return 1;
  });

  const calculateTaskPosition = (taskStartDateStr: string, taskEndDateStr: string): { x: number; width: number } => {
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
    
    // Fallback to old calculation (should not happen if days is provided)
    return { x: 0, width: cellWidth };
  };

  const findFactoryByName = useCallback((factoryName: string) => {
    if (!factoryName) return undefined;
    return factories.find(f => 
      f.name === factoryName || 
      f.name.replace(/\s*\([^)]*\)\s*$/, '').trim() === factoryName
    );
  }, [factories]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'x' | 'width' | 'color'>) => {
    const { x, width } = calculateTaskPosition(task.startDate, task.endDate);
    
    // factory로 participant 찾기
    let factoryId = task.factoryId;
    if (!factoryId && task.factory) {
      const factory = findFactoryByName(task.factory);
      if (factory) {
        factoryId = factory.id;
      }
    }
    
    const newTask: Task = {
      ...task,
      id: nextTaskId,
      x,
      width,
      color: generateTaskColor(tasks.length),
      originalStartDate: task.startDate,
      originalEndDate: task.endDate,
      factoryId: factoryId // factory의 ID만 사용
    };
    
    setTasks(prevTasks => [...prevTasks, newTask]);
    setNextTaskId(nextTaskId + 1);
    
    return newTask;
  }, [cellWidth, days, findFactoryByName, nextTaskId, tasks.length]);

  const updateTask = useCallback((taskId: string | number, updates: Partial<Task>) => {
    setTasks(prevTasks => prevTasks.map(task => {
      if (task.id === taskId) {
        const updatedTask = { ...task, ...updates };
        
        // Recalculate position if dates changed
        if (updates.startDate || updates.endDate) {
          const { x, width } = calculateTaskPosition(
            updates.startDate || task.startDate,
            updates.endDate || task.endDate
          );
          updatedTask.x = x;
          updatedTask.width = width;
        }
        
        return updatedTask;
      }
      return task;
    }));
  }, [calculateTaskPosition]);

  const deleteTask = useCallback((taskId: string | number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  }, []);

  const reorderTasks = useCallback((draggedIndex: number, targetIndex: number, projectId: string) => {
    const projectTasks = tasks.filter(t => t.projectId === projectId);
    const otherTasks = tasks.filter(t => t.projectId !== projectId);
    
    const reorderedProjectTasks = [...projectTasks];
    const [removed] = reorderedProjectTasks.splice(draggedIndex, 1);
    reorderedProjectTasks.splice(targetIndex, 0, removed);
    
    setTasks([...otherTasks, ...reorderedProjectTasks]);
  }, [tasks]);

  return {
    tasks,
    setTasks,
    addTask,
    updateTask,
    deleteTask,
    reorderTasks,
    calculateTaskPosition
  };
};