/**
 * Memoized hook for task statistics
 */

import { useMemo } from 'react';
import { useTaskStore, selectTaskStats, selectTasksByStatus, selectUpcomingTasks } from '../../stores/taskStore';

interface TaskStatistics {
  total: number;
  completed: number;
  inProgress: number;
  pending: number;
  overdue: number;
  completionRate: number;
  upcomingCount: number;
  statusDistribution: {
    completed: number;
    inProgress: number;
    pending: number;
    cancelled?: number;
  };
}

export function useTaskStatistics(projectId: string): TaskStatistics {
  const store = useTaskStore();
  
  return useMemo(() => {
    const stats = selectTaskStats(store, projectId);
    const upcomingTasks = selectUpcomingTasks(store, projectId);
    const completedTasks = selectTasksByStatus(store, projectId, 'completed');
    const inProgressTasks = selectTasksByStatus(store, projectId, 'in_progress');
    const pendingTasks = selectTasksByStatus(store, projectId, 'pending');
    const cancelledTasks = selectTasksByStatus(store, projectId, 'cancelled');

    return {
      ...stats,
      upcomingCount: upcomingTasks.length,
      statusDistribution: {
        completed: completedTasks.length,
        inProgress: inProgressTasks.length,
        pending: pendingTasks.length,
        cancelled: cancelledTasks.length,
      }
    };
  }, [store, projectId]);
}

/**
 * Memoized hook for task progress calculation
 */
export function useTaskProgress(projectId: string) {
  const statistics = useTaskStatistics(projectId);
  
  return useMemo(() => {
    const { total, completed, inProgress, pending, overdue } = statistics;
    
    if (total === 0) {
      return {
        percentage: 0,
        status: 'not-started' as const,
        label: 'No tasks',
      };
    }

    const percentage = Math.round((completed / total) * 100);
    
    let status: 'not-started' | 'in-progress' | 'completed' | 'overdue' = 'not-started';
    let label = '';

    if (overdue > 0) {
      status = 'overdue';
      label = `${overdue} overdue`;
    } else if (completed === total) {
      status = 'completed';
      label = 'Completed';
    } else if (inProgress > 0 || completed > 0) {
      status = 'in-progress';
      label = `${completed}/${total} completed`;
    } else {
      status = 'not-started';
      label = 'Not started';
    }

    return {
      percentage,
      status,
      label,
      details: {
        completed,
        inProgress,
        pending,
        overdue,
        total,
      }
    };
  }, [statistics]);
}