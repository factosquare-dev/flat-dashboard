/**
 * Common constants used across the application
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
} as const;

// Date/Time
export const DATE_TIME = {
  DEFAULT_DATE_FORMAT: 'YYYY-MM-DD',
  DISPLAY_DATE_FORMAT: 'YYYY.MM.DD',
  DEFAULT_TIME_FORMAT: 'HH:mm',
  DEFAULT_DATETIME_FORMAT: 'YYYY-MM-DD HH:mm',
  WEEK_START_DAY: 1, // Monday
} as const;

// UI Constants
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 200, // ms
  DEBOUNCE_DELAY: 300, // ms
  TOAST_DURATION: 3000, // ms
  MODAL_ANIMATION_DURATION: 300, // ms
  MAX_TOAST_COUNT: 3,
  SCROLL_OFFSET: 100, // px
} as const;

// Validation
export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 20,
  MAX_EMAIL_LENGTH: 255,
  MAX_TITLE_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
} as const;

// Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_PREFERENCES: 'user_preferences',
  THEME: 'theme',
  LANGUAGE: 'language',
  SIDEBAR_STATE: 'sidebar_state',
  TABLE_COLUMNS: 'table_columns',
  FILTER_STATE: 'filter_state',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: '오류가 발생했습니다. 다시 시도해주세요.',
  NETWORK: '네트워크 연결을 확인해주세요.',
  UNAUTHORIZED: '로그인이 필요합니다.',
  FORBIDDEN: '접근 권한이 없습니다.',
  NOT_FOUND: '요청한 리소스를 찾을 수 없습니다.',
  VALIDATION: '입력 값을 확인해주세요.',
  FILE_TOO_LARGE: '파일 크기가 너무 큽니다.',
  INVALID_FILE_TYPE: '지원하지 않는 파일 형식입니다.',
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  SAVE: '저장되었습니다.',
  UPDATE: '수정되었습니다.',
  DELETE: '삭제되었습니다.',
  COPY: '복사되었습니다.',
  UPLOAD: '업로드되었습니다.',
} as const;

// Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Table Constants
export const TABLE_CONSTANTS = {
  DEFAULT_ROW_HEIGHT: 48,
  COMPACT_ROW_HEIGHT: 36,
  HEADER_HEIGHT: 56,
  CELL_PADDING: 16,
  MIN_COLUMN_WIDTH: 100,
  MAX_COLUMN_WIDTH: 500,
} as const;

// Colors (for charts, graphs, etc.)
export const CHART_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
] as const;

// Breakpoints
export const BREAKPOINTS = {
  XS: 0,
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536,
} as const;

// Z-Index Layers
export const Z_INDEX = {
  DROPDOWN: 1000,
  STICKY: 1020,
  MODAL_BACKDROP: 1030,
  MODAL: 1040,
  POPOVER: 1050,
  TOOLTIP: 1060,
  TOAST: 1070,
  NOTIFICATION: 1080,
} as const;