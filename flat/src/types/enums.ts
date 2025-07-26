/**
 * Centralized enums for type safety and consistency
 * 중앙집중식 enum 정의로 타입 안정성과 일관성 확보
 */

// Factory Types
export enum FactoryType {
  MANUFACTURING = 'MANUFACTURING',
  CONTAINER = 'CONTAINER',
  PACKAGING = 'PACKAGING',
}

// Factory Type Labels (Korean)
export const FactoryTypeLabel: Record<FactoryType, string> = {
  [FactoryType.MANUFACTURING]: '제조',
  [FactoryType.CONTAINER]: '용기',
  [FactoryType.PACKAGING]: '포장',
};

// Project Status
export enum ProjectStatus {
  PLANNING = 'PLANNING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Legacy support - will be removed
export const ProjectStatusEnum = ProjectStatus;

// Project Status Labels (Korean)
export const ProjectStatusLabel: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: '시작전',
  [ProjectStatus.IN_PROGRESS]: '진행중',
  [ProjectStatus.COMPLETED]: '완료',
  [ProjectStatus.CANCELLED]: '중단',
};

// Legacy support - will be removed
export const ProjectStatusDisplayEnum = {
  PLANNING: '시작전',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '중단',
};

// Project Type
export enum ProjectType {
  MASTER = 'MASTER',
  SUB = 'SUB',
  TASK = 'TASK',
}

// Legacy support - will be removed
export const ProjectTypeEnum = ProjectType;

// Project Type Labels (Korean)
export const ProjectTypeLabel: Record<ProjectType, string> = {
  [ProjectType.MASTER]: '대형',
  [ProjectType.SUB]: '소형',
  [ProjectType.TASK]: '작업',
};

// Legacy support - will be removed
export const ProjectTypeDisplayEnum = {
  MASTER: '대형',
  SUB: '소형',
  TASK: '작업',
};

// Priority
export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}

// Legacy support - will be removed
export const PriorityEnum = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
};

// Priority Labels (Korean)
export const PriorityLabel: Record<Priority, string> = {
  [Priority.HIGH]: '높음',
  [Priority.MEDIUM]: '보통',
  [Priority.LOW]: '낮음',
};

// Legacy support - will be removed
export const PriorityDisplayEnum = {
  HIGH: '높음',
  MEDIUM: '보통',
  LOW: '낮음',
};

// Service Types
export enum ServiceType {
  OEM = 'OEM',
  ODM = 'ODM',
  OBM = 'OBM',
  PRIVATE_LABEL = 'PRIVATE_LABEL',
  WHITE_LABEL = 'WHITE_LABEL',
  OTHER = 'OTHER',
}

// Legacy support - will be removed
export const ServiceTypeEnum = {
  OEM: 'OEM',
  ODM: 'ODM',
  OBM: 'OBM',
};

// Service Type Labels
export const ServiceTypeLabel: Record<ServiceType, string> = {
  [ServiceType.OEM]: 'OEM',
  [ServiceType.ODM]: 'ODM',
  [ServiceType.OBM]: 'OBM',
  [ServiceType.PRIVATE_LABEL]: 'Private Label',
  [ServiceType.WHITE_LABEL]: 'White Label',
  [ServiceType.OTHER]: '기타',
};

// Task Status
export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  DELAYED = 'DELAYED',
  CANCELLED = 'CANCELLED',
}

// Legacy support - will be removed
export const TaskStatusEnum = {
  PLANNING: 'planning',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

// Task Status Labels (Korean)
export const TaskStatusLabel: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: '대기중',
  [TaskStatus.IN_PROGRESS]: '진행중',
  [TaskStatus.COMPLETED]: '완료',
  [TaskStatus.DELAYED]: '지연',
  [TaskStatus.CANCELLED]: '취소',
};

// Legacy support - will be removed
export const TaskStatusDisplayEnum = {
  PLANNING: '시작전',
  IN_PROGRESS: '진행중',
  COMPLETED: '완료',
  CANCELLED: '중단',
};

// Deposit Status
export enum DepositStatus {
  PENDING = 'PENDING',
  RECEIVED = 'RECEIVED',
  REFUNDED = 'REFUNDED',
}

// Deposit Status Labels (Korean)
export const DepositStatusLabel: Record<DepositStatus, string> = {
  [DepositStatus.PENDING]: '대기중',
  [DepositStatus.RECEIVED]: '수령완료',
  [DepositStatus.REFUNDED]: '환불완료',
};

// User Roles
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  USER = 'USER',
  CUSTOMER = 'CUSTOMER',
  GUEST = 'GUEST',
}

// Certificate Types
export enum CertificateType {
  ISO_22716 = 'ISO_22716',
  CGMP = 'CGMP',
  ISO_9001 = 'ISO_9001',
  ISO_14001 = 'ISO_14001',
  ISO_45001 = 'ISO_45001',
  FSC = 'FSC',
  VEGAN = 'VEGAN',
  HALAL = 'HALAL',
  EWG = 'EWG',
  COSMOS = 'COSMOS',
  ECOCERT = 'ECOCERT',
}

// Certificate Type Labels
export const CertificateTypeLabel: Record<CertificateType, string> = {
  [CertificateType.ISO_22716]: 'ISO 22716',
  [CertificateType.CGMP]: 'CGMP',
  [CertificateType.ISO_9001]: 'ISO 9001',
  [CertificateType.ISO_14001]: 'ISO 14001',
  [CertificateType.ISO_45001]: 'ISO 45001',
  [CertificateType.FSC]: 'FSC',
  [CertificateType.VEGAN]: 'VEGAN',
  [CertificateType.HALAL]: 'HALAL',
  [CertificateType.EWG]: 'EWG',
  [CertificateType.COSMOS]: 'COSMOS',
  [CertificateType.ECOCERT]: 'ECOCERT',
};

// Utility functions for enum conversions
export const getFactoryTypeFromLabel = (label: string): FactoryType | undefined => {
  return (Object.entries(FactoryTypeLabel).find(([_, val]) => val === label)?.[0] as FactoryType) || undefined;
};

export const getProjectStatusFromLabel = (label: string): ProjectStatus | undefined => {
  return (Object.entries(ProjectStatusLabel).find(([_, val]) => val === label)?.[0] as ProjectStatus) || undefined;
};

export const getPriorityFromLabel = (label: string): Priority | undefined => {
  return (Object.entries(PriorityLabel).find(([_, val]) => val === label)?.[0] as Priority) || undefined;
};

export const getServiceTypeFromLabel = (label: string): ServiceType | undefined => {
  return (Object.entries(ServiceTypeLabel).find(([_, val]) => val === label)?.[0] as ServiceType) || undefined;
};

export const getTaskStatusFromLabel = (label: string): TaskStatus | undefined => {
  return (Object.entries(TaskStatusLabel).find(([_, val]) => val === label)?.[0] as TaskStatus) || undefined;
};

// Type guards
export const isFactoryType = (value: any): value is FactoryType => {
  return Object.values(FactoryType).includes(value);
};

export const isProjectStatus = (value: any): value is ProjectStatus => {
  return Object.values(ProjectStatus).includes(value);
};

export const isPriority = (value: any): value is Priority => {
  return Object.values(Priority).includes(value);
};

export const isServiceType = (value: any): value is ServiceType => {
  return Object.values(ServiceType).includes(value);
};

export const isTaskStatus = (value: any): value is TaskStatus => {
  return Object.values(TaskStatus).includes(value);
};

// Legacy mapping functions - will be removed
export const mapProjectStatus = (status: string): string => {
  const enumValue = getProjectStatusFromLabel(status) || status as ProjectStatus;
  return ProjectStatusLabel[enumValue] || status;
};

export const mapTaskStatus = (status: string): string => {
  const enumValue = getTaskStatusFromLabel(status) || status as TaskStatus;
  return TaskStatusLabel[enumValue] || status;
};

export const mapPriority = (priority: string): string => {
  const enumValue = getPriorityFromLabel(priority) || priority as Priority;
  return PriorityLabel[enumValue] || priority;
};

export const mapProjectType = (type: string): string => {
  const enumValue = type as ProjectType;
  return ProjectTypeLabel[enumValue] || type;
};

// UI Component Variants
export enum BadgeVariant {
  DEFAULT = 'DEFAULT',
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
  DANGER = 'DANGER',
  INFO = 'INFO',
  PURPLE = 'PURPLE',
}

export enum ButtonVariant {
  PRIMARY = 'PRIMARY',
  SECONDARY = 'SECONDARY',
  DANGER = 'DANGER',
  GHOST = 'GHOST',
  SUCCESS = 'SUCCESS',
  WARNING = 'WARNING',
}

export enum ButtonSize {
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
}

export enum BadgeSize {
  XS = 'XS',
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
}

export enum BadgeShape {
  ROUNDED = 'ROUNDED',
  PILL = 'PILL',
  SQUARE = 'SQUARE',
}

export enum BadgeStyle {
  LIGHT = 'LIGHT',
  SOLID = 'SOLID',
  OUTLINE = 'OUTLINE',
}

// HTTP Methods
export enum HttpMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  OPTIONS = 'OPTIONS',
}

// Common States
export enum CommonState {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ENABLED = 'ENABLED',
  DISABLED = 'DISABLED',
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  LOADING = 'LOADING',
  LOADED = 'LOADED',
  ERROR = 'ERROR',
}

// Size Variants
export enum Size {
  XS = 'XS',
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
  XL = 'XL',
  XXL = 'XXL',
}

// Component Size (commonly used)
export enum ComponentSize {
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
}

// Gap Sizes
export enum GapSize {
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
}

// Toast Variants
export enum ToastVariant {
  DEFAULT = 'DEFAULT',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

// Card Variants
export enum CardVariant {
  DEFAULT = 'DEFAULT',
  ELEVATED = 'ELEVATED',
  OUTLINE = 'OUTLINE',
  GHOST = 'GHOST',
}

// Card Padding
export enum CardPadding {
  NONE = 'NONE',
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
}

// Modal Variants
export enum ModalVariant {
  DANGER = 'DANGER',
  WARNING = 'WARNING',
  INFO = 'INFO',
}

// Theme Options
export enum Theme {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  SYSTEM = 'SYSTEM',
}

// Language Options
export enum Language {
  EN = 'EN',
  KO = 'KO',
  JA = 'JA',
}

// Loading States
export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  PENDING = 'PENDING',
}

// Participant Role
export enum ParticipantRole {
  MANAGER = 'MANAGER',
  MEMBER = 'MEMBER',
  REVIEWER = 'REVIEWER',
}

// Task Type
export enum TaskType {
  MATERIAL = 'MATERIAL',
  PRODUCTION = 'PRODUCTION',
  QUALITY = 'QUALITY',
  PACKAGING = 'PACKAGING',
  INSPECTION = 'INSPECTION',
  SHIPPING = 'SHIPPING',
  OTHER = 'OTHER',
}

// Modal Size
export enum ModalSize {
  SM = 'SM',
  MD = 'MD',
  LG = 'LG',
  XL = 'XL',
}