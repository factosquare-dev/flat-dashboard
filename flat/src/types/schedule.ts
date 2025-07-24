// Schedule related types

// Task status enum for better type safety
export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  BLOCKED = 'BLOCKED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

// Participant role in a task
export interface Participant {
  userId: string;
  role: 'manager' | 'member' | 'reviewer';
}

export interface Task {
  id: string;
  scheduleId: string;
  title: string;
  type: 'material' | 'production' | 'quality' | 'packaging' | 'inspection' | 'shipping' | 'other';
  status: TaskStatus;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  participants: Participant[];
  factoryId?: string;
  priority: 'high' | 'medium' | 'low';
  dependsOn: string[]; // Task IDs this task depends on
  blockedBy: string[]; // Task IDs blocking this task
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Legacy fields for backward compatibility
  id_legacy?: number | string;
  taskType?: string;
  projectId?: string;
  factory?: string;
  details?: string;
  startDate_string?: string;
  endDate_string?: string;
  color?: string;
  x?: number;
  width?: number;
  isCompleted?: boolean;
  allDay?: boolean;
  originalStartDate?: string;
  originalEndDate?: string;
  assignee?: string;
}

// Legacy Participant interface for UI components
export interface ParticipantLegacy {
  id: string;
  name: string;
  period: string;
  color: string;
  order?: number;
}

export interface Schedule {
  id: string;
  projectId: string;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  // Legacy fields
  participants?: ParticipantLegacy[];
  tasks?: Task[];
  createdAt_string?: string;
  updatedAt_string?: string;
}

export interface DragTooltip {
  x: number;
  y: number;
  date: string;
}

export interface ResizePreview {
  taskId: number;
  startDate: string;
  endDate: string;
}

export interface ModalState {
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

// Task Controls interface
export interface TaskControls {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: Omit<Task, 'id' | 'x' | 'width' | 'color'>) => Task;
  updateTask: (taskId: number, updates: Partial<Task>) => void;
  deleteTask: (taskId: number) => void;
  reorderTasks: (draggedIndex: number, targetIndex: number, projectId: string) => void;
  calculateTaskPosition: (taskStartDate: Date, taskEndDate: Date) => { x: number; width: number };
}

// Drag Controls interface
export interface DragControls {
  isDragging: boolean;
  scrollRef: React.RefObject<HTMLDivElement>;
  handleMouseDown: (e: React.MouseEvent) => void;
  handleMouseMove: (e: React.MouseEvent) => void;
  handleMouseUp: () => void;
  isDragClick: () => boolean;
  handleSliderChange?: (value: number) => void;
  scrollToToday?: () => void;
}

// Ensure all types are properly exported
export type {
  Task,
  Participant,
  Schedule,
  DragTooltip,
  ResizePreview,
  ModalState,
  TaskControls,
  DragControls
};