import { useEffect, useRef } from 'react';

interface UseInfiniteScrollProps {
  hasMore: boolean;
  isLoading: boolean;
  onLoadMore: () => void;
  threshold?: number;
  rootElement?: HTMLElement | null;
}

export const useInfiniteScroll = ({
  hasMore,
  isLoading,
  onLoadMore,
  threshold = 200,
  rootElement = null
}: UseInfiniteScrollProps) => {
  const observerRef = useRef<HTMLDivElement | null>(null);
  const observer = useRef<IntersectionObserver | null>(null);
  const callbackRef = useRef<() => void>();

  // Store the latest callback
  callbackRef.current = () => {
    if (hasMore && !isLoading) {
      onLoadMore();
    }
  };

  useEffect(() => {
    const handleObserver = (entries: IntersectionObserverEntry[]) => {
      const target = entries[0];
      if (target.isIntersecting && callbackRef.current) {
        callbackRef.current();
      }
    };

    if (observer.current) {
      observer.current.disconnect();
    }

    if (observerRef.current) {
      observer.current = new IntersectionObserver(handleObserver, {
        root: rootElement,
        rootMargin: `${threshold}px`,
        threshold: 0.1,
      });

      observer.current.observe(observerRef.current);
    }

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
    // Note: hasMore, isLoading, onLoadMore are not in deps because they are accessed via callbackRef
    // This prevents unnecessary observer recreations while still accessing latest values
  }, [threshold, rootElement]);

  return { observerRef };
};