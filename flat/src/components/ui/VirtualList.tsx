import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { cn } from '@/utils/cn';
import './VirtualList.css';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  className?: string;
}

function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 5,
  className = ''
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const scrollElementRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  }, []);

  const { visibleItems, totalHeight, offsetY } = useMemo(() => {
    const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
    const endIndex = Math.min(
      items.length - 1,
      Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
    );

    const visibleItems = items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }));

    return {
      visibleItems,
      totalHeight: items.length * itemHeight,
      offsetY: startIndex * itemHeight
    };
  }, [items, itemHeight, scrollTop, containerHeight, overscan]);

  return (
    <div
      ref={scrollElementRef}
      className={cn('virtual-list', className)}
      style={{ '--container-height': `${containerHeight}px` } as React.CSSProperties}
      onScroll={handleScroll}
    >
      <div className="virtual-list__content" style={{ '--total-height': `${totalHeight}px` } as React.CSSProperties}>
        <div className="virtual-list__items" style={{ '--offset-y': `${offsetY}px` } as React.CSSProperties}>
          {visibleItems.map(({ item, index }) => (
            <div key={index} className="virtual-list__item" style={{ '--item-height': `${itemHeight}px` } as React.CSSProperties}>
              {renderItem(item, index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default React.memo(VirtualList) as <T>(props: VirtualListProps<T>) => JSX.Element;