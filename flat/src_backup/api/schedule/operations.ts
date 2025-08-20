/**
 * Schedule operations - Main entry point
 * Re-exports all schedule-related operations
 */

// Export validation utilities
export {
  validateTaskDates,
  validateTaskDependencies,
  validateTaskParticipants,
  validateTaskProgress,
} from './validation';

// Export task transformation utilities
export {
  getFactoryColor,
  transformDatabaseTask,
  calculateTaskDuration,
  calculateTaskProgressByDate,
  sortTasksByStartDate,
  groupTasksByFactory,
  filterTasksByDateRange,
  getTaskStatistics,
} from './taskTransformers';

// Export schedule CRUD operations
export {
  getOrCreateScheduleForProject,
  getSchedulesForProjects,
  updateSchedule,
  deleteSchedule,
  addTaskToSchedule,
  updateTaskInSchedule,
  deleteTaskFromSchedule,
} from './scheduleOperations';

// Export gantt-specific operations
export {
  transformToGanttTasks,
  createGanttTask,
  updateGanttTask,
  deleteGanttTask,
  calculateGanttDependencies,
} from './ganttOperations';

// Export schedule sync operations
export {
  syncScheduleWithProject,
  syncAllSchedules,
  validateScheduleConsistency,
} from './scheduleSync';