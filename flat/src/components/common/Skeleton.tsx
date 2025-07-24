import React from 'react';

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
  const baseClasses = 'bg-gray-200';
  
  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: '',
  };

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-md',
  };

  const defaultHeights = {
    text: 'h-4',
    circular: 'h-12 w-12',
    rectangular: 'h-20',
  };

  const skeletonClass = `
    ${baseClasses}
    ${animationClasses[animation]}
    ${variantClasses[variant]}
    ${!height && defaultHeights[variant]}
    ${className}
  `.trim();

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === 'number' ? `${width}px` : width;
  if (height) style.height = typeof height === 'number' ? `${height}px` : height;

  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className={skeletonClass}
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
    <div className={`space-y-2 ${className}`}>
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
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <Skeleton variant="rectangular" height={200} className="mb-4" />
      <Skeleton variant="text" className="mb-2" />
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
    <div className={`w-full ${className}`}>
      {/* Header */}
      <div className="flex gap-4 p-4 border-b border-gray-200">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} variant="text" className="flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4 p-4 border-b border-gray-100">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} variant="text" className="flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
});

SkeletonTable.displayName = 'SkeletonTable';