/**
 * Common API Request Types
 * Standardized request types for all API endpoints
 */

import type { 
  ProjectStatus, 
  Priority, 
  ServiceType 
} from '@/types/project';
import type { UserRole } from '@/types/user';
import type { FactoryType } from '@/types/factory';
import type { UserId, FactoryId, ProjectId, CustomerId, TaskId } from '@/types/branded';

// Common filter types
export interface DateRangeFilter {
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface SearchParams {
  q?: string;
  search?: string;
}

// Project API requests
export interface ProjectFilters extends PaginationParams, SearchParams {
  status?: ProjectStatus | ProjectStatus[];
  priority?: Priority | Priority[];
  serviceType?: ServiceType | ServiceType[];
  customerId?: CustomerId;
  factoryId?: FactoryId;
  managerId?: UserId;
  startDate?: string;
  endDate?: string;
}

export interface CreateProjectRequest {
  projectCode: string;
  projectName: string;
  customerName: string;
  customerId?: CustomerId;
  productType: string;
  serviceType: ServiceType;
  priority: Priority;
  status: ProjectStatus;
  manager: string;
  managerId?: string;
  startDate: string;
  endDate: string;
  factoryIds?: string[];
  description?: string;
}

export interface UpdateProjectRequest extends Partial<CreateProjectRequest> {
  id: ProjectId;
}

// User API requests
export interface UserFilters extends PaginationParams, SearchParams {
  role?: UserRole | UserRole[];
  isActive?: boolean;
  department?: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  position?: string;
  phone?: string;
  department?: string;
  isActive?: boolean;
}

export interface UpdateUserRequest extends Partial<Omit<CreateUserRequest, 'password'>> {
  id: UserId;
  password?: string;
}

// Factory API requests
export interface FactoryFilters extends PaginationParams, SearchParams {
  type?: FactoryType | FactoryType[];
  isActive?: boolean;
  hasCapacity?: boolean;
  certifications?: string[];
}

export interface CreateFactoryRequest {
  name: string;
  type: FactoryType;
  address: string;
  contact: string;
  email: string;
  capacity: string;
  certifications?: string[];
  description?: string;
  isActive?: boolean;
}

export interface UpdateFactoryRequest extends Partial<CreateFactoryRequest> {
  id: FactoryId;
}

// Schedule API requests
export interface ScheduleFilters extends PaginationParams, SearchParams {
  projectId?: ProjectId;
  factoryId?: FactoryId;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface CreateScheduleRequest {
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  participants?: Array<{
    factoryId: string;
    role: string;
  }>;
}

export interface UpdateScheduleRequest extends Partial<CreateScheduleRequest> {
  id: string;
}

// Task API requests
export interface TaskFilters extends PaginationParams {
  scheduleId?: string;
  factoryId?: string;
  status?: string;
  assigneeId?: string;
  dueDate?: string;
}

export interface CreateTaskRequest {
  scheduleId: string;
  factoryId: string;
  name: string;
  startDate: string;
  endDate: string;
  assigneeId?: string;
  description?: string;
  status?: string;
  progress?: number;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  id: string;
}

// Auth API requests
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface ConfirmResetPasswordRequest {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

// Batch operations
export interface BatchDeleteRequest {
  ids: string[];
}

export interface BatchUpdateRequest<T> {
  ids: string[];
  updates: Partial<T>;
}

// Export commonly used combinations
export type ProjectListRequest = ProjectFilters;
export type UserListRequest = UserFilters;
export type FactoryListRequest = FactoryFilters;
export type ScheduleListRequest = ScheduleFilters;
export type TaskListRequest = TaskFilters;