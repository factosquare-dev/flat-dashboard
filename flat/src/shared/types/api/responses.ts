/**
 * Common API Response Types
 * Standardized response types for all API endpoints
 */

import type { 
  Project, 
  ProjectStatus, 
  Priority, 
  ServiceType 
} from '@/shared/types/project';
import type { 
  User, 
  UserRole 
} from '@/shared/types/user';
import type { 
  Factory, 
  FactoryType 
} from '@/shared/types/factory';
import type { 
  Schedule, 
  Task 
} from '@/shared/types/schedule';

// Base response structure
export interface BaseResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp?: string;
}

// Error response structure
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp?: string;
}

// Pagination meta
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalCount: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

// Paginated response
export interface PaginatedResponse<T> extends BaseResponse<T[]> {
  meta: PaginationMeta;
}

// Project API responses
export interface ProjectResponse extends BaseResponse<Project> {}
export interface ProjectsResponse extends PaginatedResponse<Project> {}
export interface CreateProjectResponse extends BaseResponse<Project> {}
export interface UpdateProjectResponse extends BaseResponse<Project> {}
export interface DeleteProjectResponse extends BaseResponse<{ id: string }> {}

// User API responses
export interface UserResponse extends BaseResponse<User> {}
export interface UsersResponse extends PaginatedResponse<User> {}
export interface CreateUserResponse extends BaseResponse<User> {}
export interface UpdateUserResponse extends BaseResponse<User> {}
export interface DeleteUserResponse extends BaseResponse<{ id: string }> {}

// Factory API responses
export interface FactoryResponse extends BaseResponse<Factory> {}
export interface FactoriesResponse extends PaginatedResponse<Factory> {}
export interface CreateFactoryResponse extends BaseResponse<Factory> {}
export interface UpdateFactoryResponse extends BaseResponse<Factory> {}
export interface DeleteFactoryResponse extends BaseResponse<{ id: string }> {}

// Schedule API responses
export interface ScheduleResponse extends BaseResponse<Schedule> {}
export interface SchedulesResponse extends PaginatedResponse<Schedule> {}
export interface CreateScheduleResponse extends BaseResponse<Schedule> {}
export interface UpdateScheduleResponse extends BaseResponse<Schedule> {}
export interface DeleteScheduleResponse extends BaseResponse<{ id: string }> {}

// Task API responses
export interface TaskResponse extends BaseResponse<Task> {}
export interface TasksResponse extends PaginatedResponse<Task> {}
export interface CreateTaskResponse extends BaseResponse<Task> {}
export interface UpdateTaskResponse extends BaseResponse<Task> {}
export interface DeleteTaskResponse extends BaseResponse<{ id: string }> {}

// Auth API responses
export interface LoginResponse extends BaseResponse<{
  user: User;
  token: string;
  refreshToken?: string;
  expiresIn: number;
}> {}

export interface RefreshTokenResponse extends BaseResponse<{
  token: string;
  refreshToken?: string;
  expiresIn: number;
}> {}

export interface LogoutResponse extends BaseResponse<{ success: boolean }> {}

// Upload API responses
export interface UploadFileResponse extends BaseResponse<{
  fileId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
}> {}

export interface UploadFilesResponse extends BaseResponse<{
  files: Array<{
    fileId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
  }>;
}> {}

// Health check response
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  version?: string;
  services?: Record<string, 'up' | 'down'>;
}

// Type guard functions
export function isErrorResponse(response: unknown): response is ErrorResponse {
  return (
    typeof response === 'object' &&
    response !== null &&
    'success' in response &&
    response.success === false &&
    'error' in response
  );
}

export function isPaginatedResponse<T>(
  response: unknown
): response is PaginatedResponse<T> {
  return (
    typeof response === 'object' &&
    response !== null &&
    'meta' in response &&
    typeof (response as any).meta === 'object'
  );
}