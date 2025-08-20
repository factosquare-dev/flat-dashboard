import React from 'react';
import { cn } from '@/utils/cn';
import './Skeleton.css';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = React.memo(({
  className = '',
  variant = 'text',
  width,
  height,
  animation = 'pulse',
  count = 1,
}) => {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={cn(
            'skeleton',
            `skeleton--${variant}`,
            animation !== 'none' && `skeleton--${animation}`,
            className
          )}
          style={style}
          aria-hidden="true"
        />
      ))}
    </>
  );
});

Skeleton.displayName = 'Skeleton';

// Specialized skeleton components
export const SkeletonText: React.FC<{ lines?: number; className?: string }> = React.memo(({ 
  lines = 3, 
  className = '' 
}) => {
  return (
    <div className={cn('skeleton-text', className)}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          variant="text"
          width={index === lines - 1 ? '80%' : '100%'}
        />
      ))}
    </div>
  );
});

SkeletonText.displayName = 'SkeletonText';

export const SkeletonCard: React.FC<{ className?: string }> = React.memo(({ className = '' }) => {
  return (
    <div className={cn('skeleton-card', className)}>
      <Skeleton variant="rectangular" height={200} className="skeleton-card__image" />
      <Skeleton variant="text" className="skeleton-card__title" />
      <Skeleton variant="text" width="60%" />
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

export const SkeletonTable: React.FC<{ rows?: number; columns?: number; className?: string }> = React.memo(({ 
  rows = 5, 
  columns = 4,
  className = '' 
}) => {
  return (
    <div className={cn('skeleton-table', className)}>
      {/* Header */}
      <div className="skeleton-table__header">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" className="skeleton-table__cell" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table__row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="skeleton-table__cell" />
          ))}
        </div>
      ))}
    </div>
  );
});

SkeletonTable.displayName = 'SkeletonTable';