export const getDayNumber = (date: Date): string => {
  return date.getDate().toString();
};

export const formatDayNumberRange = (start: Date, end: Date): string => {
  return `${getDayNumber(start)} ~ ${getDayNumber(end)}`;
};

export const getDaysArray = (start: Date, end: Date): Date[] => {
  const days: Date[] = [];
  const startTime = start.getTime();
  const endTime = end.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  
  let currentTime = startTime;
  while (currentTime <= endTime) {
    days.push(new Date(currentTime));
    currentTime += oneDay;
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
  const newDate = new Date(startDate.getTime());
  newDate.setDate(newDate.getDate() + daysFromStart);
  return newDate;
};

export const formatDateISO = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Alias for backward compatibility - use formatDateISO instead
export const dateToString = formatDateISO;

export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return '방금';
  if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
  if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}일 전`;
  
  return date.toLocaleDateString('ko-KR');
};

export const getDaysFromToday = (dateString: string): number => {
  const targetDate = new Date(dateString);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const isDateInRange = (date: Date, startDate: Date, endDate: Date): boolean => {
  const targetTime = date.getTime();
  const startTime = startDate.getTime();
  const endTime = endDate.getTime();
  
  return targetTime >= startTime && targetTime <= endTime;
};

// These functions are now available from date-fns via utils/date/index.ts
// export const addDays = (date: Date, days: number): Date => { ... }
// export const isSameDate = (date1: Date, date2: Date): boolean => { ... }
// Use addDays and isSameDay from date-fns instead

// Format date to Korean locale string
export function formatDate(date: string | Date, format: 'short' | 'long' | 'full' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(d.getTime())) {
    return '-';
  }
  
  switch (format) {
    case 'short':
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    case 'long':
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    case 'full':
      return d.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        weekday: 'long',
      });
    default:
      return d.toLocaleDateString('ko-KR');
  }
}

// Format date range
export function formatDateRange(startDate: string | Date, endDate: string | Date): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);
  
  if (start === end) {
    return start;
  }
  
  return `${start} ~ ${end}`;
}

// Calculate days between dates - Use differenceInDays from date-fns for new code
export function getDaysBetween(startDate: string | Date, endDate: string | Date): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  const diffTime = Math.abs(end.getTime() - start.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

// Resize-specific date calculation with snap zones
export const calculateResizeDateFromX = (
  x: number, 
  cellWidth: number, 
  days: Date[], 
  isEndDate: boolean = false
): Date => {
  const safeCellWidth = cellWidth || 1; // Guard against division by zero
  const cellIndex = Math.floor(x / safeCellWidth);
  const cellOffset = x % safeCellWidth;
  const snapThreshold = safeCellWidth * 0.5;
  
  if (isEndDate) {
    // For end dates, snap to cell end boundaries
    const targetIndex = cellOffset < snapThreshold 
      ? Math.max(0, cellIndex - 1)  // Snap to end of previous day
      : Math.min(cellIndex, days.length - 1); // Snap to end of current day
    
    // Bounds check
    if (targetIndex < 0 || targetIndex >= days.length) {
      return new Date(days[Math.max(0, Math.min(days.length - 1, targetIndex))]);
    }
    
    return new Date(days[targetIndex]);
  } else {
    // For start dates, snap to cell start boundaries  
    const targetIndex = cellOffset < snapThreshold
      ? cellIndex  // Snap to start of current day
      : Math.min(cellIndex + 1, days.length - 1); // Snap to start of next day
    
    // Bounds check
    if (targetIndex < 0 || targetIndex >= days.length) {
      return new Date(days[Math.max(0, Math.min(days.length - 1, targetIndex))]);
    }
    
    return new Date(days[targetIndex]);
  }
};

// Calculate hovered date index for resize operations
export const calculateHoveredDateIndex = (x: number, cellWidth: number, days: Date[]): number => {
  const isEndDate = false; // For hover, we use start date logic
  const newDate = calculateResizeDateFromX(x, cellWidth, days, isEndDate);
  const dateStr = formatDateISO(newDate);
  
  return days.findIndex(day => formatDateISO(day) === dateStr);
};

// Calculate snap indicator position
export const calculateSnapIndicatorX = (hoveredIndex: number, cellWidth: number, isEndDate: boolean): number => {
  return isEndDate ? (hoveredIndex + 1) * cellWidth : hoveredIndex * cellWidth;
};

// Date index calculations (for Gantt chart)
export const getDateIndex = (dateStr: string, baseDate: Date): number => {
  const date = stringToDate(dateStr);
  return Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
};

export const getDateFromIndex = (index: number, baseDate: Date): string => {
  const date = new Date(baseDate);
  date.setDate(date.getDate() + index);
  return formatDateISO(date);
};

// Duration calculation
export const getDuration = (startDate: string, endDate: string): number => {
  const start = stringToDate(startDate);
  const end = stringToDate(endDate);
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
};

// String to Date conversion
export const stringToDate = (dateStr: string): Date => {
  return new Date(dateStr + 'T00:00:00');
};