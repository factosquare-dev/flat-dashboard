/**
 * GanttChart constants and configuration
 */

import type { GanttConstants } from './types';
import { TIME_CONSTANTS } from '../../constants/time';

export const GANTT_CONSTANTS: GanttConstants = {
  CELL_WIDTH: 40,
  CELL_HEIGHT: 40,
  HEADER_HEIGHT: 60,
  SIDEBAR_WIDTH: 192, // w-48 = 12rem = 192px
};

// Dynamic dates - will be calculated based on project data
export const getDateRange = () => {
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(baseDate.getDate() - 7); // Start 1 week ago
  
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 3); // End 3 months from now
  
  return { baseDate, endDate };
};

export const { baseDate, endDate } = getDateRange();
export const totalDays = Math.floor((endDate.getTime() - baseDate.getTime()) / TIME_CONSTANTS.DAY) + 1;