import type { Project } from '@/shared/types/project';
import type { ProjectId } from '@/shared/types/branded';

export interface DraggableProjectTableProps {
  projects: Project[];
  selectedRows: string[];
  sortField: keyof Project | null;
  sortDirection: 'asc' | 'desc';
  hiddenColumns?: Set<string>;
  onSort: (field: keyof Project) => void;
  onSelectAll: (checked: boolean) => void;
  onSelectRow: (projectId: string, checked: boolean, index?: number) => void;
  onSelectProject: (project: Project) => void;
  onUpdateProject: <K extends keyof Project>(projectId: ProjectId, field: K, value: Project[K]) => void;
  onShowOptionsMenu: (projectId: ProjectId, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onMouseEnterRow?: (index: number) => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
  onDragStart?: (projectId: string) => void;
  onDragEnd?: () => void;
  onToggleMaster?: (projectId: string) => void;
}

export interface DragHandlers {
  draggedProjectId: string | null;
  handleProjectDragStart: (e: React.DragEvent, projectId: string) => void;
  handleProjectDragEnd: (e: React.DragEvent) => void;
  handleProjectDragOver: (e: React.DragEvent) => void;
  handleProjectDragLeave: (e: React.DragEvent) => void;
  handleProjectDrop: (e: React.DragEvent, targetProject?: Project) => void;
}

export interface MemoHandlers {
  editingMemoId: string | null;
  editingMemoName: string;
  handleStartEditMemo: (columnId: string, columnLabel: string) => void;
  handleSaveMemoName: (columnId: string) => void;
  handleCancelEditMemo: () => void;
  handleAddMemoColumn: () => void;
  handleRemoveMemoColumn: (columnId: string) => void;
  setEditingMemoName: (name: string) => void;
}