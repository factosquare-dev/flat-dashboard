import type { Task, ModalState, Participant, TaskControls } from '../../../../types/schedule';

export type DragState = {
  offsetX: number;
  taskWidth: number;
};

export interface UseTaskDragProps {
  projects: Participant[];
  days: Date[];
  cellWidth: number;
  scrollRef: React.RefObject<HTMLDivElement>;
  taskControls: TaskControls;
  setModalState: React.Dispatch<React.SetStateAction<ModalState>>;
  modalState: ModalState;
}

export interface UseTaskDragReturn {
  dragTooltip: any;
  dragPreview: any;
  handleTaskDragStart: (e: React.DragEvent, task: Task, index: number) => void;
  handleTaskDragEnd: () => void;
  handleTaskDragOver: (e: React.DragEvent, modalState: ModalState) => void;
  handleTaskDrop: (e: React.DragEvent, targetProjectId: string, modalState: ModalState) => void;
}