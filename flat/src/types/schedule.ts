// Schedule related types

import { Priority, FactoryType, TaskStatus, ParticipantRole, TaskType } from './enums';
import { TaskId, UserId, FactoryId, ProjectId } from './branded';

// Re-export TaskStatus from enums for backward compatibility
export { TaskStatus, ParticipantRole, TaskType } from './enums';

// Participant role in a task
export interface Participant {
  userId: UserId;
  role: ParticipantRole;
}

export interface Task {
  id: TaskId;
  scheduleId: ProjectId;
  title: string;
  type: TaskType;
  status: TaskStatus;
  startDate: Date;
  endDate: Date;
  progress: number; // 0-100
  participants: Participant[];
  factoryId?: FactoryId;
  factory?: string;         // Factory name for display
  priority: Priority;
  dependsOn: TaskId[]; // Task IDs this task depends on
  blockedBy: TaskId[]; // Task IDs blocking this task
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  approvedBy?: UserId;
  approvedAt?: Date;
  rejectionReason?: string;
  
  // Frontend convenience fields (derived from other fields)
  projectId?: ProjectId;     // Derived from scheduleId for quick access
  name?: string;            // Alias for title (component compatibility)
  assigneeId?: UserId;      // Primary assignee from participants
  assignee?: string;        // Assignee name (computed from assigneeId)
  
  // UI-specific fields (computed, not stored)
  x?: number;
  width?: number;
  color?: string;
}


export interface Schedule {
  id: ProjectId; // Schedule ID is same as Project ID
  projectId: ProjectId;
  startDate: Date;
  endDate: Date;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: Date;
  updatedAt: Date;
  factories?: Factory[];
  tasks?: Task[];
}

export interface DragTooltip {
  x: number;
  y: number;
  date: string;
}

export interface ResizePreview {
  taskId: string;
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
  hoveredTaskId: string | null;
  draggedProjectIndex: number | null;
  dragOverProjectIndex: number | null;
}

// Task Controls interface
export interface TaskControls {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  addTask: (task: Omit<Task, 'id' | 'x' | 'width' | 'color'>) => Task;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  deleteTask: (taskId: string) => void;
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