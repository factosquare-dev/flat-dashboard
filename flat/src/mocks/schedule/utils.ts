/**
 * Schedule Mock 데이터 생성을 위한 유틸리티 함수들
 */

export const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const getToday = (): Date => new Date();

export const getDateRange = (startOffset: number, endOffset: number): { start: Date; end: Date } => {
  const today = getToday();
  return {
    start: addDays(today, startOffset),
    end: addDays(today, endOffset)
  };
};