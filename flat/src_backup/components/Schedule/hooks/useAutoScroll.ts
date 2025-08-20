import { useEffect, useRef } from 'react';

interface UseAutoScrollOptions {
  scrollZone?: number;
  scrollSpeed?: number;
}

export const useAutoScroll = (
  scrollRef: React.RefObject<HTMLDivElement>,
  isDragging: boolean,
  options: UseAutoScrollOptions = {}
) => {
  const { scrollZone = 100, scrollSpeed = 10 } = options;
  const scrollInterval = useRef<NodeJS.Timeout | null>(null);

  const handleAutoScroll = (mouseX: number, containerWidth: number) => {
    // Clear existing interval
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }

    // Check if we need to scroll
    if (mouseX < scrollZone) {
      // Scroll left
      scrollInterval.current = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = Math.max(0, scrollRef.current.scrollLeft - scrollSpeed);
        }
      }, 16); // ~60fps
    } else if (mouseX > containerWidth - scrollZone) {
      // Scroll right
      scrollInterval.current = setInterval(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollLeft = Math.min(
            scrollRef.current.scrollWidth - containerWidth,
            scrollRef.current.scrollLeft + scrollSpeed
          );
        }
      }, 16);
    }
  };

  const stopAutoScroll = () => {
    if (scrollInterval.current) {
      clearInterval(scrollInterval.current);
      scrollInterval.current = null;
    }
  };

  useEffect(() => {
    return () => {
      stopAutoScroll();
    };
  }, []);

  return { handleAutoScroll, stopAutoScroll };
};