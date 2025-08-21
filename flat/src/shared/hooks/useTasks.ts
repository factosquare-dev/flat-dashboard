import { useMemo } from 'react';
import { TaskCreateModalService } from '@/core/services/taskCreateModal.service';
import { mockDataService } from '@/core/services/mockDataService';
import type { FactoryId } from '@/shared/types/branded';

/**
 * Hook for task creation functionality
 */
export const useTaskCreation = () => {
  const taskTypes = useMemo(() => {
    return TaskCreateModalService.getTaskTypes();
  }, []);

  const validateTaskOverlap = (
    factoryId: string,
    startDate: string,
    endDate: string,
    existingTasks?: { factory: string; factoryId?: FactoryId; startDate: string; endDate: string; }[]
  ) => {
    return TaskCreateModalService.validateTaskOverlap(factoryId, startDate, endDate, existingTasks);
  };

  const createTask = (taskData: {
    factoryId: string;
    taskType: string;
    startDate: string;
    endDate: string;
  }) => {
    return TaskCreateModalService.createTask(taskData);
  };

  const getTaskTypesForFactory = (factoryId: string) => {
    try {
      return mockDataService.getTaskTypesForFactory(factoryId);
    } catch (error) {
      console.error('Failed to get task types for factory:', error);
      return [];
    }
  };

  const getAllFactories = () => {
    try {
      return mockDataService.getAllFactories();
    } catch (error) {
      console.error('Failed to get all factories:', error);
      return [];
    }
  };

  return {
    taskTypes,
    validateTaskOverlap,
    createTask,
    getTaskTypesForFactory,
    getAllFactories,
    isLoading: false,
    error: null
  };
};