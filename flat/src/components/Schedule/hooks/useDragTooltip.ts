import { useState } from 'react';
import type { DragTooltip } from '../../../types/schedule';

export const useDragTooltip = () => {
  const [dragTooltip, setDragTooltip] = useState<DragTooltip | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ko-KR', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const updateTooltip = (x: number, y: number, startDate: Date, endDate: Date) => {
    const taskDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    setDragTooltip({
      x,
      y,
      date: `${formatDate(startDate)} ~ ${formatDate(endDate)} (${taskDuration + 1}일)`
    });
  };

  const clearTooltip = () => {
    setDragTooltip(null);
  };

  return {
    dragTooltip,
    updateTooltip,
    clearTooltip
  };
};