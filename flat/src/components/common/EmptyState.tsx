import React from 'react';
import { ComponentSize } from '@/types/enums';
import './EmptyState.css';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: EmptyStateAction;
  secondaryAction?: EmptyStateAction;
  size?: ComponentSize;
  className?: string;
}

/**
 * Empty State Component
 * 
 * Follows SOLID-FLAT principles:
 * - Single Responsibility: Only displays empty state
 * - Open/Closed: Extensible via props
 * - Interface Segregation: Optional props for flexibility
 */
const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  secondaryAction,
  size = ComponentSize.MD,
  className = ''
}) => {
  const containerClasses = [
    'empty-state',
    `empty-state--${size.toLowerCase()}`,
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {icon && (
        <div className="empty-state__icon">
          {icon}
        </div>
      )}
      
      <div className="empty-state__content">
        <h3 className="empty-state__title">{title}</h3>
        
        {description && (
          <p className="empty-state__description">{description}</p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="empty-state__actions">
          {action && (
            <button
              onClick={action.onClick}
              className={`empty-state__action empty-state__action--${action.variant || 'primary'}`}
            >
              {action.label}
            </button>
          )}
          
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className={`empty-state__action empty-state__action--${secondaryAction.variant || 'secondary'}`}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmptyState;