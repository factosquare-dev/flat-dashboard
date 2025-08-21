/**
 * GanttChart component type definitions
 */

export interface Task {
  id: string | number;
  title: string;
  projectId: string;
  startDate: string;
  endDate: string;
  color: string;
}

export interface Project {
  id: string;
  name: string;
  tasks: Task[];
  color: string;
  expanded?: boolean;
}

export interface DragState {
  isDragging: boolean;
  draggedTask: Task | null;
  ghostPosition: { x: number; y: number } | null;
  hoveredCell: { row: number; col: number } | null;
  mouseOffset: { x: number; y: number };
}

export interface GridCell {
  row: number;
  col: number;
}

export interface GanttConstants {
  CELL_WIDTH: number;
  CELL_HEIGHT: number;
  HEADER_HEIGHT: number;
  SIDEBAR_WIDTH: number;
}