/**
 * Mock Schedule Types
 * Types specific to mock data that differ from the main schedule types
 */

import { TaskStatus } from './enums';

// Mock Task interface for schedule mock data
// This differs from the main Task interface which uses string IDs
export interface MockTask {
  id: number;
  projectId: string;
  title: string;
  taskType: string;
  startDate: string;
  endDate: string;
  factory: string;
  factoryId: string;
  assignee: string;
  status: TaskStatus | string; // Allow both enum and string for legacy compatibility
  color?: string;
  isCompleted?: boolean;
  isCurrent?: boolean;
  isDelayed?: boolean;
  isOverlap?: boolean;
  hasWarning?: boolean;
}

// Mock Participant for Gantt chart
export interface Participant {
  id: string;
  name: string;
  type: string;
  period: string;
  color: string;
}