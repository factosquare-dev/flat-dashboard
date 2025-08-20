import type { BaseEntity, Status, Priority } from '@/common/types';

// Project types
export interface Project extends BaseEntity {
  projectCode: string;
  projectName: string;
  customerName: string;
  factoryId: string;
  factoryName: string;
  productType: string;
  quantity: number;
  unit: string;
  status: ProjectStatus;
  priority: Priority;
  startDate: string;
  endDate: string;
  progress: number;
  assignedTo: string[];
  tags: string[];
  description?: string;
  attachments?: Attachment[];
}

export type ProjectStatus = 
  | 'draft'
  | 'pending'
  | 'in_progress' 
  | 'completed'
  | 'cancelled'
  | 'on_hold';

export interface ProjectFilter {
  status?: ProjectStatus[];
  priority?: Priority[];
  factoryId?: string[];
  assignedTo?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  search?: string;
}

export interface ProjectFormData {
  projectName: string;
  customerName: string;
  factoryId: string;
  productType: string;
  quantity: number;
  unit: string;
  priority: Priority;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface Attachment {
  id: string;
  filename: string;
  url: string;
  size: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ProjectTask {
  id: string;
  projectId: string;
  taskName: string;
  description?: string;
  status: Status;
  assignedTo: string[];
  startDate: string;
  endDate: string;
  dependencies: string[];
  progress: number;
}

export interface ProjectMetrics {
  totalProjects: number;
  completedProjects: number;
  inProgressProjects: number;
  delayedProjects: number;
  averageCompletionRate: number;
  upcomingDeadlines: number;
}