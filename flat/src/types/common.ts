/**
 * Common type definitions used across the application
 */

/**
 * Generic API response type
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  message?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
  total?: number;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Sort parameters
 */
export interface SortParams<T> {
  field: keyof T;
  direction: 'asc' | 'desc';
}

/**
 * Date range
 */
export interface DateRange {
  start: string | null;
  end: string | null;
}

/**
 * Time range
 */
export interface TimeRange {
  startTime: string;
  endTime: string;
}

/**
 * Entity with timestamps
 */
export interface Timestamped {
  createdAt: string;
  updatedAt: string;
}

/**
 * Entity with ID
 */
export interface Identifiable {
  id: string | number;
}

/**
 * Selection state
 */
export interface SelectionState<T> {
  selected: T[];
  isAllSelected: boolean;
}

/**
 * Modal state
 */
export interface ModalState {
  isOpen: boolean;
  data?: unknown;
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean;
  error?: Error | null;
}

/**
 * Form field state
 */
export interface FieldState<T> {
  value: T;
  error?: string;
  touched?: boolean;
  isDirty?: boolean;
}

/**
 * Option type for select/dropdown
 */
export interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Tree node structure
 */
export interface TreeNode<T> {
  id: string;
  data: T;
  children?: TreeNode<T>[];
  parent?: string;
  level?: number;
  isExpanded?: boolean;
}

/**
 * Draggable item
 */
export interface DraggableItem {
  id: string;
  index: number;
  isDragging?: boolean;
}

/**
 * Position coordinates
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Size dimensions
 */
export interface Size {
  width: number;
  height: number;
}

/**
 * Rectangle bounds
 */
export interface Bounds extends Position, Size {}

/**
 * Color with optional opacity
 */
export interface Color {
  hex: string;
  rgb?: {
    r: number;
    g: number;
    b: number;
  };
  opacity?: number;
}

/**
 * User preferences
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  timezone?: string;
  dateFormat?: string;
  numberFormat?: string;
}

/**
 * File upload
 */
export interface FileUpload {
  file: File;
  progress?: number;
  status?: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
  url?: string;
}

/**
 * Notification
 */
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Permission
 */
export interface Permission {
  resource: string;
  action: string;
  allowed: boolean;
}

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of specific type
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

/**
 * Nullable type
 */
export type Nullable<T> = T | null;

/**
 * Maybe type (nullable or undefined)
 */
export type Maybe<T> = T | null | undefined;