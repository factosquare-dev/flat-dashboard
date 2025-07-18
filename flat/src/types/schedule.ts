// Schedule related types
export interface Participant {
  id: string;
  name: string;
  period: string;
  color: string;
  order?: number;
}

export interface Task {
  id: number;
  title: string;
  projectId: string;
  factory?: string;
  details?: string;
  startDate: string;
  endDate: string;
  color: string;
  x: number;
  width: number;
  isCompleted?: boolean;
  allDay?: boolean;
  originalStartDate?: string;
  originalEndDate?: string;
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