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
  AGING = 'AGING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}


// Project Status Labels (Korean)
export const ProjectStatusLabel: Record<ProjectStatus, string> = {
  [ProjectStatus.PLANNING]: '시작전',
  [ProjectStatus.IN_PROGRESS]: '진행중',
  [ProjectStatus.COMPLETED]: '완료',
  [ProjectStatus.CANCELLED]: '중단',
};


// Project Type
export enum ProjectType {
  MASTER = 'MASTER',
  SUB = 'SUB',
  TASK = 'TASK',
}


// Project Type Labels (Korean)
export const ProjectTypeLabel: Record<ProjectType, string> = {
  [ProjectType.MASTER]: '대형',
  [ProjectType.SUB]: '소형',
  [ProjectType.TASK]: '작업',
};


// Priority
export enum Priority {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW',
}


// Priority Labels (Korean)
export const PriorityLabel: Record<Priority, string> = {
  [Priority.HIGH]: '높음',
  [Priority.MEDIUM]: '보통',
  [Priority.LOW]: '낮음',
};


// Product Types
export enum ProductType {
  SKINCARE = 'SKINCARE',
  MAKEUP = 'MAKEUP',
  HAIR_CARE = 'HAIR_CARE',
  BODY_CARE = 'BODY_CARE',
  PERFUME = 'PERFUME',
  SUPPLEMENTS = 'SUPPLEMENTS',
  OTHER = 'OTHER',
}

// Product Type Labels (Korean)
export const ProductTypeLabel: Record<ProductType, string> = {
  [ProductType.SKINCARE]: '스킨케어',
  [ProductType.MAKEUP]: '메이크업',
  [ProductType.HAIR_CARE]: '헤어케어',
  [ProductType.BODY_CARE]: '바디케어',
  [ProductType.PERFUME]: '향수',
  [ProductType.SUPPLEMENTS]: '건강기능식품',
  [ProductType.OTHER]: '기타',
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


// Task Status Labels (Korean)
export const TaskStatusLabel: Record<TaskStatus, string> = {
  [TaskStatus.PENDING]: '대기중',
  [TaskStatus.IN_PROGRESS]: '진행중',
  [TaskStatus.COMPLETED]: '완료',
  [TaskStatus.DELAYED]: '지연',
  [TaskStatus.CANCELLED]: '취소',
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
export const isFactoryType = (value: unknown): value is FactoryType => {
  return Object.values(FactoryType).includes(value as FactoryType);
};

export const isProjectStatus = (value: unknown): value is ProjectStatus => {
  return Object.values(ProjectStatus).includes(value as ProjectStatus);
};

export const isPriority = (value: unknown): value is Priority => {
  return Object.values(Priority).includes(value as Priority);
};

export const isServiceType = (value: unknown): value is ServiceType => {
  return Object.values(ServiceType).includes(value as ServiceType);
};

export const isTaskStatus = (value: unknown): value is TaskStatus => {
  return Object.values(TaskStatus).includes(value as TaskStatus);
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

// View Mode for Schedule and other views
export enum ViewMode {
  GANTT = 'GANTT',
  TABLE = 'TABLE',
  CALENDAR = 'CALENDAR',
  LIST = 'LIST',
  BOARD = 'BOARD',
}

// View Mode Labels (Korean)
export const ViewModeLabel: Record<ViewMode, string> = {
  [ViewMode.GANTT]: '간트차트',
  [ViewMode.TABLE]: '테이블',
  [ViewMode.CALENDAR]: '캘린더',
  [ViewMode.LIST]: '리스트',
  [ViewMode.BOARD]: '보드',
};

// Period Types for Factory/Participant
export enum PeriodType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

// Period Type Labels (Korean)
export const PeriodTypeLabel: Record<PeriodType, string> = {
  [PeriodType.DAILY]: '일간',
  [PeriodType.WEEKLY]: '주간',
  [PeriodType.MONTHLY]: '월간',
  [PeriodType.QUARTERLY]: '분기',
  [PeriodType.YEARLY]: '연간',
  [PeriodType.CUSTOM]: '사용자정의',
};

// Special Row Types for Schedule
export enum SpecialRowType {
  ADD_FACTORY = 'ADD_FACTORY',
  ADD_PARTICIPANT = 'ADD_PARTICIPANT',
  SUMMARY = 'SUMMARY',
}

// Workflow Action Types
export enum WorkflowActionType {
  SET_TASK = 'SET_TASK',
  SET_START_DATE = 'SET_START_DATE',
  SET_END_DATE = 'SET_END_DATE',
  SET_FACTORY = 'SET_FACTORY',
  INITIALIZE_QUICK_ADD = 'INITIALIZE_QUICK_ADD',
  RESET = 'RESET',
  SUBMIT = 'SUBMIT',
}

// Drag Item Types
export enum DragItemType {
  TASK = 'TASK',
  PROJECT = 'PROJECT',
  FACTORY = 'FACTORY',
  RESOURCE = 'RESOURCE',
}

// API Response Status
export enum ApiStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

// Sort Direction
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

// Filter Operator
export enum FilterOperator {
  EQUALS = 'EQUALS',
  NOT_EQUALS = 'NOT_EQUALS',
  CONTAINS = 'CONTAINS',
  NOT_CONTAINS = 'NOT_CONTAINS',
  STARTS_WITH = 'STARTS_WITH',
  ENDS_WITH = 'ENDS_WITH',
  GREATER_THAN = 'GREATER_THAN',
  LESS_THAN = 'LESS_THAN',
  BETWEEN = 'BETWEEN',
  IN = 'IN',
  NOT_IN = 'NOT_IN',
}

// Editable Cell Types
export enum EditableCellType {
  TEXT = 'TEXT',
  SEARCH = 'SEARCH',
  DATE = 'DATE',
  CURRENCY = 'CURRENCY',
}