import React from 'react';
import { ErrorBoundary, ScheduleErrorFallback } from '../ErrorBoundary';

interface ScheduleErrorBoundaryProps {
  children: React.ReactNode;
}

const ScheduleErrorBoundary: React.FC<ScheduleErrorBoundaryProps> = ({ children }) => {
  return (
    <ErrorBoundary fallback={ScheduleErrorFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default ScheduleErrorBoundary;