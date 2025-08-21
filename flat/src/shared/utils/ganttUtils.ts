import { formatDateISO, dateToString, getDateIndex as getDateIndexBase, getDateFromIndex as getDateFromIndexBase, getDuration as getDurationBase } from './dateUtils';
import { GANTT_CONSTANTS, TOTAL_DAYS } from '@/constants/gantt';
import { TIME_CONSTANTS } from '@/constants/time';

// Date index calculations with GANTT_CONSTANTS base date
export const getDateIndex = (dateStr: string): number => {
  return getDateIndexBase(dateStr, GANTT_CONSTANTS.BASE_DATE);
};

export const getDateFromIndex = (index: number): string => {
  return getDateFromIndexBase(index, GANTT_CONSTANTS.BASE_DATE);
};

// Re-export getDuration from dateUtils
export const getDuration = getDurationBase;

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