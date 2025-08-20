/**
 * Consolidated modal type definitions
 * Centralizes all modal-related types to avoid duplication
 */

// Base modal state
export interface BaseModalState {
  isOpen: boolean;
  data?: unknown;
}

// Schedule-specific modal state
export interface ScheduleModalState {
  isDraggingTask: boolean;
  draggedTask: Task | null;
  isResizingTask: boolean;
  resizingTask: Task | null;
  resizeDirection: 'start' | 'end' | null;
  showTaskModal: boolean;
  showTaskEditModal: boolean;
  selectedTask: Task | null;
  selectedProjectId: string | null;
  selectedDate: string | null;
  selectedFactory: string | null;
  hoveredTaskId: number | null;
  draggedProjectIndex: number | null;
  dragOverProjectIndex: number | null;
}

// Form modal state
export interface FormModalState<T = unknown> extends BaseModalState {
  data?: T;
  mode?: 'create' | 'edit' | 'view';
  loading?: boolean;
  error?: Error | null;
}

// Confirmation modal state
export interface ConfirmModalState extends BaseModalState {
  title?: string;
  message?: string;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: 'default' | 'danger' | 'warning';
}

// Generic modal props
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Form modal props
export interface FormModalProps<T = unknown> extends ModalProps {
  data?: T;
  mode?: 'create' | 'edit' | 'view';
  onSubmit: (data: T) => void | Promise<void>;
  loading?: boolean;
}

// Import types for schedule modal state
import type { Task } from './schedule';