export interface ApiConfig {
  baseURL: string;
  timeout: number;
  defaultHeaders: Record<string, string>;
}

export interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Headers;
}

export interface ApiError {
  message: string;
  status?: number;
  statusText?: string;
  data?: any;
}

export interface UploadOptions {
  onProgress?: (progress: number) => void;
  additionalData?: Record<string, string>;
}

export interface RequestContext {
  requestId: string;
  url: string;
  method: string;
  startTime: number;
}