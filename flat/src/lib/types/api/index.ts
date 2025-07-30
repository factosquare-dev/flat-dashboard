/**
 * Central export point for all API types
 */

// Request types
export * from './requests';

// Response types
export * from './responses';

// Common API types
export interface ApiConfig {
  baseURL: string;
  timeout: number;
  headers?: Record<string, string>;
}

export interface ApiError {
  code: string;
  message: string;
  statusCode?: number;
  details?: unknown;
}

export interface RequestOptions {
  headers?: Record<string, string>;
  params?: Record<string, unknown>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

// Type for API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/api/auth/login',
  LOGOUT: '/api/auth/logout',
  REFRESH: '/api/auth/refresh',
  ME: '/api/auth/me',
  
  // Projects
  PROJECTS: '/api/projects',
  PROJECT_BY_ID: (id: string) => `/api/projects/${id}`,
  
  // Users
  USERS: '/api/users',
  USER_BY_ID: (id: string) => `/api/users/${id}`,
  
  // Factories
  FACTORIES: '/api/factories',
  FACTORY_BY_ID: (id: string) => `/api/factories/${id}`,
  
  // Schedules
  SCHEDULES: '/api/schedules',
  SCHEDULE_BY_ID: (id: string) => `/api/schedules/${id}`,
  
  // Tasks
  TASKS: '/api/tasks',
  TASK_BY_ID: (id: string) => `/api/tasks/${id}`,
  
  // Customers
  CUSTOMERS: '/api/customers',
  CUSTOMER_BY_ID: (id: string) => `/api/customers/${id}`,
  
  // Comments
  COMMENTS: '/api/comments',
  COMMENT_BY_ID: (id: string) => `/api/comments/${id}`,
  
  // Upload
  UPLOAD: '/api/upload',
  UPLOAD_MULTIPLE: '/api/upload/multiple',
  
  // Health
  HEALTH: '/api/health',
  PING: '/api/ping',
} as const;

// Helper type to extract endpoint paths
export type ApiEndpoint = typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS] | ReturnType<typeof API_ENDPOINTS[keyof typeof API_ENDPOINTS]>;