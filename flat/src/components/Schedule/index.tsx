import React from 'react';
import ScheduleComponent from './Schedule';
import ScheduleErrorBoundary from './ScheduleErrorBoundary';
import type { Participant, Task } from '../../types/schedule';

interface ScheduleProps {
  participants: Participant[];
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