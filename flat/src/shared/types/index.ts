// Common types used across the application

// Base types
export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

// UI Component types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Form types
export interface FormFieldProps {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  message?: string;
}

// Pagination types
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

// Sort types
export interface SortParams {
  field: string;
  order: 'asc' | 'desc';
}

// Re-export commonly used types from other modules
export { Project, Customer } from './project';
export { Task, Participant, Schedule } from './schedule';

// Filter types
export interface FilterParams {
  [key: string]: any;
}

// Common status types
export type Status = 'active' | 'inactive' | 'pending' | 'completed' | 'cancelled';

// Priority types
export type Priority = 'low' | 'medium' | 'high' | 'urgent';

// Re-export existing common types
export * from '@/shared/types/common';