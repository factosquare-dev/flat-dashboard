/**
 * GanttChart calculation utilities
 */

import { formatDateISO } from '../../../utils/dateUtils';
import { getGanttDateRange, GANTT_CONSTANTS } from '../constants';

export const dateToString = (date: Date): string => {
  return formatDateISO(date);
};

export const stringToDate = (dateStr: string): Date => {
  return new Date(dateStr + 'T00:00:00');
};

export const getDateIndex = (dateStr: string): number => {
  const date = stringToDate(dateStr);
  const { baseDate } = getGanttDateRange();
  const diffTime = date.getTime() - baseDate.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
};

export const getDateFromIndex = (index: number): string => {
  const { baseDate } = getGanttDateRange();
  const date = new Date(baseDate);
  date.setDate(date.getDate() + index);
  return dateToString(date);
};

export const calculateTaskPosition = (startDate: string, endDate: string) => {
  const startIndex = getDateIndex(startDate);
  const endIndex = getDateIndex(endDate);
  const duration = endIndex - startIndex + 1;
  
  return {
    x: startIndex * GANTT_CONSTANTS.CELL_WIDTH,
    width: duration * GANTT_CONSTANTS.CELL_WIDTH,
    startIndex,
    endIndex,
    duration
  };
};

export const getRowFromY = (y: number): number => {
  return Math.floor(y / GANTT_CONSTANTS.CELL_HEIGHT);
};

export const getColFromX = (x: number): number => {
  return Math.floor(x / GANTT_CONSTANTS.CELL_WIDTH);
};

export const getCellPosition = (row: number, col: number) => {
  return {
    x: col * GANTT_CONSTANTS.CELL_WIDTH,
    y: row * GANTT_CONSTANTS.CELL_HEIGHT
  };
};