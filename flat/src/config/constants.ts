// Application-wide constants
export const APP_CONSTANTS = {
  // API Status Codes
  HTTP_STATUS: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503,
  },

  // Date Formats
  DATE_FORMAT: {
    DEFAULT: 'yyyy-MM-dd',
    DISPLAY: 'yyyy년 MM월 dd일',
    SHORT: 'MM/dd',
    DATETIME: 'yyyy-MM-dd HH:mm:ss',
    TIME: 'HH:mm',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_PAGE_SIZE: 20,
    PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  },

  // File Upload
  FILE_UPLOAD: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf'],
  },

  // Form Validation
  VALIDATION: {
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE_REGEX: /^[\d-]+$/,
    PASSWORD_MIN_LENGTH: 8,
    USERNAME_MIN_LENGTH: 3,
    USERNAME_MAX_LENGTH: 20,
  },

  // Local Storage Keys
  STORAGE_KEYS: {
    AUTH_TOKEN: 'flat_auth_token',
    REFRESH_TOKEN: 'flat_refresh_token',
    USER_PREFERENCES: 'flat_user_preferences',
    THEME: 'flat_theme',
    LOCALE: 'flat_locale',
  },

  // Routes
  ROUTES: {
    HOME: '/',
    LOGIN: '/login',
    DASHBOARD: '/dashboard',
    PROJECTS: '/projects',
    SCHEDULE: '/schedule',
    CUSTOMERS: '/customers',
    FACTORIES: '/factories',
    USERS: '/users',
    SETTINGS: '/settings',
    NOT_FOUND: '/404',
  },

  // Task Status
  TASK_STATUS: {
    NOT_STARTED: 'not_started',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    DELAYED: 'delayed',
    CANCELLED: 'cancelled',
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    USER: 'user',
    GUEST: 'guest',
  },

  // Colors (for consistency across the app)
  COLORS: {
    PRIMARY: '#3B82F6',
    SECONDARY: '#8B5CF6',
    SUCCESS: '#10B981',
    WARNING: '#F59E0B',
    ERROR: '#EF4444',
    INFO: '#3B82F6',
    GRAY: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
  },

  // Animation Durations (in ms)
  ANIMATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },

  // Z-Index Levels
  Z_INDEX: {
    DROPDOWN: 1000,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    TOAST: 1080,
  },

  // Layout Dimensions (in pixels)
  DIMENSIONS: {
    MODAL_WIDTH: {
      SM: 400,
      MD: 600,
      LG: 800,
      XL: 1000,
    },
    SIDEBAR_WIDTH: 192, // w-48
    CELL_HEIGHT: 40, // h-10
    CELL_WIDTH: 64, // w-16
    GANTT_HEADER_HEIGHT: 32, // h-8
    BUTTON_HEIGHT: {
      SM: 32,
      MD: 40,
      LG: 48,
    },
    INPUT_HEIGHT: 40,
    DROPDOWN_MAX_HEIGHT: 200,
  },

  // Text and Labels (Korean)
  TEXT: {
    COMMON: {
      SAVE: '저장',
      CANCEL: '취소',
      DELETE: '삭제',
      EDIT: '수정',
      ADD: '추가',
      CREATE: '등록',
      CONFIRM: '확인',
      CLOSE: '닫기',
      SELECT: '선택하세요',
      SEARCH: '검색',
      RESET: '초기화',
      LOADING: '로딩 중...',
      NO_DATA: '데이터가 없습니다',
    },
    CUSTOMER: {
      REGISTER: '고객 등록',
      EDIT: '고객 정보 수정',
      INFO: '고객 정보',
      NAME: '고객명',
      COMPANY: '회사명',
      CONTACT_PERSON: '담당자',
      CONTACT_NUMBER: '연락처',
      EMAIL: '이메일',
      ADDRESS: '주소',
      BUSINESS_NUMBER: '사업자번호',
      INDUSTRY: '업종',
      NOTES: '비고',
    },
    TASK: {
      NAME: '작업명',
      SCHEDULE: '일정',
      DURATION: '기간',
      FACTORY: '담당 공장',
      ASSIGNEE: '담당자',
      STATUS: '상태',
      ACTIONS: '작업',
      DAYS_SUFFIX: '일',
    },
    VALIDATION: {
      REQUIRED: '필수 입력 항목입니다',
      INVALID_EMAIL: '올바른 이메일 형식이 아닙니다',
      INVALID_PHONE: '올바른 전화번호 형식이 아닙니다',
      MIN_LENGTH: '최소 {0}자 이상 입력해주세요',
      MAX_LENGTH: '최대 {0}자까지 입력 가능합니다',
    },
  },

  // API Configuration
  API: {
    TIMEOUT: 10000, // 10 seconds
    RETRY_COUNT: 3,
    RETRY_DELAY: 1000, // 1 second
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  },
} as const;

// Type exports for TypeScript
export type HttpStatus = typeof APP_CONSTANTS.HTTP_STATUS[keyof typeof APP_CONSTANTS.HTTP_STATUS];
export type TaskStatus = typeof APP_CONSTANTS.TASK_STATUS[keyof typeof APP_CONSTANTS.TASK_STATUS];
export type UserRole = typeof APP_CONSTANTS.USER_ROLES[keyof typeof APP_CONSTANTS.USER_ROLES];
export type Route = typeof APP_CONSTANTS.ROUTES[keyof typeof APP_CONSTANTS.ROUTES];