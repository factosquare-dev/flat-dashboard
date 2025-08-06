import React from 'react';

interface InfiniteScrollTriggerProps {
  hasMore: boolean;
  isLoading: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  endMessage?: string;
  totalItems?: number;
}

const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({ 
  hasMore, 
  isLoading, 
  loadMoreRef,
  endMessage = 'No more projects to load',
  totalItems = 0
}) => {
  if (hasMore && !isLoading) {
    return <div ref={loadMoreRef} className="h-4" />;
  }
  
  // Only show "no more" message if we have items and reached the end
  if (!hasMore && totalItems > 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        {endMessage}
      </div>
    );
  }
  
  return null;
};

export default InfiniteScrollTrigger;