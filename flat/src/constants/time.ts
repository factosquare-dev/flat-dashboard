// Time constants in milliseconds
export const TIME_CONSTANTS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
} as const;

// Common durations
export const DURATION = {
  CACHE_TTL: 5 * TIME_CONSTANTS.MINUTE, // 5 minutes
  CACHE_CLEANUP_INTERVAL: 5 * TIME_CONSTANTS.MINUTE, // 5 minutes
  DEFAULT_STALE_TIME: 5 * TIME_CONSTANTS.MINUTE, // 5 minutes
  DEFAULT_CACHE_TIME: 10 * TIME_CONSTANTS.MINUTE, // 10 minutes
} as const;

// Animation and UI delays
export const UI_DELAYS = {
  MODAL_CLEANUP: 300,
  DRAG_CLEANUP: 300,
  RESIZE_CLEANUP: 200,
  TOOLTIP_DELAY: 100,
  DEBOUNCE_DEFAULT: 300,
  THROTTLE_DEFAULT: 150,
  LAYOUT_TRANSITION: 500,
  SCHEDULE_EFFECT: 300,
} as const;