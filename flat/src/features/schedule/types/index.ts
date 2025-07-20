import type { BaseEntity } from '../../common/types';
import type { Project } from '../../projects/types';

// Schedule types
export interface Schedule extends BaseEntity {
  name: string;
  projectId: string;
  factoryId: string;
  startDate: string;
  endDate: string;
  tasks: ScheduleTask[];
  resources: Resource[];
  status: ScheduleStatus;
}

export type ScheduleStatus = 'draft' | 'active' | 'completed' | 'archived';

export interface ScheduleTask {
  id: string;
  scheduleId: string;
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  duration: number; // in hours
  progress: number; // 0-100
  dependencies: string[]; // task IDs
  assignedResources: string[]; // resource IDs
  status: TaskStatus;
  color?: string;
  position?: {
    row: number;
    column: number;
  };
}

export type TaskStatus = 
  | 'not_started'
  | 'in_progress'
  | 'completed'
  | 'delayed'
  | 'blocked';

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  availability: Availability[];
  skills?: string[];
  costPerHour?: number;
}

export type ResourceType = 'human' | 'machine' | 'material';

export interface Availability {
  date: string;
  hours: number;
  isAvailable: boolean;
}

export interface ScheduleView {
  type: ViewType;
  range: DateRange;
  zoom: number;
  filters: ScheduleFilters;
}

export type ViewType = 'day' | 'week' | 'month' | 'quarter' | 'year';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface ScheduleFilters {
  projects?: string[];
  factories?: string[];
  resources?: string[];
  statuses?: TaskStatus[];
}

// Drag and drop types
export interface DragItem {
  type: 'task';
  task: ScheduleTask;
  sourceScheduleId: string;
}

export interface DropResult {
  scheduleId: string;
  position: {
    date: string;
    resourceId?: string;
  };
}

// Grid types
export interface GridCell {
  date: string;
  resourceId?: string;
  tasks: ScheduleTask[];
  isToday: boolean;
  isWeekend: boolean;
  isHoliday: boolean;
}

export interface GridConfig {
  cellWidth: number;
  cellHeight: number;
  headerHeight: number;
  sidebarWidth: number;
}