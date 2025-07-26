import React from 'react';
import ScheduleComponent from './Schedule';
import ScheduleErrorBoundary from './ScheduleErrorBoundary';
import type { Factory, Task } from '../../types/schedule';

interface ScheduleProps {
  participants: Factory[];
  tasks: Task[];
  startDate: string;
  endDate: string;
  projectName?: string;
  projectId?: string;
  onBack?: () => void;
  isLoading?: boolean;
}

const Schedule: React.FC<ScheduleProps> = (props) => {
  return (
    <ScheduleErrorBoundary>
      <ScheduleComponent {...props} />
    </ScheduleErrorBoundary>
  );
};

export default Schedule;