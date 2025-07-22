import React from 'react';

interface InfiniteScrollTriggerProps {
  hasMore: boolean;
  isLoading: boolean;
  loadMoreRef: React.RefObject<HTMLDivElement>;
  endMessage?: string;
}

const InfiniteScrollTrigger: React.FC<InfiniteScrollTriggerProps> = ({ 
  hasMore, 
  isLoading, 
  loadMoreRef,
  endMessage = 'No more projects to load'
}) => {
  if (hasMore && !isLoading) {
    return <div ref={loadMoreRef} className="h-4" />;
  }
  
  if (!hasMore) {
    return (
      <div className="text-center py-8 text-gray-500">
        {endMessage}
      </div>
    );
  }
  
  return null;
};

export default InfiniteScrollTrigger;