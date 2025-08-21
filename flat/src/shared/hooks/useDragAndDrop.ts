import { useState, useCallback, useRef } from 'react';

interface DragState<T> {
  isDragging: boolean;
  draggedItem: T | null;
  draggedOverItem: T | null;
  draggedIndex: number | null;
  draggedOverIndex: number | null;
}

interface UseDragAndDropOptions<T> {
  onDrop?: (draggedItem: T, targetItem: T | null, draggedIndex: number, targetIndex: number) => void;
  onDragStart?: (item: T, index: number) => void;
  onDragEnd?: () => void;
  canDrag?: (item: T) => boolean;
  canDrop?: (draggedItem: T, targetItem: T | null) => boolean;
}

interface UseDragAndDropReturn<T> {
  dragState: DragState<T>;
  handleDragStart: (e: React.DragEvent, item: T, index: number) => void;
  handleDragEnd: (e: React.DragEvent) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDragEnter: (e: React.DragEvent, item: T | null, index: number) => void;
  handleDragLeave: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetItem: T | null, targetIndex: number) => void;
  isDraggingItem: (item: T) => boolean;
  isDraggedOverItem: (item: T) => boolean;
  reset: () => void;
}

/**
 * Custom hook for drag and drop functionality
 * @param options - Drag and drop options
 * @returns Drag state and event handlers
 */
export function useDragAndDrop<T extends { id: string | number }>(
  options: UseDragAndDropOptions<T> = {}
): UseDragAndDropReturn<T> {
  const {
    onDrop,
    onDragStart,
    onDragEnd,
    canDrag = () => true,
    canDrop = () => true,
  } = options;

  const [dragState, setDragState] = useState<DragState<T>>({
    isDragging: false,
    draggedItem: null,
    draggedOverItem: null,
    draggedIndex: null,
    draggedOverIndex: null,
  });

  const dragCounter = useRef(0);

  const handleDragStart = useCallback(
    (e: React.DragEvent, item: T, index: number) => {
      if (!canDrag(item)) {
        e.preventDefault();
        return;
      }

      // Set drag data
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', JSON.stringify(item));

      // Update state
      setDragState({
        isDragging: true,
        draggedItem: item,
        draggedOverItem: null,
        draggedIndex: index,
        draggedOverIndex: null,
      });

      // Call handler
      onDragStart?.(item, index);
    },
    [canDrag, onDragStart]
  );

  const handleDragEnd = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      
      // Reset counter
      dragCounter.current = 0;

      // Reset state
      setDragState({
        isDragging: false,
        draggedItem: null,
        draggedOverItem: null,
        draggedIndex: null,
        draggedOverIndex: null,
      });

      // Call handler
      onDragEnd?.();
    },
    [onDragEnd]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback(
    (e: React.DragEvent, item: T | null, index: number) => {
      e.preventDefault();
      
      dragCounter.current++;

      if (dragState.draggedItem && canDrop(dragState.draggedItem, item)) {
        setDragState(prev => ({
          ...prev,
          draggedOverItem: item,
          draggedOverIndex: index,
        }));
      }
    },
    [dragState.draggedItem, canDrop]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    dragCounter.current--;

    if (dragCounter.current === 0) {
      setDragState(prev => ({
        ...prev,
        draggedOverItem: null,
        draggedOverIndex: null,
      }));
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetItem: T | null, targetIndex: number) => {
      e.preventDefault();
      e.stopPropagation();

      // Reset counter
      dragCounter.current = 0;

      const { draggedItem, draggedIndex } = dragState;

      if (draggedItem && draggedIndex !== null) {
        if (canDrop(draggedItem, targetItem)) {
          onDrop?.(draggedItem, targetItem, draggedIndex, targetIndex);
        }
      }

      // Reset state
      setDragState({
        isDragging: false,
        draggedItem: null,
        draggedOverItem: null,
        draggedIndex: null,
        draggedOverIndex: null,
      });
    },
    [dragState, canDrop, onDrop]
  );

  const isDraggingItem = useCallback(
    (item: T) => {
      return dragState.draggedItem?.id === item.id;
    },
    [dragState.draggedItem]
  );

  const isDraggedOverItem = useCallback(
    (item: T) => {
      return dragState.draggedOverItem?.id === item.id;
    },
    [dragState.draggedOverItem]
  );

  const reset = useCallback(() => {
    dragCounter.current = 0;
    setDragState({
      isDragging: false,
      draggedItem: null,
      draggedOverItem: null,
      draggedIndex: null,
      draggedOverIndex: null,
    });
  }, []);

  return {
    dragState,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    isDraggingItem,
    isDraggedOverItem,
    reset,
  };
}