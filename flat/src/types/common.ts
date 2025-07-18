// Common utility types
export type ID = string | number;

export type Status = 'idle' | 'loading' | 'success' | 'error';

export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface FilterOptions {
  search?: string;
  status?: string[];
  dateRange?: {
    start: Date | null;
    end: Date | null;
  };
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface BaseEntity {
  id: ID;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: ID;
  updatedBy?: ID;
}

export interface SelectOption<T = string> {
  value: T;
  label: string;
  disabled?: boolean;
  description?: string;
}

// Form related types
export interface FormField<T = any> {
  name: string;
  label?: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption<T>[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: T) => string | null;
  };
}

export interface FormErrors {
  [key: string]: string | undefined;
}

// Event types
export interface CustomEvent<T = any> {
  type: string;
  payload: T;
  timestamp: Date;
  source?: string;
}

// Navigation types
export interface BreadcrumbItem {
  label: string;
  path?: string;
  isActive?: boolean;
}

// File upload types
export interface FileUpload {
  id: ID;
  name: string;
  size: number;
  type: string;
  url?: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress?: number;
  error?: string;
}