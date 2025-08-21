import { useState, useRef, useEffect, useCallback } from 'react';

interface UseDragSelectionOptions<T> {
  items: T[];
  selectedItems: string[];
  onSelectionChange: (selectedIds: string[]) => void;
  getItemId: (item: T) => string;
}

export function useDragSelection<T>({
  items,
  selectedItems,
  onSelectionChange,
  getItemId
}: UseDragSelectionOptions<T>) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartIndex, setDragStartIndex] = useState<number | null>(null);
  const [dragStartSelected, setDragStartSelected] = useState(false);
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleStartDrag = useCallback((index: number) => {
    const item = items[index];
    if (item) {
      const itemId = getItemId(item);
      const isCurrentlySelected = selectedItems.includes(itemId);
      setDragStartSelected(isCurrentlySelected);
      setIsDragging(true);
      setDragStartIndex(index);
    }
  }, [items, selectedItems, getItemId]);

  const handleMouseEnterItem = useCallback((index: number) => {
    if (isDragging && dragStartIndex !== null) {
      const start = Math.min(dragStartIndex, index);
      const end = Math.max(dragStartIndex, index);
      
      if (dragStartSelected) {
        // 체크된 상태에서 시작했으면 범위 내 모든 항목 체크 해제
        const newSelection = selectedItems.filter(id => {
          const itemIndex = items.findIndex(item => getItemId(item) === id);
          return itemIndex < start || itemIndex > end;
        });
        onSelectionChange(newSelection);
      } else {
        // 체크되지 않은 상태에서 시작했으면 범위 내 모든 항목 체크
        const newSelection = new Set(selectedItems);
        for (let i = start; i <= end; i++) {
          if (items[i]) {
            newSelection.add(getItemId(items[i]));
          }
        }
        onSelectionChange(Array.from(newSelection));
      }
    }
  }, [isDragging, dragStartIndex, dragStartSelected, items, selectedItems, getItemId, onSelectionChange]);

  const handleEndDrag = useCallback(() => {
    setIsDragging(false);
    setDragStartIndex(null);
    setDragStartSelected(false);
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  const handleSelectItem = useCallback((itemId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedItems, itemId]);
    } else {
      onSelectionChange(selectedItems.filter(id => id !== itemId));
    }
  }, [selectedItems, onSelectionChange]);

  // 자동 스크롤 기능 설정
  const setupAutoScroll = useCallback((container: HTMLElement | null) => {
    if (!isDragging || !container) {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const mouseY = e.clientY;
      const scrollThreshold = 80;
      const maxScrollSpeed = 20;

      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }

      if (mouseY < rect.top + scrollThreshold) {
        const distance = rect.top + scrollThreshold - mouseY;
        const scrollSpeed = Math.min(maxScrollSpeed, (distance / scrollThreshold) * maxScrollSpeed);
        
        autoScrollIntervalRef.current = setInterval(() => {
          if (container.scrollTop > 0) {
            container.scrollTop = Math.max(0, container.scrollTop - scrollSpeed);
          }
        }, 16);
      }
      else if (mouseY > rect.bottom - scrollThreshold) {
        const distance = mouseY - (rect.bottom - scrollThreshold);
        const scrollSpeed = Math.min(maxScrollSpeed, (distance / scrollThreshold) * maxScrollSpeed);
        
        autoScrollIntervalRef.current = setInterval(() => {
          const maxScroll = container.scrollHeight - container.clientHeight;
          if (container.scrollTop < maxScroll) {
            container.scrollTop = Math.min(maxScroll, container.scrollTop + scrollSpeed);
          }
        }, 16);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current);
        autoScrollIntervalRef.current = null;
      }
    };
  }, [isDragging]);

  return {
    isDragging,
    dragStartIndex,
    dragStartSelected,
    handleStartDrag,
    handleMouseEnterItem,
    handleEndDrag,
    handleSelectItem,
    setupAutoScroll
  };
}