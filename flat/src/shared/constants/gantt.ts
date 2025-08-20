import { TIME_CONSTANTS } from './time';

export const GANTT_CONSTANTS = {
  CELL_WIDTH: 40,
  CELL_HEIGHT: 40,
  HEADER_HEIGHT: 60,
  SIDEBAR_WIDTH: 192, // w-48 = 12rem = 192px
  BASE_DATE: new Date("2025-07-01"),
  END_DATE: new Date("2025-08-31"),
} as const;

// Calculate total days based on date range
export const TOTAL_DAYS = Math.floor(
  (GANTT_CONSTANTS.END_DATE.getTime() - GANTT_CONSTANTS.BASE_DATE.getTime()) / TIME_CONSTANTS.DAY
) + 1;

// Gantt Chart scrollbar styles
export const GANTT_SCROLLBAR_STYLES = `
  .gantt-timeline-scroll::-webkit-scrollbar {
    height: 12px;
  }
  .gantt-timeline-scroll::-webkit-scrollbar-track {
    background: #f3f4f6;
    border-radius: 6px;
  }
  .gantt-timeline-scroll::-webkit-scrollbar-thumb {
    background: #9ca3af;
    border-radius: 6px;
  }
  .gantt-timeline-scroll::-webkit-scrollbar-thumb:hover {
    background: #6b7280;
  }
`;