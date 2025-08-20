/**
 * TASK 체크리스트 관련 타입 정의
 */

import { TaskChecklistItem } from './enums/taskChecklist';

// TASK 체크리스트 상태 (각 항목의 완료 여부)
export type TaskChecklistStatus = Record<TaskChecklistItem, boolean>;

// TASK 체크리스트 템플릿
export interface TaskChecklistTemplate {
  id: string;
  name: string;
  description?: string;
  items: TaskChecklistItem[];
  createdAt: Date;
  updatedAt: Date;
}

// 프로젝트의 TASK 체크리스트 상태
export interface ProjectTaskChecklist {
  projectId: string;
  templateId?: string;
  status: TaskChecklistStatus;
  completedAt?: Date;
  updatedAt: Date;
}

// TASK 체크리스트 아이템 메타데이터
export interface TaskChecklistItemMeta {
  item: TaskChecklistItem;
  label: string;
  shortLabel: string;
  order: number;
  description?: string;
  requiredDocs?: string[];
  estimatedDuration?: number; // days
}

// TASK 체크리스트 진행률
export interface TaskChecklistProgress {
  total: number;
  completed: number;
  percentage: number;
  remainingItems: TaskChecklistItem[];
}

// TASK 체크리스트 히스토리
export interface TaskChecklistHistory {
  id: string;
  projectId: string;
  item: TaskChecklistItem;
  status: boolean;
  changedBy: string;
  changedAt: Date;
  note?: string;
}