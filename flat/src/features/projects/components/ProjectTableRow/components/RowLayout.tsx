/**
 * Project table row layout component
 */

import React from 'react';
import type { Project } from '@/types/project';
import type { ProjectId } from '@/types/branded';
import { MoreVertical } from 'lucide-react';
import type { Column } from '@/hooks/useColumnOrder';
import SelectionCell from '../SelectionCell';
import { ProjectType } from '@/types/enums';

interface RowLayoutProps {
  project: Project;
  columns: Column[];
  isSelected: boolean;
  isExpanded?: boolean;
  onSelect: (checked: boolean) => void;
  onShowOptionsMenu: (projectId: ProjectId, position: { top: number; left: number }, event?: React.MouseEvent) => void;
  onRowClick: (e: React.MouseEvent) => void;
  renderCell: (columnId: string) => React.ReactNode;
  isDragOver?: boolean;
  onDragStart?: (e: React.DragEvent, projectId: ProjectId) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDragLeave?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, project: Project) => void;
  handleToggleTasks?: (e: React.MouseEvent) => void;
}

export const RowLayout: React.FC<RowLayoutProps> = ({
  project,
  columns,
  isSelected,
  isExpanded = false,
  onSelect,
  onShowOptionsMenu,
  onRowClick,
  renderCell,
  isDragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  handleToggleTasks
}) => {
  const handleOptions = (e: React.MouseEvent) => {
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const position = {
      top: rect.bottom + window.scrollY,
      left: rect.left + window.scrollX
    };
    onShowOptionsMenu(project.id, position, e);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[DragDrop RowLayout] 📍 OVER: ${project.name} (${project.type})`);
    onDragOver?.(e);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    console.log(`[DragDrop RowLayout] 👋 LEAVE: ${project.name}`);
    // Clear visual feedback when drag leaves
    onDragLeave?.(e);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(`[DragDrop RowLayout] 💧 DROP on: ${project.name} (${project.type})`);
    onDrop?.(e, project);
  };

  const rowClasses = `group border-b border-gray-100 hover:bg-gray-50/50 transition-colors duration-150 cursor-pointer ${
    isDragOver ? 'bg-blue-50' : ''
  }`;

  return (
    <tr 
      onClick={onRowClick}
      className={rowClasses}
      draggable={project.type === ProjectType.SUB}
      onDragStart={(e) => onDragStart?.(e, project.id)}
      onDragEnd={onDragEnd}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <td className="px-4 py-2 w-12">
        <SelectionCell
          project={project}
          isExpanded={isExpanded}
          isSelected={isSelected}
          onSelect={onSelect}
          handleToggleTasks={handleToggleTasks || (() => {})}
          handleMasterToggle={() => {}}
        />
      </td>
      
      {columns.map((column) => {
        const content = renderCell(column.id);
        if (column.visible === false || content === null) return null;
        
        // All our cell components return td elements now, so just add key
        if (React.isValidElement(content)) {
          // Clone element to add key prop
          return React.cloneElement(content, { key: column.id });
        }
        
        // Fallback for non-element content
        return (
          <td 
            key={column.id} 
            className={`px-4 py-2 text-sm ${column.id === 'name' ? 'font-medium' : 'text-gray-600'}`}
            style={{ width: column.width }}
          >
            {content}
          </td>
        );
      })}
      
      <td className="px-4 py-2 text-sm w-12">
        <button
          onClick={handleOptions}
          className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition-colors"
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
      </td>
    </tr>
  );
};