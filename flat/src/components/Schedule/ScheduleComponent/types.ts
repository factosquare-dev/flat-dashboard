import type { Participant, Task } from '../../../types/schedule';
import type { Factory } from '../../../types/factory';
import type { ProjectId, FactoryId } from '../../../types/branded';

export interface ScheduleProps {
  participants: Factory[];  // Should be Factory[] not Participant[]
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

// Re-export ViewMode type from enums
export { ViewMode } from '../../../types/enums';