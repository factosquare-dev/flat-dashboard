import React from 'react';
import { 
  ProjectStatus, 
  ProjectStatusLabel,
  TaskStatus,
  TaskStatusLabel,
  Priority,
  PriorityLabel
} from '@/shared/types/enums';
import './StatusBadge.css';

interface StatusBadgeProps {
  status: ProjectStatus | TaskStatus | Priority;
  type: 'project' | 'task' | 'priority';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Status Badge Component
 * 
 * Follows SOLID-FLAT principles:
 * - Single Responsibility: Only displays status badge
 * - Open/Closed: Extensible via props and CSS classes
 * - Dependency Inversion: Depends on enums, not concrete strings
 * 
 * The Rule of Three: This pattern was repeated 3+ times across the codebase
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  type,
  size = 'md',
  className = ''
}) => {
  const getStatusClass = (): string => {
    if (type === 'project') {
      switch (status as ProjectStatus) {
        case ProjectStatus.PLANNING:
          return 'status-badge-planning';
        case ProjectStatus.IN_PROGRESS:
          return 'status-badge-in-progress';
        case ProjectStatus.ON_HOLD:
          return 'status-badge-on-hold';
        case ProjectStatus.COMPLETED:
          return 'status-badge-completed';
        case ProjectStatus.CANCELLED:
          return 'status-badge-cancelled';
        default:
          return 'status-badge-default';
      }
    } else if (type === 'task') {
      switch (status as TaskStatus) {
        case TaskStatus.PENDING:
          return 'status-badge-pending';
        case TaskStatus.IN_PROGRESS:
          return 'status-badge-in-progress';
        case TaskStatus.COMPLETED:
          return 'status-badge-completed';
        case TaskStatus.DELAYED:
          return 'status-badge-delayed';
        case TaskStatus.CANCELLED:
          return 'status-badge-cancelled';
        default:
          return 'status-badge-default';
      }
    } else {
      switch (status as Priority) {
        case Priority.HIGH:
          return 'status-badge-high-priority';
        case Priority.MEDIUM:
          return 'status-badge-medium-priority';
        case Priority.LOW:
          return 'status-badge-low-priority';
        default:
          return 'status-badge-default';
      }
    }
  };

  const getLabel = (): string => {
    if (type === 'project') {
      return ProjectStatusLabel[status as ProjectStatus] || status;
    } else if (type === 'task') {
      return TaskStatusLabel[status as TaskStatus] || status;
    } else {
      return PriorityLabel[status as Priority] || status;
    }
  };

  const baseClasses = [
    'status-badge',
    `status-badge--${size}`,
    getStatusClass(),
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={baseClasses}>
      {getLabel()}
    </span>
  );
};

export default StatusBadge;