import {
  ProjectStatus,
  ProjectStatusLabel,
  Priority,
  PriorityLabel,
  ServiceType,
  ServiceTypeLabel
} from '@/types/enums';

// Legacy support - use ProjectStatusLabel from enums instead
export const PROJECT_STATUS = {
  BEFORE_START: ProjectStatusLabel[ProjectStatus.PLANNING],
  IN_PROGRESS: ProjectStatusLabel[ProjectStatus.IN_PROGRESS],
  COMPLETED: ProjectStatusLabel[ProjectStatus.COMPLETED],
  SUSPENDED: ProjectStatusLabel[ProjectStatus.CANCELLED],
} as const;

export const PROJECT_STATUS_OPTIONS = Object.values(ProjectStatusLabel);

// Legacy support - use PriorityLabel from enums instead
export const PROJECT_PRIORITY = PriorityLabel;

export const PROJECT_PRIORITY_OPTIONS = Object.values(PriorityLabel);

// Legacy support - use ServiceTypeLabel from enums instead
export const SERVICE_TYPES = ServiceTypeLabel;

export const SERVICE_TYPE_OPTIONS = Object.values(ServiceTypeLabel);

// Status colors for UI consistency
export const PROJECT_STATUS_COLORS = {
  [ProjectStatusLabel[ProjectStatus.PLANNING]]: '#94a3b8',
  [ProjectStatusLabel[ProjectStatus.IN_PROGRESS]]: '#3b82f6',
  [ProjectStatusLabel[ProjectStatus.COMPLETED]]: '#10b981',
  [ProjectStatusLabel[ProjectStatus.CANCELLED]]: '#ef4444',
} as const;

// Priority colors for UI consistency
export const PROJECT_PRIORITY_COLORS = {
  [PriorityLabel[Priority.HIGH]]: '#ef4444',
  [PriorityLabel[Priority.MEDIUM]]: '#f59e0b',
  [PriorityLabel[Priority.LOW]]: '#10b981',
} as const;