// Common date calculation function for drag operations
export const calculateDateFromX = (x: number, cellWidth: number, days: Date[]): Date => {
  const daysFromStart = Math.round(x / cellWidth);
  const clampedDays = Math.max(0, Math.min(daysFromStart, days.length - 1));
  return new Date(days[clampedDays]);
};

export const calculateTaskDuration = (startDate: string | Date, endDate: string | Date): number => {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
};

export const calculateEndDate = (startDate: Date, duration: number): Date => {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + duration);
  return endDate;
};