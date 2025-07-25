import React, { useEffect } from 'react';
import { validateTaskFactoryData } from '../../../utils/scheduleUtils';
import type { Task, Participant } from '../../../types/schedule';
import type { ViewMode } from './types';

interface ScheduleDataValidatorProps {
  viewMode: ViewMode;
  tasks: Task[];
  projects: Participant[];
  isDevelopment?: boolean;
}

const ScheduleDataValidator: React.FC<ScheduleDataValidatorProps> = ({
  viewMode,
  tasks,
  projects,
  isDevelopment = import.meta.env.DEV,
}) => {
  useEffect(() => {
    if (!isDevelopment) return;

    // Validate task-factory data consistency
    const validation = validateTaskFactoryData(tasks, projects);
    
    const dataIntegrityCheck = {
      viewMode,
      dataSource: 'taskControls.tasks',
      totalTasks: tasks.length,
      taskIds: tasks.map(t => t.id).sort(),
      tasksByFactory: tasks.reduce((acc, task) => {
        const factory = task.factory || 'Unknown';
        if (!acc[factory]) acc[factory] = 0;
        acc[factory]++;
        return acc;
      }, {} as Record<string, number>),
      validation,
      message: 'Both Table and Gantt views use the same data source (taskControls.tasks)'
    };
    
    // Development logging for data validation
    if (validation.issues.length > 0) {
      // Data integrity issues detected
    }
  }, [viewMode, tasks, projects, isDevelopment]);

  return null;
};

export default ScheduleDataValidator;