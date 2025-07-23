import { GridCoordinateCalculator, calculateTaskDuration, calculateEndDate } from '../../utils/dragCalculations';
import type { ModalState } from '../../../../types/schedule';
import type { DragState } from './types';

export const createGlobalDragOverHandler = (
  scrollRef: React.RefObject<HTMLDivElement>,
  modalState: ModalState,
  dragStateRef: React.MutableRefObject<DragState | null>,
  days: Date[],
  cellWidth: number,
  handleAutoScroll: (mouseX: number, containerWidth: number) => void,
  updateTooltip: (x: number, y: number, startDate: Date, endDate: Date) => void,
  findProjectFromEvent: (e: { clientX: number; clientY: number; target: any }) => string | null,
  updatePreview: (projectId: string | null, startDate: Date, endDate: Date, factory: string) => void
) => {
  return (e: DragEvent) => {
    // CRITICAL: Skip if resizing to prevent conflicts
    if (modalState.isResizingTask) {
      console.log('[DRAG] Skipping dragover - resize in progress');
      return;
    }
    
    if (scrollRef.current && modalState.isDraggingTask && modalState.draggedTask && dragStateRef.current) {
      e.preventDefault();
      e.dataTransfer!.dropEffect = 'move';
      
      const rect = scrollRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollRef.current.scrollLeft - dragStateRef.current.offsetX;
      const mouseX = e.clientX - rect.left;
      
      console.log('[DRAG OVER] Global drag over:', {
        clientX: e.clientX,
        mouseX,
        x,
        hasScrollRef: !!scrollRef.current,
        isDraggingTask: modalState.isDraggingTask,
        hasDraggedTask: !!modalState.draggedTask,
        hasDragState: !!dragStateRef.current
      });
      
      // Handle auto-scroll
      handleAutoScroll(mouseX, rect.width);
      
      // Calculate dates using unified coordinate calculator
      const calculator = new GridCoordinateCalculator({
        days,
        cellWidth,
        scrollLeft: scrollRef.current.scrollLeft,
        containerRect: rect
      });
      
      const startDate = calculator.mouseXToDate(e.clientX, true);
      const taskDuration = calculateTaskDuration(modalState.draggedTask.startDate, modalState.draggedTask.endDate);
      const endDate = calculateEndDate(startDate, taskDuration);
      
      // Update tooltip
      updateTooltip(e.clientX, e.clientY, startDate, endDate);
      
      // Update preview
      const dragEvent = { clientX: e.clientX, clientY: e.clientY, target: e.target } as React.DragEvent;
      const projectId = findProjectFromEvent(dragEvent);
      
      updatePreview(projectId, startDate, endDate, modalState.draggedTask.factory);
    }
  };
};