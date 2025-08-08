/**
 * Central hub for all enum exports
 * 
 * This file re-exports all enums from their domain-specific files
 * for backward compatibility and convenience
 */

// Factory related enums
export {
  FactoryType,
  FactoryTypeLabel,
  ProjectFactoryField,
  ProjectFactoryIdField,
  FactoryFieldToType,
  FactoryTypeToField,
  FactoryTypeToIdField,
} from './enums/factory';

// Project related enums
export {
  ProjectStatus,
  ProjectStatusLabel,
  ProjectType,
  ProjectTypeLabel,
  Priority,
  PriorityLabel,
  ServiceType,
  ServiceTypeLabel,
  DepositStatus,
  DepositStatusLabel,
  ProjectField,
  ProjectFieldLabel,
} from './enums/project';

// Task related enums
export {
  TaskStatus,
  TaskStatusLabel,
  TaskType,
  TaskTypeLabel,
  TasksByFactoryType,
  ParticipantRole,
  ParticipantRoleLabel,
  ViewMode,
  ViewModeLabel,
  PeriodType,
  PeriodTypeLabel,
  SpecialRowType,
  WorkflowActionType,
  DragItemType,
} from './enums/task';

// User related enums
export {
  UserRole,
  UserRoleLabel,
  RoleCategory,
  UserStatus,
  UserStatusLabel,
  PermissionLevel,
  PermissionLevelLabel,
  AuthStatus,
  LoginMethod,
} from './enums/user';

// Product related enums
export {
  ProductType,
  ProductTypeLabel,
  ProductCategoriesByType,
  CertificateType,
  CertificateTypeLabel,
  CertificateCategories,
  ProductStatus,
  ProductStatusLabel,
} from './enums/product';

// UI related enums
export {
  BadgeVariant,
  ButtonVariant,
  ButtonSize,
  BadgeSize,
  BadgeShape,
  BadgeStyle,
  ComponentSize,
  Size,
  GapSize,
  ToastVariant,
  CardVariant,
  CardPadding,
  ModalVariant,
  ModalSize,
  Theme,
  Language,
  LoadingState,
  ComponentState,
  ValidationMessageType,
  ValidationMessageTypeLabel,
  IconSizeMap,
  SpacingMap,
  TableColumnId,
} from './enums/ui';

// Common/API related enums
export {
  HttpMethod,
  CommonState,
  ApiStatus,
  SortDirection,
  FilterOperator,
  EditableCellType,
  FileType,
  FileTypeExtensions,
  NotificationType,
  NotificationPriority,
} from './enums/common';

// Utility functions for enum conversions
export const getFactoryTypeFromLabel = (label: string): FactoryType | undefined => {
  const { FactoryType, FactoryTypeLabel } = require('./enums/factory');
  return (Object.entries(FactoryTypeLabel).find(([_, val]) => val === label)?.[0] as FactoryType) || undefined;
};

export const getProjectStatusFromLabel = (label: string): ProjectStatus | undefined => {
  const { ProjectStatus, ProjectStatusLabel } = require('./enums/project');
  return (Object.entries(ProjectStatusLabel).find(([_, val]) => val === label)?.[0] as ProjectStatus) || undefined;
};

export const getPriorityFromLabel = (label: string): Priority | undefined => {
  const { Priority, PriorityLabel } = require('./enums/project');
  return (Object.entries(PriorityLabel).find(([_, val]) => val === label)?.[0] as Priority) || undefined;
};

export const getServiceTypeFromLabel = (label: string): ServiceType | undefined => {
  const { ServiceType, ServiceTypeLabel } = require('./enums/project');
  return (Object.entries(ServiceTypeLabel).find(([_, val]) => val === label)?.[0] as ServiceType) || undefined;
};

export const getTaskStatusFromLabel = (label: string): TaskStatus | undefined => {
  const { TaskStatus, TaskStatusLabel } = require('./enums/task');
  return (Object.entries(TaskStatusLabel).find(([_, val]) => val === label)?.[0] as TaskStatus) || undefined;
};

// Type guards
export const isFactoryType = (value: unknown): value is FactoryType => {
  const { FactoryType } = require('./enums/factory');
  return Object.values(FactoryType).includes(value as FactoryType);
};

export const isProjectStatus = (value: unknown): value is ProjectStatus => {
  const { ProjectStatus } = require('./enums/project');
  return Object.values(ProjectStatus).includes(value as ProjectStatus);
};

export const isPriority = (value: unknown): value is Priority => {
  const { Priority } = require('./enums/project');
  return Object.values(Priority).includes(value as Priority);
};

export const isServiceType = (value: unknown): value is ServiceType => {
  const { ServiceType } = require('./enums/project');
  return Object.values(ServiceType).includes(value as ServiceType);
};

export const isTaskStatus = (value: unknown): value is TaskStatus => {
  const { TaskStatus } = require('./enums/task');
  return Object.values(TaskStatus).includes(value as TaskStatus);
};