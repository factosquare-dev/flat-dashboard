// Schedule related types

export interface Task {
  id: number | string;
  title?: string;
  taskType?: string;
  projectId: string;
  factory?: string;
  details?: string;
  startDate: string;
  endDate: string;
  color?: string;
  x?: number;
  width?: number;
  isCompleted?: boolean;
  allDay?: boolean;
  originalStartDate?: string;
  originalEndDate?: string;
  assignee?: string; // 담당자
  
  // 의존성 및 승인 관련 필드
  dependsOn?: number[]; // 선행 작업 ID 배열
  blockedBy?: number[]; // 이 작업을 막고 있는 작업 ID 배열
  status?: 'pending' | 'in-progress' | 'completed' | 'approved' | 'rejected' | 'blocked';
  approvalRequired?: boolean; // 승인이 필요한 작업인지
  approvedBy?: string; // 승인자
  approvedAt?: string; // 승인 일시
  rejectedReason?: string; // 반려 사유
  completedAt?: string; // 완료 일시
  progress?: number; // 진행률 (0-100)
}

export interface Participant {
  id: string;
  name: string;
  period: string;
  color: string;
  order?: number;
}

export interface Schedule {
  id: string;
  projectId: string;
  participants: Participant[];
  tasks: Task[];
  createdAt: string;
  updatedAt: string;
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