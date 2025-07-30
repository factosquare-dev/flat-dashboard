import React from 'react';
import { FactoryType, FactoryTypeLabel } from '../../types/enums';
import './FactoryTypeBadge.css';

interface FactoryTypeBadgeProps {
  type: FactoryType;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Factory Type Badge Component
 * 
 * Follows SOLID-FLAT principles:
 * - Single Responsibility: Only displays factory type badge
 * - Open/Closed: Extensible via props and CSS classes
 * - Dependency Inversion: Depends on FactoryType enum, not concrete strings
 */
const FactoryTypeBadge: React.FC<FactoryTypeBadgeProps> = ({
  type,
  showLabel = true,
  size = 'md',
  className = ''
}) => {
  const getTypeClass = (factoryType: FactoryType): string => {
    switch (factoryType) {
      case FactoryType.MANUFACTURING:
        return 'factory-type-manufacturing';
      case FactoryType.CONTAINER:
        return 'factory-type-container';
      case FactoryType.PACKAGING:
        return 'factory-type-packaging';
      default:
        return 'factory-type-default';
    }
  };

  const baseClasses = [
    'factory-type-badge',
    `factory-type-badge--${size}`,
    getTypeClass(type),
    className
  ].filter(Boolean).join(' ');

  return (
    <span className={baseClasses}>
      {showLabel ? `${FactoryTypeLabel[type]} 공장` : FactoryTypeLabel[type]}
    </span>
  );
};

export default FactoryTypeBadge;