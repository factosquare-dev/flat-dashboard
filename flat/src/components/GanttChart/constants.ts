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

import { MockDatabaseImpl } from '@/mocks/database/MockDatabase';

// Dynamic dates based on actual project data from MockDB
export const getDateRange = () => {
  try {
    const db = MockDatabaseImpl.getInstance();
    const database = db.getDatabase();
    
    if (database?.projects && database.projects.size > 0) {
      const projects = Array.from(database.projects.values());
      
      // Find earliest start date and latest end date
      const startDates = projects.map(p => new Date(p.startDate));
      const endDates = projects.map(p => new Date(p.endDate));
      
      const earliestStart = new Date(Math.min(...startDates.map(d => d.getTime())));
      const latestEnd = new Date(Math.max(...endDates.map(d => d.getTime())));
      
      // Add padding on both sides using TIME_CONSTANTS
      const CHART_PADDING_DAYS = 7;
      const baseDate = new Date(earliestStart.getTime() - (CHART_PADDING_DAYS * TIME_CONSTANTS.DAY));
      const endDate = new Date(latestEnd.getTime() + (CHART_PADDING_DAYS * TIME_CONSTANTS.DAY));
      
      return { baseDate, endDate };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to get dates from MockDB';
    console.error('[GanttChart] Error getting dates from MockDB:', errorMessage, error);
  }
  
  // Fallback to current date range
  const FALLBACK_PADDING_DAYS = 7;
  const FALLBACK_MONTHS_AHEAD = 3;
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(baseDate.getDate() - FALLBACK_PADDING_DAYS);
  
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + FALLBACK_MONTHS_AHEAD);
  
  return { baseDate, endDate };
};

// Export functions instead of static values for dynamic calculation
export const getGanttDateRange = getDateRange;

export const getTotalDays = () => {
  const { baseDate, endDate } = getDateRange();
  return Math.floor((endDate.getTime() - baseDate.getTime()) / TIME_CONSTANTS.DAY) + 1;
};