import { ApiResponse, PaginatedResponse, FilterOptions } from './common';

// API Client types
export interface ApiClient {
  get<T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>>;
  post<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  put<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  patch<T>(url: string, data?: any): Promise<ApiResponse<T>>;
  delete<T>(url: string): Promise<ApiResponse<T>>;
}

// Request types
export interface GetListRequest extends FilterOptions {
  page?: number;
  limit?: number;
}

export interface CreateRequest<T = any> {
  data: T;
}

export interface UpdateRequest<T = any> {
  id: string | number;
  data: Partial<T>;
}

export interface DeleteRequest {
  id: string | number;
}

// Response types
export interface GetListResponse<T = any> extends PaginatedResponse<T> {}

export interface GetItemResponse<T = any> extends ApiResponse<T> {}

export interface CreateResponse<T = any> extends ApiResponse<T> {}

export interface UpdateResponse<T = any> extends ApiResponse<T> {}

export interface DeleteResponse extends ApiResponse<{ id: string | number }> {}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
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