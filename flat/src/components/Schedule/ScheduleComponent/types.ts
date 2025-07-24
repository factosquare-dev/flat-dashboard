import type { Participant, Task } from '../../../types/schedule';

export interface ScheduleProps {
  participants: Participant[];
  tasks?: Task[];
  startDate: string;
  endDate: string;
  projectName?: string;
  projectId?: string;
  className?: string;
  onBack?: () => void;
  isLoading?: boolean;
}

export interface TaskData {
  projectId?: string;
  factory: string;
  factoryId?: string;
  taskType?: string;
  startDate: string;
  endDate: string;
}

export type ViewMode = 'gantt' | 'table';