import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { useEditableCell } from '@/hooks/useEditableCell';
import type { Column } from '@/hooks/useColumnOrder';
import { useTaskManagement } from './useTaskManagement';
import { renderTableCell } from './renderers/cellRenderer';
import { RowLayout } from './components/RowLayout';
import { ExpandableRow } from './components/ExpandableRow';
import { MasterProjectRow } from './components/MasterProjectRow';
import { ProjectType } from '@/types/enums';

interface ProjectTableRowProps {
  project: Project;
  columns: Column[];
  index?: number;
  isSelected: boolean;
  onSelect: (checked: boolean) => void;
  onRowClick: (project: Project) => void;
  onUpdateField: (projectId: ProjectId, field: keyof Project, value: Project[keyof Project]) => void;
  onShowOptionsMenu: (projectId: ProjectId, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onMouseEnter?: () => void;
  isDragging?: boolean;
  onStartDrag?: (index: number) => void;
  onDragStart?: (e: React.DragEvent, projectId: ProjectId) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, project: Project) => void;
  onToggleMaster?: (projectId: ProjectId) => void;
}

const ProjectTableRow: React.FC<ProjectTableRowProps> = React.memo(({
  project,
  columns,
  index,
  isSelected,
  onSelect,
  onRowClick,
  onUpdateField,
  onShowOptionsMenu,
  onMouseEnter,
  isDragging,
  onStartDrag,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
  onToggleMaster
}) => {
  const editableCell = useEditableCell();
  const { isExpanded, tasks, handleToggleTasks, handleTaskToggle } = useTaskManagement({ project });
  const [isDragOver, setIsDragOver] = React.useState(false);
  
  const handleMasterToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onToggleMaster) {
      onToggleMaster(project.id);
    }
  };

  const handleRowClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const isInteractive = target.closest('button, input, select, a, .js-inline-edit');
    if (!isInteractive) {
      // Navigate to table view when row is clicked
      window.location.href = `/projects?view=table&projectId=${project.id}`;
    }
  };

  const renderCell = (columnId: string) => {
    const cellRenderProps = { 
      project, 
      editableCell, 
      onUpdateField,
      index,
      isDragging,
      onStartDrag,
      onToggleTasks: handleToggleTasks 
    };

    return renderTableCell(columnId, cellRenderProps);
  };

  const handleDragOverRow = (e: React.DragEvent) => {
    e.preventDefault();
    console.log(`[DragDrop Row] 📍 OVER: ${project.name} (${project.type})`);
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    console.log(`[DragDrop Row] 👋 LEAVE: ${project.name}`);
    setIsDragOver(false);
  };

  const handleDropRow = (e: React.DragEvent, targetProject: Project) => {
    e.preventDefault();
    console.log(`[DragDrop Row] 💧 DROP on: ${targetProject.name} (${targetProject.type})`);
    setIsDragOver(false);
    onDrop?.(e, targetProject);
  };

  // Render Master Project Row
  if (project.type === ProjectType.MASTER) {
    return (
      <>
        <MasterProjectRow
          project={project}
          columns={columns}
          isSelected={isSelected}
          isExpanded={!!isExpanded}
          onSelect={onSelect}
          onToggleMaster={handleMasterToggle}
          onShowOptionsMenu={onShowOptionsMenu}
          renderCell={renderCell}
          onDragOver={onDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDropRow}
        />
        {isExpanded && project.children && project.children.map((child) => (
          <ProjectTableRow
            key={child.id}
            project={child}
            columns={columns}
            isSelected={false}
            onSelect={() => {}}
            onRowClick={onRowClick}
            onUpdateField={onUpdateField}
            onShowOptionsMenu={onShowOptionsMenu}
            onToggleMaster={onToggleMaster}
          />
        ))}
      </>
    );
  }

  // Render regular row
  return (
    <>
      <RowLayout
        project={project}
        columns={columns}
        isSelected={isSelected}
        isExpanded={isExpanded}
        onSelect={onSelect}
        onShowOptionsMenu={onShowOptionsMenu}
        onRowClick={handleRowClick}
        renderCell={renderCell}
        isDragOver={isDragOver}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={handleDragOverRow}
        onDragLeave={handleDragLeave}
        onDrop={handleDropRow}
        handleToggleTasks={handleToggleTasks}
      />
      <ExpandableRow
        isExpanded={isExpanded}
        tasks={tasks}
        columns={columns}
        onTaskToggle={handleTaskToggle}
      />
    </>
  );
});

ProjectTableRow.displayName = 'ProjectTableRow';

export default ProjectTableRow;