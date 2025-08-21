import { useState, useCallback, useRef } from 'react';

interface DragItem {
  id: string | number;
  type: string;
  data?: any;
}

interface DropResult {
  item: DragItem;
  dropZoneId: string;
  position?: { x: number; y: number };
}

interface UseDragAndDropOptions {
  onDrop?: (result: DropResult) => void;
  onDragStart?: (item: DragItem) => void;
  onDragEnd?: () => void;
  canDrop?: (item: DragItem, dropZoneId: string) => boolean;
}

interface UseDragAndDropReturn {
  isDragging: boolean;
  draggedItem: DragItem | null;
  dragHandlers: {
    onDragStart: (e: React.DragEvent, item: DragItem) => void;
    onDragEnd: (e: React.DragEvent) => void;
  };
  dropHandlers: {
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, dropZoneId: string) => void;
  };
  dropZoneStates: Map<string, boolean>;
}

/**
 * Custom hook for drag and drop functionality
 */
export function useDragAndDrop(options: UseDragAndDropOptions = {}): UseDragAndDropReturn {
  const { onDrop, onDragStart, onDragEnd, canDrop } = options;
  
  const [isDragging, setIsDragging] = useState(false);
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null);
  const [dropZoneStates, setDropZoneStates] = useState<Map<string, boolean>>(new Map());
  
  const dragCounter = useRef<Map<string, number>>(new Map());

  const handleDragStart = useCallback((e: React.DragEvent, item: DragItem) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('application/json', JSON.stringify(item));
    
    setIsDragging(true);
    setDraggedItem(item);
    onDragStart?.(item);
    
    // Add dragging class to the element
    const element = e.currentTarget as HTMLElement;
    element.classList.add('dragging');
  }, [onDragStart]);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    setIsDragging(false);
    setDraggedItem(null);
    setDropZoneStates(new Map());
    dragCounter.current.clear();
    onDragEnd?.();
    
    // Remove dragging class
    const element = e.currentTarget as HTMLElement;
    element.classList.remove('dragging');
  }, [onDragEnd]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, dropZoneId: string) => {
    e.preventDefault();
    
    // Increment counter for this drop zone
    const currentCount = dragCounter.current.get(dropZoneId) || 0;
    dragCounter.current.set(dropZoneId, currentCount + 1);
    
    if (draggedItem && (!canDrop || canDrop(draggedItem, dropZoneId))) {
      setDropZoneStates(prev => new Map(prev).set(dropZoneId, true));
    }
  }, [draggedItem, canDrop]);

  const handleDragLeave = useCallback((e: React.DragEvent, dropZoneId: string) => {
    e.preventDefault();
    
    // Decrement counter for this drop zone
    const currentCount = dragCounter.current.get(dropZoneId) || 0;
    const newCount = Math.max(0, currentCount - 1);
    dragCounter.current.set(dropZoneId, newCount);
    
    // Only remove highlight if counter reaches 0
    if (newCount === 0) {
      setDropZoneStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(dropZoneId);
        return newMap;
      });
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, dropZoneId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const itemData = e.dataTransfer.getData('application/json');
    if (!itemData) return;
    
    try {
      const item = JSON.parse(itemData) as DragItem;
      
      if (!canDrop || canDrop(item, dropZoneId)) {
        const dropResult: DropResult = {
          item,
          dropZoneId,
          position: {
            x: e.clientX,
            y: e.clientY
          }
        };
        
        onDrop?.(dropResult);
      }
    } catch (error) {
      console.error('Error parsing drag data:', error);
    } finally {
      // Reset counter for this drop zone
      dragCounter.current.delete(dropZoneId);
      setDropZoneStates(prev => {
        const newMap = new Map(prev);
        newMap.delete(dropZoneId);
        return newMap;
      });
    }
  }, [canDrop, onDrop]);

  return {
    isDragging,
    draggedItem,
    dragHandlers: {
      onDragStart: handleDragStart,
      onDragEnd: handleDragEnd
    },
    dropHandlers: {
      onDragOver: handleDragOver,
      onDragEnter: (e) => handleDragEnter(e, 'default'),
      onDragLeave: (e) => handleDragLeave(e, 'default'),
      onDrop: (e, dropZoneId) => handleDrop(e, dropZoneId)
    },
    dropZoneStates
  };
}

/**
 * Hook for creating a draggable element
 */
export function useDraggable(item: DragItem, options?: UseDragAndDropOptions) {
  const { dragHandlers } = useDragAndDrop(options);
  
  return {
    draggable: true,
    onDragStart: (e: React.DragEvent) => dragHandlers.onDragStart(e, item),
    onDragEnd: dragHandlers.onDragEnd
  };
}

/**
 * Hook for creating a drop zone
 */
export function useDropZone(dropZoneId: string, options?: UseDragAndDropOptions) {
  const { dropHandlers, dropZoneStates } = useDragAndDrop(options);
  const isOver = dropZoneStates.get(dropZoneId) || false;
  
  return {
    isOver,
    onDragOver: dropHandlers.onDragOver,
    onDragEnter: (e: React.DragEvent) => dropHandlers.onDragEnter(e),
    onDragLeave: (e: React.DragEvent) => dropHandlers.onDragLeave(e),
    onDrop: (e: React.DragEvent) => dropHandlers.onDrop(e, dropZoneId)
  };
}