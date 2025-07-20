// Schedule related types

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
  
  // 의존성 및 승인 관련 필드
  dependsOn?: number[]; // 선행 작업 ID 배열
  blockedBy?: number[]; // 이 작업을 막고 있는 작업 ID 배열
  status?: 'pending' | 'in_progress' | 'completed' | 'approved' | 'rejected' | 'blocked';
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

// Ensure all types are properly exported
export type {
  Task,
  Participant,
  Schedule,
  DragTooltip,
  ResizePreview
};