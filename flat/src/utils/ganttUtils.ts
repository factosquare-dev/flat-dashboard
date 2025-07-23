import { formatDateISO, dateToString, stringToDate } from './dateUtils';
import { GANTT_CONSTANTS, TOTAL_DAYS } from '../constants/gantt';
import { TIME_CONSTANTS } from '../constants/time';

// Date index calculations
export const getDateIndex = (dateStr: string): number => {
  const date = stringToDate(dateStr);
  return Math.floor((date.getTime() - GANTT_CONSTANTS.BASE_DATE.getTime()) / TIME_CONSTANTS.DAY);
};

export const getDateFromIndex = (index: number): string => {
  const date = new Date(GANTT_CONSTANTS.BASE_DATE);
  date.setDate(date.getDate() + index);
  return dateToString(date);
};

// Duration calculations
export const getDuration = (startDate: string, endDate: string): number => {
  const start = stringToDate(startDate);
  const end = stringToDate(endDate);
  return Math.floor((end.getTime() - start.getTime()) / TIME_CONSTANTS.DAY) + 1;
};

// Today utilities
export const getTodayIndex = (): number => {
  const today = new Date();
  const todayString = dateToString(today);
  return getDateIndex(todayString);
};

export const isTodayInRange = (): boolean => {
  const todayIndex = getTodayIndex();
  return todayIndex >= 0 && todayIndex < TOTAL_DAYS;
};

// Grid utilities
export const isWeekendColumn = (col: number): boolean => {
  return (col + 1) % 7 === 0 || (col + 2) % 7 === 0;
};

export const isValidGridCell = (row: number, col: number, totalRows: number): boolean => {
  return row >= 0 && row < totalRows && col >= 0 && col < TOTAL_DAYS;
};