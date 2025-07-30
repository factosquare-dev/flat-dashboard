import type { ReactNode } from 'react';

// Base component interfaces
export interface BaseProps {
  className?: string;
  children?: ReactNode;
  id?: string;
  'data-testid'?: string;
}

export interface ClickableProps extends BaseProps {
  onClick?: (event: React.MouseEvent) => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface FormProps<T = string | number | boolean | null> extends BaseProps {
  name?: string;
  value?: T;
  onChange?: (value: T) => void;
  onBlur?: (event: React.FocusEvent) => void;
  onFocus?: (event: React.FocusEvent) => void;
  required?: boolean;
  placeholder?: string;
  error?: string;
  label?: string;
  helpText?: string;
}

// Button component props
export interface ButtonProps extends ClickableProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  type?: 'button' | 'submit' | 'reset';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

// Input component props
export interface InputProps extends FormProps {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  autoComplete?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  readOnly?: boolean;
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Select component props
export interface SelectProps extends FormProps {
  options: Array<{
    value: string | number;
    label: string;
    disabled?: boolean;
    group?: string;
  }>;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  emptyMessage?: string;
  loadingMessage?: string;
}

// Modal component props
export interface ModalProps extends BaseProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  header?: ReactNode;
  footer?: ReactNode;
}

// Card component props
export interface CardProps extends BaseProps {
  variant?: 'default' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
  clickable?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  header?: ReactNode;
  footer?: ReactNode;
}

// Badge component props
export interface BadgeProps extends BaseProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  removable?: boolean;
  onRemove?: () => void;
}

// Loading component props
export interface LoadingProps extends BaseProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'skeleton';
  text?: string;
  overlay?: boolean;
}

// Table component props
export interface TableProps<T = unknown> extends BaseProps {
  data: T[];
  columns: TableColumn[];
  loading?: boolean;
  emptyMessage?: string;
  selectable?: boolean;
  selectedRows?: string[];
  onSelectRow?: (rowId: string, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  sortable?: boolean;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  onSort?: (field: string) => void;
  pagination?: PaginationProps;
  striped?: boolean;
  hover?: boolean;
  bordered?: boolean;
  compact?: boolean;
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: <T = unknown>(value: unknown, row: T, index: number) => ReactNode;
  className?: string;
}

export interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  showSizeChanger?: boolean;
  showTotal?: boolean;
  showQuickJumper?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

// Toast/Notification component props
export interface ToastProps extends BaseProps {
  variant?: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  description?: string;
  duration?: number;
  closable?: boolean;
  onClose?: () => void;
  action?: ReactNode;
}

// Tabs component props
export interface TabsProps extends BaseProps {
  defaultValue?: string;
  value?: string;
  onChange?: (value: string) => void;
  variant?: 'line' | 'card' | 'button';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  items: TabItem[];
}

export interface TabItem {
  key: string;
  label: string;
  content: ReactNode;
  disabled?: boolean;
  icon?: ReactNode;
}

// Dropdown component props
export interface DropdownProps extends BaseProps {
  trigger: ReactNode;
  items: DropdownItem[];
  placement?: 'bottom-start' | 'bottom-end' | 'top-start' | 'top-end';
  arrow?: boolean;
  closeOnSelect?: boolean;
  disabled?: boolean;
}

export interface DropdownItem {
  key: string;
  label: string;
  icon?: ReactNode;
  disabled?: boolean;
  danger?: boolean;
  onClick?: () => void;
  separator?: boolean;
}

// Error boundary props
export interface ErrorBoundaryProps extends BaseProps {
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetOnPropsChange?: boolean;
}

// Layout component props
export interface LayoutProps extends BaseProps {
  direction?: 'row' | 'column';
  gap?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  margin?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

// Event handler types
export type EventHandler<T = React.SyntheticEvent> = (event: T) => void;
export type ChangeHandler<T = unknown> = (value: T) => void;
export type AsyncEventHandler<T = React.SyntheticEvent> = (event: T) => Promise<void>;
export type AsyncChangeHandler<T = unknown> = (value: T) => Promise<void>;

// Common state types
export interface AsyncState<T = unknown> {
  data: T | null;
  loading: boolean;
  error: string | null;
  success: boolean;
}

export interface ValidationState {
  isValid: boolean;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
}

// Component state types
export interface ComponentState<T = unknown> {
  mounted: boolean;
  initialized: boolean;
  data: T | null;
  meta: Record<string, unknown>;
}