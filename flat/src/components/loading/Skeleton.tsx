import React from 'react';
import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  animation?: 'pulse' | 'wave' | 'none';
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'text',
  width,
  height,
  animation = 'pulse',
}) => {
  const baseClasses = 'bg-gray-200';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };
  
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-md',
  };
  
  const style: React.CSSProperties = {
    width: width || (variant === 'circular' ? 40 : '100%'),
    height: height || (variant === 'text' ? 20 : variant === 'circular' ? 40 : 120),
  };
  
  return (
    <div
      className={cn(
        baseClasses,
        animationClasses[animation],
        variantClasses[variant],
        className
      )}
      style={style}
      aria-busy="true"
      aria-live="polite"
    />
  );
};

// Skeleton variants for common use cases
export const TextSkeleton: React.FC<{ lines?: number; className?: string }> = ({ 
  lines = 3, 
  className 
}) => (
  <div className={cn('space-y-2', className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        width={i === lines - 1 ? '60%' : '100%'}
        height={16}
      />
    ))}
  </div>
);

export const CardSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('p-4 border border-gray-200 rounded-lg', className)}>
    <div className="flex items-start space-x-4">
      <Skeleton variant="circular" width={48} height={48} />
      <div className="flex-1">
        <Skeleton width="40%" height={20} className="mb-2" />
        <Skeleton width="60%" height={16} />
      </div>
    </div>
    <div className="mt-4">
      <TextSkeleton lines={2} />
    </div>
  </div>
);

export const TableRowSkeleton: React.FC<{ columns?: number; className?: string }> = ({ 
  columns = 5, 
  className 
}) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton height={20} width={i === 0 ? '100%' : '80%'} />
      </td>
    ))}
  </tr>
);

export const ListItemSkeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn('flex items-center space-x-3 p-3', className)}>
    <Skeleton variant="circular" width={40} height={40} />
    <div className="flex-1">
      <Skeleton width="70%" height={18} className="mb-1" />
      <Skeleton width="40%" height={14} />
    </div>
  </div>
);