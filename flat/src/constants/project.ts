export const PROJECT_STATUS = {
  BEFORE_START: '시작전',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  SUSPENDED: '중단',
} as const;

export const PROJECT_STATUS_OPTIONS = Object.values(PROJECT_STATUS);

export const PROJECT_PRIORITY = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
} as const;

export const PROJECT_PRIORITY_OPTIONS = Object.values(PROJECT_PRIORITY);

export const SERVICE_TYPES = {
  OEM: 'OEM',
  ODM: 'ODM',
  OBM: 'OBM',
  PRIVATE_LABEL: 'Private Label',
  WHITE_LABEL: 'White Label',
  OTHER: '기타',
} as const;

export const SERVICE_TYPE_OPTIONS = Object.values(SERVICE_TYPES);

// Status colors for UI consistency
export const PROJECT_STATUS_COLORS = {
  [PROJECT_STATUS.BEFORE_START]: '#94a3b8',
  [PROJECT_STATUS.IN_PROGRESS]: '#3b82f6',
  [PROJECT_STATUS.COMPLETED]: '#10b981',
  [PROJECT_STATUS.SUSPENDED]: '#ef4444',
} as const;

// Priority colors for UI consistency
export const PROJECT_PRIORITY_COLORS = {
  [PROJECT_PRIORITY.HIGH]: '#ef4444',
  [PROJECT_PRIORITY.MEDIUM]: '#f59e0b',
  [PROJECT_PRIORITY.LOW]: '#10b981',
} as const;