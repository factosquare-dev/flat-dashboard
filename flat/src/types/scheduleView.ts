/**
 * Schedule View specific types
 * These types are used for the Schedule/Gantt chart UI components
 */

import { FactoryType, ViewMode, PeriodType, SpecialRowType } from './enums';
import { FactoryId, ProjectId, TaskId } from './branded';
import { Factory } from './factory';
import { Task } from './schedule';

/**
 * Schedule Participant - represents a row in the schedule view
 * Can be a factory, team, or special row (like "Add Factory")
 */
export interface ScheduleParticipant {
  id: string; // Can be FactoryId or special ID like 'ADD_FACTORY_ROW'
  name: string;
  type: FactoryType | SpecialRowType; // Using enums instead of string
  period: PeriodType | string; // Using enum, but allowing string for custom periods
  color: string; // Hex color for UI display
  order?: number; // Display order in the list
  isSpecialRow?: boolean; // Flag for special rows like "Add Factory"
}

/**
 * Schedule View Props
 */
export interface ScheduleViewProps {
  participants: ScheduleParticipant[];
  tasks: Task[];
  viewMode: ViewMode;
  startDate: string;
  endDate: string;
  projectId?: ProjectId;
  onParticipantAdd?: (participant: ScheduleParticipant) => void;
  onParticipantDelete?: (participantId: string) => void;
  onParticipantUpdate?: (participantId: string, updates: Partial<ScheduleParticipant>) => void;
}

/**
 * Factory selection for modals
 */
export interface FactorySelection {
  id: FactoryId;
  name: string;
  type: FactoryType;
  color?: string;
}

/**
 * Task creation data from modals
 */
export interface TaskCreationData {
  projectId?: ProjectId;
  factory: string; // Factory name
  factoryId: FactoryId;
  taskType: TaskType;
  startDate: string;
  endDate: string;
  assignee?: string;
  priority?: Priority;
}

/**
 * Schedule filters
 */
export interface ScheduleFilters {
  factoryTypes?: FactoryType[];
  taskStatuses?: TaskStatus[];
  dateRange?: {
    start: string;
    end: string;
  };
  assignees?: string[];
  search?: string;
}

/**
 * Schedule sort options
 */
export interface ScheduleSortOptions {
  field: 'name' | 'startDate' | 'endDate' | 'status' | 'priority';
  direction: SortDirection;
}

// Import missing types
import { TaskType, Priority, TaskStatus, SortDirection } from './enums';

/**
 * Drag and drop state for schedule
 */
export interface ScheduleDragState {
  isDragging: boolean;
  draggedItem: {
    type: DragItemType;
    id: string;
    data: Task | ScheduleParticipant;
  } | null;
  dropTarget: {
    participantId: string;
    date: string;
  } | null;
}

// Import DragItemType
import { DragItemType } from './enums';

/**
 * Schedule modal state
 */
export interface ScheduleModalState {
  showFactoryModal: boolean;
  showTaskModal: boolean;
  showTaskEditModal: boolean;
  showEmailModal: boolean;
  showWorkflowModal: boolean;
  showProductRequestModal: boolean;
  selectedTask: Task | null;
  selectedFactory: FactorySelection | null;
  selectedDate: string | null;
}

/**
 * Schedule grid cell
 */
export interface ScheduleGridCell {
  participantId: string;
  date: string;
  tasks: Task[];
  isToday: boolean;
  isWeekend: boolean;
  isHoliday?: boolean;
}

/**
 * Schedule date range
 */
export interface ScheduleDateRange {
  startDate: Date;
  endDate: Date;
  days: Date[];
  weeks: Date[][];
  months: Array<{
    name: string;
    year: number;
    days: number;
  }>;
}