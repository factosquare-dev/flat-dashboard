/**
 * GanttChart constants and configuration
 */

import type { GanttConstants } from './types';
import { TIME_CONSTANTS } from '@/constants/time';

export const GANTT_CONSTANTS: GanttConstants = {
  CELL_WIDTH: 40,
  CELL_HEIGHT: 40,
  HEADER_HEIGHT: 60,
  SIDEBAR_WIDTH: 192, // w-48 = 12rem = 192px
};

// Re-export from hook for backward compatibility
// Note: This should be replaced with direct hook usage in components
export { useProjectDateRange as getDateRange } from '@/hooks/useProjectDateRange';

// Export functions instead of static values for dynamic calculation
export const getGanttDateRange = getDateRange;

export const getTotalDays = () => {
  const { baseDate, endDate } = getDateRange();
  return Math.floor((endDate.getTime() - baseDate.getTime()) / TIME_CONSTANTS.DAY) + 1;
};