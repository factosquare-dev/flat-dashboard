import React, { useRef, useState, useEffect, useCallback, CSSProperties } from 'react';

interface VirtualListProps<T> {
  items: T[];
  itemHeight: number | ((index: number) => number);
  containerHeight: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  overscan?: number;
  onScroll?: (scrollTop: number) => void;
  className?: string;
  style?: CSSProperties;
}

/**
 * Virtual list component for rendering large lists efficiently
 */
export function VirtualList<T>({
  items,
  itemHeight,
  containerHeight,
  renderItem,
  overscan = 3,
  onScroll,
  className,
  style
}: VirtualListProps<T>) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const getItemHeight = useCallback(
    (index: number) => {
      return typeof itemHeight === 'function' ? itemHeight(index) : itemHeight;
    },
    [itemHeight]
  );

  const getTotalHeight = useCallback(() => {
    if (typeof itemHeight === 'number') {
      return items.length * itemHeight;
    }
    return items.reduce((total, _, index) => total + getItemHeight(index), 0);
  }, [items, itemHeight, getItemHeight]);

  const getItemOffset = useCallback(
    (index: number) => {
      if (typeof itemHeight === 'number') {
        return index * itemHeight;
      }
      let offset = 0;
      for (let i = 0; i < index; i++) {
        offset += getItemHeight(i);
      }
      return offset;
    },
    [itemHeight, getItemHeight]
  );

  const getVisibleRange = useCallback(() => {
    const startIndex = Math.max(
      0,
      items.findIndex((_, index) => getItemOffset(index) + getItemHeight(index) > scrollTop) - overscan
    );

    let endIndex = startIndex;
    let accumulatedHeight = 0;

    while (endIndex < items.length && accumulatedHeight < containerHeight + scrollTop) {
      accumulatedHeight = getItemOffset(endIndex) + getItemHeight(endIndex) - getItemOffset(startIndex);
      endIndex++;
    }

    return {
      startIndex: Math.max(0, startIndex),
      endIndex: Math.min(items.length, endIndex + overscan)
    };
  }, [items, scrollTop, containerHeight, overscan, getItemOffset, getItemHeight]);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const newScrollTop = e.currentTarget.scrollTop;
      setScrollTop(newScrollTop);
      onScroll?.(newScrollTop);
    },
    [onScroll]
  );

  const { startIndex, endIndex } = getVisibleRange();
  const visibleItems = items.slice(startIndex, endIndex);
  const offsetY = getItemOffset(startIndex);

  return (
    <div
      ref={scrollContainerRef}
      className={className}
      style={{
        height: containerHeight,
        overflow: 'auto',
        position: 'relative',
        ...style
      }}
      onScroll={handleScroll}
    >
      <div
        style={{
          height: getTotalHeight(),
          position: 'relative'
        }}
      >
        <div
          style={{
            transform: `translateY(${offsetY}px)`,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0
          }}
        >
          {visibleItems.map((item, index) => {
            const actualIndex = startIndex + index;
            return (
              <div
                key={actualIndex}
                style={{
                  height: getItemHeight(actualIndex)
                }}
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

/**
 * Hook for virtual scrolling in existing components
 */
export function useVirtualScroll<T>({
  items,
  itemHeight,
  containerHeight,
  overscan = 3
}: {
  items: T[];
  itemHeight: number;
  containerHeight: number;
  overscan?: number;
}) {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    items.length,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = items.slice(startIndex, endIndex);
  const totalHeight = items.length * itemHeight;
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    totalHeight,
    offsetY,
    startIndex,
    endIndex,
    handleScroll: (e: React.UIEvent<HTMLElement>) => {
      setScrollTop(e.currentTarget.scrollTop);
    }
  };
}

/**
 * Intersection Observer based lazy loading component
 */
interface LazyLoadProps {
  children: React.ReactNode;
  placeholder?: React.ReactNode;
  rootMargin?: string;
  threshold?: number | number[];
  onVisible?: () => void;
}

export function LazyLoad({
  children,
  placeholder = <div style={{ height: 100 }} />,
  rootMargin = '100px',
  threshold = 0,
  onVisible
}: LazyLoadProps) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || isVisible) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
        }
      },
      { rootMargin, threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isVisible, rootMargin, threshold, onVisible]);

  return (
    <div ref={elementRef}>
      {isVisible ? children : placeholder}
    </div>
  );
}