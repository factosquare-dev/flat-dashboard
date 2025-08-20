import type { Participant, Task } from '@/shared/types/schedule';
import type { Factory } from '@/shared/types/factory';
import type { ProjectId, FactoryId } from '@/shared/types/branded';

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
export { ViewMode } from '@/shared/types/enums';