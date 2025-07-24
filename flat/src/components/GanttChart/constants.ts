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

import { MockDatabaseImpl } from '../../mocks/database/MockDatabase';

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
      
      // Add 1 week padding on both sides
      const baseDate = new Date(earliestStart.getTime() - (7 * 24 * 60 * 60 * 1000));
      const endDate = new Date(latestEnd.getTime() + (7 * 24 * 60 * 60 * 1000));
      
      return { baseDate, endDate };
    }
  } catch (error) {
    console.error('[GanttChart] Error getting dates from MockDB:', error);
  }
  
  // Fallback to current date range
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(baseDate.getDate() - 7);
  
  const endDate = new Date(today);
  endDate.setMonth(endDate.getMonth() + 3);
  
  return { baseDate, endDate };
};

export const { baseDate, endDate } = getDateRange();
export const totalDays = Math.floor((endDate.getTime() - baseDate.getTime()) / TIME_CONSTANTS.DAY) + 1;