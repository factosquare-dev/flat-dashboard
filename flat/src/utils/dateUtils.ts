export const formatDate = (date: Date): string => {
  return date.toLocaleDateString('ko-KR', {
    month: '2-digit',
    day: '2-digit'
  }).replace(/\. /g, '/').replace('.', '');
};

export const formatDateRange = (start: Date, end: Date): string => {
  return `${formatDate(start)} ~ ${formatDate(end)}`;
};

export const getDaysArray = (start: Date, end: Date): Date[] => {
  const days: Date[] = [];
  const current = new Date(start);
  
  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return days;
};

export const getWeekNumber = (date: Date): number => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
};

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
};

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const getDateFromX = (x: number, startDate: Date, cellWidth: number): Date => {
  const daysFromStart = Math.round(x / cellWidth);
  const date = new Date(startDate);
  date.setDate(date.getDate() + daysFromStart);
  return date;
};