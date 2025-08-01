/**
 * UI-related constants
 */

// Delays and Timeouts (in milliseconds)
export const UI_TIMEOUTS = {
  DEFAULT_DELAY: 300,
  MODAL_TRANSITION: 300,
  SEARCH_DEBOUNCE: 300,
  API_TIMEOUT: 30000,
  RETRY_DELAY: 100,
  SHORT_DELAY: 100,
  MEDIUM_DELAY: 500,
  LONG_DELAY: 1000,
} as const;

// Grid and Layout
export const GRID_CONFIG = {
  DEFAULT_COLUMNS: 2,
  MOBILE_COLUMNS: 1,
  DESKTOP_COLUMNS: 3,
  DEFAULT_GAP: 4,
  SMALL_GAP: 2,
  LARGE_GAP: 6,
} as const;

// Textarea rows
export const TEXTAREA_ROWS = {
  SINGLE: 1,
  SMALL: 2,
  MEDIUM: 3,
  LARGE: 6,
  EXTRA_LARGE: 10,
} as const;

// Icon sizes
export const ICON_SIZES = {
  XS: 3,
  SM: 4,
  MD: 5,
  LG: 6,
  XL: 8,
} as const;

// Z-index layers
export const Z_INDEX = {
  DROPDOWN: 10,
  MODAL: 100,
  MODAL_BACKDROP: 99,
  TOOLTIP: 200,
  NOTIFICATION: 300,
  POPOVER: 50,
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  DEFAULT_PAGE: 1,
} as const;

// Form validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_INPUT_LENGTH: 255,
  MAX_TEXTAREA_LENGTH: 1000,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
} as const;

// Common dimensions
export const DIMENSIONS = {
  HEADER_HEIGHT: 64,
  SIDEBAR_WIDTH: 240,
  SIDEBAR_COLLAPSED_WIDTH: 64,
  MIN_SCREEN_WIDTH: 320,
  MOBILE_BREAKPOINT: 768,
  TABLET_BREAKPOINT: 1024,
  DESKTOP_BREAKPOINT: 1280,
} as const;