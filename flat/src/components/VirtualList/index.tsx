/**
 * Virtual scrolling list component for performance optimization
 */

import React, { useMemo, useCallback, useRef, useEffect, useState } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
  onScroll?: (scrollTop: number) => void;
  keyExtractor?: (item: T, index: number) => string | number;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = '',
  onScroll,
  keyExtractor = (_, index) => index,
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  // Calculate visible range
  const visibleRange = useMemo(() => {
    const visibleStart = Math.floor(scrollTop / itemHeight);
    const visibleEnd = Math.min(
      visibleStart + Math.ceil(containerHeight / itemHeight),
      items.length - 1
    );

    const startIndex = Math.max(0, visibleStart - overscan);
    const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

    return { startIndex, endIndex };
  }, [scrollTop, itemHeight, containerHeight, items.length, overscan]);

  // Calculate total height
  const totalHeight = useMemo(() => items.length * itemHeight, [items.length, itemHeight]);

  // Calculate offset for visible items
  const offsetY = useMemo(() => visibleRange.startIndex * itemHeight, [visibleRange.startIndex, itemHeight]);

  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(visibleRange.startIndex, visibleRange.endIndex + 1);
  }, [items, visibleRange.startIndex, visibleRange.endIndex]);

  // Handle scroll
  const handleScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = event.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);

  // Scroll to specific item
  const scrollToItem = useCallback((index: number) => {
    if (scrollElementRef.current) {
      const targetScrollTop = index * itemHeight;
      scrollElementRef.current.scrollTop = targetScrollTop;
      setScrollTop(targetScrollTop);
    }
  }, [itemHeight]);

  // Expose scroll methods via imperative handle
  React.useImperativeHandle(scrollElementRef, () => ({
    scrollToItem,
    scrollToTop: () => scrollToItem(0),
    scrollToBottom: () => scrollToItem(items.length - 1),
  }));

  return (
    <div
      ref={scrollElementRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            width: '100%',
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = visibleRange.startIndex + index;
            const key = keyExtractor(item, actualIndex);
            
            return (
              <div
                key={key}
                style={{ height: itemHeight }}
                className="virtual-list-item"
              >
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Memoized version for performance
export default React.memo(VirtualList) as <T>(
  props: VirtualListProps<T> & { ref?: React.Ref<any> }
) => React.ReactElement;

/**
 * Hook for virtual list with automatic height calculation
 */
export function useVirtualList<T>(
  items: T[],
  estimatedItemHeight: number = 50,
  containerRef: React.RefObject<HTMLElement>
) {
  const [containerHeight, setContainerHeight] = useState(400);
  const [itemHeight, setItemHeight] = useState(estimatedItemHeight);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setContainerHeight(containerRef.current.clientHeight);
      }
    };

    updateDimensions();
    
    const resizeObserver = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [containerRef]);

  const scrollToItem = useCallback((index: number) => {
    // This would be implemented by the VirtualList component
  }, []);

  return {
    containerHeight,
    itemHeight,
    scrollToItem,
    setItemHeight,
  };
}