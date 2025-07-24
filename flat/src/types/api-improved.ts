import { ApiResponse, PaginatedResponse, FilterOptions } from './common';

// Type-safe parameter types
export type QueryParams = Record<string, string | number | boolean | undefined>;
export type RequestBody = Record<string, unknown> | FormData | string | null;

// API Client types with improved type safety
export interface ApiClient {
  get<T>(url: string, params?: QueryParams): Promise<ApiResponse<T>>;
  post<T, D = unknown>(url: string, data?: D): Promise<ApiResponse<T>>;
  put<T, D = unknown>(url: string, data?: D): Promise<ApiResponse<T>>;
  patch<T, D = unknown>(url: string, data?: D): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
}

// Request types with proper generics
export interface GetListRequest extends FilterOptions {
  page?: number;
  limit?: number;
}

export interface CreateRequest<T> {
  data: T;
}

export interface UpdateRequest<T> {
  id: string | number;
  data: Partial<T>;
}

export interface DeleteRequest {
  id: string | number;
}

// Response types with proper generics
export interface GetListResponse<T> extends PaginatedResponse<T> {}

export interface GetItemResponse<T> extends ApiResponse<T> {}

export interface CreateResponse<T> extends ApiResponse<T> {}

export interface UpdateResponse<T> extends ApiResponse<T> {}

export interface DeleteResponse extends ApiResponse<{ id: string | number }> {}

// Error types with improved type safety
export interface ApiErrorDetails {
  [key: string]: string | string[] | ApiErrorDetails;
}

export interface ApiError {
  code: string;
  message: string;
  details?: ApiErrorDetails;
  field?: string;
  statusCode?: number;
  timestamp?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  value?: unknown;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
  remember?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
  };
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

// Type guards
export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'message' in error &&
    typeof (error as ApiError).code === 'string' &&
    typeof (error as ApiError).message === 'string'
  );
}

export function isValidationError(error: unknown): error is ValidationError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'field' in error &&
    'message' in error &&
    'code' in error &&
    typeof (error as ValidationError).field === 'string'
  );
}