import type { Participant, Task } from '../../../types/schedule';
import type { ProjectId, FactoryId } from '../../../types/branded';

export interface ScheduleProps {
  participants: Participant[];
  tasks?: Task[];
  startDate: string;
  endDate: string;
  projectName?: string;
  projectId?: ProjectId;
  className?: string;
  onBack?: () => void;
  isLoading?: boolean;
}

export interface TaskData {
  projectId?: ProjectId;
  factory: string;
  factoryId?: FactoryId;
  taskType?: string;
  startDate: string;
  endDate: string;
}

export type ViewMode = 'gantt' | 'table';