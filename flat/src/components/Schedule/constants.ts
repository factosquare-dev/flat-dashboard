export const SCHEDULE_CONSTANTS = {
  CELL_WIDTH: 40,
  SCROLL_OFFSET: 200,
  PROJECT_ROW_LEFT_OFFSET: 264,
  DEFAULT_DAYS_BEFORE_TODAY: 7,
  DEFAULT_MONTHS_AFTER_TODAY: 3,
  DEFAULT_DAYS_AFTER_END_DATE: 30,
  INTERACTION_PREVENTION_DELAY: 300, // Delay in ms to prevent accidental clicks after drag/resize
} as const;

export const TASK_COLORS = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  yellow: 'bg-yellow-500',
  cyan: 'bg-cyan-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  orange: 'bg-orange-500',
  pink: 'bg-pink-500',
} as const;

export type TaskColor = keyof typeof TASK_COLORS;